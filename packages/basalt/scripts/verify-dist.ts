import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

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
let mapCount = 0;
for (const entry of entries) {
	const js = join(distRoot, `${entry}.js`);
	const dts = join(distRoot, `${entry}.d.ts`);
	const map = join(distRoot, `${entry}.js.map`);
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
	if (existsSync(map)) {
		mapCount += 1;
	} else {
		fail(`missing ${entry}.js.map`);
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

for (const file of walk(distRoot)) {
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

if (errors.length > 0) {
	console.error(errors.join("\n"));
	process.exit(1);
}

console.log(
	`verified entries=${entries.length} js=${jsCount} dts=${dtsCount} maps=${mapCount} client=${clientCount} css=${expectedCss.length}`,
);
