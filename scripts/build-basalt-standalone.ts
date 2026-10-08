import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { classCandidates } from "./class-candidates";

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
		if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
			files.push(path);
		}
	}
	return files.sort();
}

const candidates = [
	...new Set([
		...["card", "layout"].flatMap((role) =>
			["", "-sm", "-lg", "-xl"].flatMap((size) =>
				["p", "px", "py", "m", "mx", "my", "gap", "gap-x", "gap-y", "space-x", "space-y"].map(
					(utility) => `${utility}-basalt-${role}${size}`,
				),
			),
		),
		"sr-only",
		"sticky",
		"order-last",
		"w-[4.25rem]",
		"h-7",
		"mb-basalt-space-lg",
		"appearance-none",
		"border-0",
		"bg-transparent",
		"p-0",
		"font-inherit",
		"text-inherit",
		"cursor-pointer",
		"max-h-[18.75rem]",
		"overflow-x-hidden",
		"overflow-y-hidden",
		"data-[disabled=true]:pointer-events-none",
		"data-[disabled=true]:opacity-50",
		...walk(resolve(packageRoot, "src")).flatMap((file) =>
			classCandidates(readFileSync(file, "utf8")),
		),
	]),
].sort();

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
