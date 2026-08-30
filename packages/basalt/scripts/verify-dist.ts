import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { collectModuleSpecifiers, isRelativeSpecifier } from "./rewrite-declarations";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const srcRoot = join(packageRoot, "src");
const distRoot = join(packageRoot, "dist");
const errors: string[] = [];

function fail(message: string) {
	errors.push(message);
}

function walk(dir: string): string[] {
	if (!existsSync(dir)) {
		return [];
	}
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk(path));
			continue;
		}
		files.push(path);
	}
	return files;
}

function isProductionSource(file: string) {
	const rel = relative(srcRoot, file);
	return /\.(ts|tsx)$/.test(file) && !/\.(test|spec)\./.test(file) && !rel.startsWith("styles/");
}

function startsWithUseClient(file: string) {
	return readFileSync(file, "utf8").startsWith('"use client"');
}

if (!existsSync(distRoot)) {
	console.error("dist does not exist");
	process.exit(1);
}

const entries = walk(srcRoot)
	.filter(isProductionSource)
	.map((file) => relative(srcRoot, file).replace(/\.(ts|tsx)$/, ""))
	.sort();

let jsCount = 0;
let dtsCount = 0;
for (const entry of entries) {
	const js = join(distRoot, `${entry}.js`);
	const dts = join(distRoot, `${entry}.d.ts`);
	if (existsSync(js)) {
		jsCount += 1;
	} else {
		fail(`missing ${entry}.js`);
	}
	if (existsSync(dts)) {
		dtsCount += 1;
	} else {
		fail(`missing ${entry}.d.ts`);
	}
}

const indexJs = join(distRoot, "index.js");
if (!existsSync(indexJs) || !startsWithUseClient(indexJs)) {
	fail('dist/index.js must start with "use client"');
}

const componentJs = walk(join(distRoot, "components"))
	.filter((file) => file.endsWith(".js"))
	.sort();
let clientCount = existsSync(indexJs) && startsWithUseClient(indexJs) ? 1 : 0;
for (const file of componentJs) {
	if (startsWithUseClient(file)) {
		clientCount += 1;
		continue;
	}
	fail(`${relative(distRoot, file)} must start with "use client"`);
}

const expectedCss = ["standalone.css", "tailwind.css", "tokens.css"];
const stylesDir = join(distRoot, "styles");
const actualCss = existsSync(stylesDir)
	? readdirSync(stylesDir)
			.filter((name) => !name.startsWith("."))
			.sort()
	: [];
if (actualCss.join(",") !== expectedCss.join(",")) {
	fail(
		`dist/styles must contain exactly ${expectedCss.join(", ")}; got ${actualCss.join(", ") || "(missing)"}`,
	);
} else {
	const tailwind = readFileSync(join(stylesDir, "tailwind.css"), "utf8");
	if (!tailwind.includes("./tokens.css")) {
		fail("dist/styles/tailwind.css must reference ./tokens.css");
	}
}

const distFiles = walk(distRoot);
for (const file of distFiles) {
	const rel = relative(distRoot, file);
	const name = basename(file);
	if (/\.(test|spec)\./.test(name)) {
		fail(`test artifact ${rel}`);
	}
	if (name === "standalone.source.css") {
		fail(`forbidden ${rel}`);
	}
	if (name.endsWith(".tsx") || (name.endsWith(".ts") && !name.endsWith(".d.ts"))) {
		fail(`source ${rel}`);
	}
}

function sourceMappingURL(js: string) {
	return js.match(/[#@]\s*sourceMappingURL=(\S+)/)?.[1];
}

const jsFiles = distFiles.filter((file) => file.endsWith(".js"));
for (const jsFile of jsFiles) {
	const url = sourceMappingURL(readFileSync(jsFile, "utf8"));
	if (!url) {
		continue;
	}
	const target = join(dirname(jsFile), url);
	if (!existsSync(target)) {
		fail(`${relative(distRoot, jsFile)} sourceMappingURL ${url} is missing`);
	}
}

const mapFiles = distFiles.filter((file) => file.endsWith(".js.map")).sort();
let mapCount = 0;
for (const mapFile of mapFiles) {
	const rel = relative(distRoot, mapFile);
	const jsFile = mapFile.slice(0, -".map".length);
	if (!existsSync(jsFile)) {
		fail(`${rel} has no matching JS`);
		continue;
	}
	let parsed: { version?: unknown; sources?: unknown; mappings?: unknown };
	try {
		parsed = JSON.parse(readFileSync(mapFile, "utf8")) as typeof parsed;
	} catch {
		fail(`${rel} is not valid JSON`);
		continue;
	}
	if (parsed.version !== 3) {
		fail(`${rel} version must be 3`);
		continue;
	}
	if (!Array.isArray(parsed.sources) || parsed.sources.length === 0) {
		fail(`${rel} sources must be non-empty`);
		continue;
	}
	if (typeof parsed.mappings !== "string" || parsed.mappings.length === 0) {
		fail(`${rel} mappings must be non-empty`);
		continue;
	}
	mapCount += 1;
}

for (const rel of [
	"components/button.js.map",
	"providers/theme.js.map",
	"charts/donut.js.map",
	"utils/cn.js.map",
]) {
	if (!existsSync(join(distRoot, rel))) {
		fail(`missing required map ${rel}`);
	}
}

const EXPLICIT_EXT = /\.(?:js|mjs|cjs|json|css|d\.ts)$/;
let specifierCount = 0;
for (const dts of distFiles.filter((file) => file.endsWith(".d.ts"))) {
	const rel = relative(distRoot, dts);
	const specs = collectModuleSpecifiers(readFileSync(dts, "utf8")).filter((item) =>
		isRelativeSpecifier(item.value),
	);
	for (const spec of specs) {
		specifierCount += 1;
		if (!EXPLICIT_EXT.test(spec.value)) {
			fail(`${rel} extensionless specifier ${spec.value}`);
			continue;
		}
		if (!spec.value.endsWith(".js")) {
			continue;
		}
		const targetJs = join(dirname(dts), spec.value);
		const targetDts = targetJs.replace(/\.js$/, ".d.ts");
		if (!existsSync(targetJs)) {
			fail(`${rel} missing JS for ${spec.value}`);
		}
		if (!existsSync(targetDts)) {
			fail(`${rel} missing declaration for ${spec.value}`);
		}
	}
}

if (errors.length > 0) {
	console.error(errors.join("\n"));
	process.exit(1);
}

console.log(
	`verified entries=${entries.length} js=${jsCount} dts=${dtsCount} maps=${mapCount} client=${clientCount} css=${expectedCss.length} specifiers=${specifierCount}`,
);
