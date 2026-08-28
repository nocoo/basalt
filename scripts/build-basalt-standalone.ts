import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = resolve(root, "packages/basalt");
const inputPath = resolve(packageRoot, "src/styles/standalone.source.css");
const outputPath = resolve(packageRoot, "src/styles/standalone.css");

function walk(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk(path));
			continue;
		}
		if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.includes(".test.")) {
			files.push(path);
		}
	}
	return files;
}

function classCandidates(source: string): string[] {
	const tokens: string[] = [];
	for (const match of source.matchAll(/["'`]([^"'`]+)["'`]/g)) {
		for (const token of match[1].split(/\s+/)) {
			if (token && !token.includes("${") && token.length < 200) {
				tokens.push(token);
			}
		}
	}
	return tokens;
}

const candidates = [
	...new Set(
		walk(resolve(packageRoot, "src")).flatMap((file) =>
			classCandidates(readFileSync(file, "utf8")),
		),
	),
];

async function loadStylesheet(id: string, base: string) {
	if (
		id === "tailwindcss/utilities" ||
		id === "tailwindcss/theme" ||
		id === "tailwindcss/preflight"
	) {
		const mapped = {
			"tailwindcss/utilities": "tailwindcss/utilities.css",
			"tailwindcss/theme": "tailwindcss/theme.css",
			"tailwindcss/preflight": "tailwindcss/preflight.css",
		}[id];
		const path = require.resolve(mapped);
		return { path, base: dirname(path), content: readFileSync(path, "utf8") };
	}
	const path = resolve(base, id);
	return { path, base: dirname(path), content: readFileSync(path, "utf8") };
}

const compiler = await compile(readFileSync(inputPath, "utf8"), {
	base: dirname(inputPath),
	from: inputPath,
	loadStylesheet,
});

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
	outputPath,
	`/* Generated from standalone.source.css. Do not edit. */\n${compiler.build(candidates)}`,
);
