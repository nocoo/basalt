import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const EXPLICIT_EXT = /\.(?:js|mjs|cjs|json|css|d\.ts)$/;

export type ModuleSpecifier = {
	value: string;
	start: number;
	end: number;
};

function isIdentStart(ch: string) {
	return /[A-Za-z_$]/.test(ch);
}

function isIdentPart(ch: string) {
	return /[A-Za-z0-9_$]/.test(ch);
}

function skipTrivia(source: string, index: number) {
	let i = index;
	while (i < source.length) {
		const ch = source[i];
		if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
			i += 1;
			continue;
		}
		if (ch === "/" && source[i + 1] === "/") {
			i += 2;
			while (i < source.length && source[i] !== "\n") {
				i += 1;
			}
			continue;
		}
		if (ch === "/" && source[i + 1] === "*") {
			i += 2;
			while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
				i += 1;
			}
			i = Math.min(source.length, i + 2);
			continue;
		}
		break;
	}
	return i;
}

function readString(source: string, index: number): ModuleSpecifier | null {
	const quote = source[index];
	if (quote !== '"' && quote !== "'") {
		return null;
	}
	let i = index + 1;
	let value = "";
	while (i < source.length) {
		const ch = source[i];
		if (ch === "\\") {
			value += source[i + 1] ?? "";
			i += 2;
			continue;
		}
		if (ch === quote) {
			return { value, start: index, end: i + 1 };
		}
		value += ch;
		i += 1;
	}
	return null;
}

function readIdent(source: string, index: number) {
	if (!isIdentStart(source[index] ?? "")) {
		return null;
	}
	let i = index + 1;
	while (i < source.length && isIdentPart(source[i] ?? "")) {
		i += 1;
	}
	return { value: source.slice(index, i), start: index, end: i };
}

export function collectModuleSpecifiers(source: string): ModuleSpecifier[] {
	const specifiers: ModuleSpecifier[] = [];
	let i = 0;
	while (i < source.length) {
		i = skipTrivia(source, i);
		if (i >= source.length) {
			break;
		}
		if (source[i] === '"' || source[i] === "'") {
			const skipped = readString(source, i);
			i = skipped ? skipped.end : i + 1;
			continue;
		}
		const ident = readIdent(source, i);
		if (ident) {
			i = ident.end;
			if (ident.value === "from") {
				const next = skipTrivia(source, i);
				const spec = readString(source, next);
				if (spec) {
					specifiers.push(spec);
					i = spec.end;
				}
				continue;
			}
			if (ident.value === "import") {
				const next = skipTrivia(source, i);
				const sideEffect = readString(source, next);
				if (sideEffect) {
					specifiers.push(sideEffect);
					i = sideEffect.end;
					continue;
				}
				if (source[next] === "(") {
					const inner = skipTrivia(source, next + 1);
					const spec = readString(source, inner);
					if (spec) {
						specifiers.push(spec);
						i = spec.end;
					}
				}
			}
			continue;
		}
		i += 1;
	}
	return specifiers;
}

export function isRelativeSpecifier(value: string) {
	return value.startsWith("./") || value.startsWith("../");
}

export function rewriteRelativeSpecifier(value: string) {
	if (!isRelativeSpecifier(value) || EXPLICIT_EXT.test(value)) {
		return value;
	}
	return `${value}.js`;
}

export function rewriteDeclarationText(source: string) {
	const specifiers = collectModuleSpecifiers(source);
	let rewritten = 0;
	let text = source;
	for (const spec of [...specifiers].sort((a, b) => b.start - a.start)) {
		const next = rewriteRelativeSpecifier(spec.value);
		if (next === spec.value) {
			continue;
		}
		rewritten += 1;
		const quote = text[spec.start];
		text = `${text.slice(0, spec.start)}${quote}${next}${quote}${text.slice(spec.end)}`;
	}
	return { text, rewritten, specifiers };
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

export function rewriteDeclarationFiles(distRoot: string) {
	let rewritten = 0;
	let specifiers = 0;
	let files = 0;
	for (const file of walk(distRoot).filter((path) => path.endsWith(".d.ts"))) {
		const source = readFileSync(file, "utf8");
		const result = rewriteDeclarationText(source);
		specifiers += result.specifiers.filter((item) => isRelativeSpecifier(item.value)).length;
		if (result.rewritten === 0) {
			continue;
		}
		files += 1;
		rewritten += result.rewritten;
		writeFileSync(file, result.text);
	}
	return { rewritten, specifiers, files };
}

if (import.meta.main) {
	const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
	const result = rewriteDeclarationFiles(join(packageRoot, "dist"));
	console.log(
		`rewrote declarations rewritten=${result.rewritten} specifiers=${result.specifiers} files=${result.files}`,
	);
}
