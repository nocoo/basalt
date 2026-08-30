import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(packageRoot));
const distRoot = join(packageRoot, "dist");
const errors: string[] = [];

function fail(message: string) {
	errors.push(message);
}

function listTgz(dir: string) {
	if (!existsSync(dir)) {
		return [];
	}
	return readdirSync(dir)
		.filter((name) => name.endsWith(".tgz"))
		.map((name) => join(dir, name))
		.sort();
}

function tgzSnapshot() {
	return [...listTgz(packageRoot), ...listTgz(repoRoot)].sort();
}

function normalizePackPath(value: string) {
	return value.replace(/^\.\//, "").replace(/^package\//, "");
}

function parsePackJson(stdout: string) {
	const trimmed = stdout.trim();
	const start = trimmed.indexOf("{");
	const end = trimmed.lastIndexOf("}");
	if (start < 0 || end <= start) {
		throw new Error("npm pack did not print JSON");
	}
	return JSON.parse(trimmed.slice(start, end + 1)) as {
		filename?: string;
		files?: Array<{ path?: string }>;
	};
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

function basenames(dir: string, ext: string) {
	if (!existsSync(dir)) {
		return [];
	}
	return readdirSync(dir)
		.filter((name) => name.endsWith(ext) && !name.endsWith(".map"))
		.map((name) => name.slice(0, -ext.length))
		.sort();
}

const pkg = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as {
	name: string;
	version: string;
	private: boolean;
	exports: Record<string, string | { types?: string; import?: string }>;
};

if (pkg.name !== "@nocoo/basalt") {
	fail(`name must stay @nocoo/basalt; got ${pkg.name}`);
}
if (pkg.version !== "0.0.0") {
	fail(`version must stay 0.0.0; got ${pkg.version}`);
}
if (pkg.private !== true) {
	fail("private must stay true");
}

if (!existsSync(distRoot) || walk(distRoot).length === 0) {
	fail("dist must exist and be non-empty before pack:check");
}

const beforeTgz = tgzSnapshot();
const packed = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
	cwd: packageRoot,
	encoding: "utf8",
});
const afterTgz = tgzSnapshot();

if (packed.status !== 0) {
	fail(`npm pack --dry-run failed (${packed.status}): ${packed.stderr || packed.stdout}`);
}

const created = afterTgz.filter((file) => !beforeTgz.includes(file));
if (created.length > 0) {
	fail(`dry-run wrote tarball: ${created.map((file) => relative(repoRoot, file)).join(", ")}`);
}

let packFiles: string[] = [];
try {
	const parsed = parsePackJson(packed.stdout);
	packFiles = (parsed.files ?? [])
		.map((file) => normalizePackPath(file.path ?? ""))
		.filter(Boolean)
		.sort();
} catch (error) {
	fail(error instanceof Error ? error.message : String(error));
}

const packedSet = new Set(packFiles);
const metadata = ["package.json", "README.md", "LICENSE"];
for (const file of metadata) {
	if (!packedSet.has(file)) {
		fail(`pack missing ${file}`);
	}
}

const distFiles = packFiles.filter((file) => file === "dist" || file.startsWith("dist/"));
if (distFiles.length === 0) {
	fail("pack dist is empty");
}

for (const file of packFiles) {
	if (file === "package.json" || file === "README.md" || file === "LICENSE") {
		continue;
	}
	if (file === "dist" || file.startsWith("dist/")) {
		continue;
	}
	fail(`pack path not on whitelist: ${file}`);
	if (file === "src" || file.startsWith("src/")) {
		fail(`src packed: ${file}`);
	}
}

for (const file of packFiles) {
	if (file === "src" || file.startsWith("src/")) {
		fail(`src packed: ${file}`);
	}
	if (/\.(test|spec)\./.test(file)) {
		fail(`test packed: ${file}`);
	}
	const name = file.slice(file.lastIndexOf("/") + 1);
	if (
		file.startsWith("scripts/") ||
		/^vite\.config/.test(name) ||
		/^tsconfig/.test(name) ||
		/\.config\./.test(name)
	) {
		fail(`build config/script packed: ${file}`);
	}
}

function exportTarget(value: string) {
	return value.replace(/^\.\//, "");
}

function starCount(value: string) {
	return value.split("*").length - 1;
}

function starDir(pattern: string) {
	const normalized = exportTarget(pattern);
	const index = normalized.lastIndexOf("/*");
	if (index < 0) {
		return "";
	}
	return normalized.slice(0, index);
}

function applyStar(pattern: string, name: string) {
	return exportTarget(pattern.replace("*", name));
}

const exactTargets: string[] = [];
const wildcards: Array<{ key: string; types: string; js: string }> = [];
for (const [key, value] of Object.entries(pkg.exports)) {
	if (key.includes("*")) {
		if (typeof value === "string") {
			fail(`${key} wildcard must be types/import object`);
			continue;
		}
		wildcards.push({ key, types: value.types ?? "", js: value.import ?? "" });
		continue;
	}
	if (typeof value === "string") {
		const target = exportTarget(value);
		exactTargets.push(target);
		if (target.startsWith("src/")) {
			fail(`${key} export target points at src`);
		}
		continue;
	}
	if (value.types) {
		exactTargets.push(exportTarget(value.types));
		if (value.types.includes("src/")) {
			fail(`${key} types points at src`);
		}
	}
	if (value.import) {
		exactTargets.push(exportTarget(value.import));
		if (value.import.includes("src/")) {
			fail(`${key} import points at src`);
		}
	}
}

for (const target of exactTargets) {
	if (!packedSet.has(target)) {
		fail(`exact export target not packed: ${target}`);
	}
}

let wildcardPairs = 0;
for (const item of wildcards) {
	if (starCount(item.types) !== 1 || !item.types.endsWith("/*.d.ts")) {
		fail(`${item.key} types must be a /*.d.ts wildcard`);
		continue;
	}
	if (starCount(item.js) !== 1 || !item.js.endsWith("/*.js")) {
		fail(`${item.key} import must be a /*.js wildcard`);
		continue;
	}
	if (item.types.includes("src/") || item.js.includes("src/")) {
		fail(`${item.key} export target points at src`);
		continue;
	}
	const typesDir = starDir(item.types);
	const importDir = starDir(item.js);
	const dtsNames = basenames(join(packageRoot, typesDir), ".d.ts");
	const jsNames = basenames(join(packageRoot, importDir), ".js");
	if (dtsNames.join("\0") !== jsNames.join("\0")) {
		fail(`${item.key} types/import basenames are not paired`);
		continue;
	}
	for (const name of dtsNames) {
		const typesPath = applyStar(item.types, name);
		const importPath = applyStar(item.js, name);
		wildcardPairs += 1;
		if (!packedSet.has(typesPath)) {
			fail(`wildcard types not packed: ${typesPath}`);
		}
		if (!packedSet.has(importPath)) {
			fail(`wildcard import not packed: ${importPath}`);
		}
	}
}

if (errors.length > 0) {
	console.error(errors.join("\n"));
	process.exit(1);
}

const metaCount = metadata.filter((file) => packedSet.has(file)).length;
console.log(
	`packed files=${packFiles.length} dist=${distFiles.length} metadata=${metaCount} exact-exports=${exactTargets.length} wildcard-pairs=${wildcardPairs}`,
);
