import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectModuleSpecifiers, isRelativeSpecifier } from "./rewrite-declarations";

const JS_EXT = /\.(?:js|mjs|cjs)$/;
const FORBIDDEN_FILES = new Set(["components/date-picker.js", "components/data-table.js"]);
const FORBIDDEN_EXTERNALS = ["recharts", "react-day-picker", "@tanstack/react-table"] as const;

export type FileIo = {
	readFile: (file: string) => string;
	exists: (file: string) => boolean;
};

export type EsmClosure = {
	files: string[];
	externals: string[];
};

const fsIo: FileIo = {
	readFile: (file) => readFileSync(file, "utf8"),
	exists: (file) => existsSync(file),
};

export function resolveRelativeSpecifier(fromFile: string, specifier: string) {
	return normalize(join(dirname(fromFile), specifier));
}

export function collectEsmClosure(entryFile: string, io: FileIo = fsIo): EsmClosure {
	const files: string[] = [];
	const externals = new Set<string>();
	const queue = [normalize(entryFile)];
	const seen = new Set<string>();

	while (queue.length > 0) {
		const file = queue.shift();
		if (!file || seen.has(file)) {
			continue;
		}
		seen.add(file);
		files.push(file);
		if (!JS_EXT.test(file)) {
			continue;
		}
		if (!io.exists(file)) {
			throw new Error(`missing module ${file}`);
		}
		for (const spec of collectModuleSpecifiers(io.readFile(file))) {
			if (isRelativeSpecifier(spec.value)) {
				const target = resolveRelativeSpecifier(file, spec.value);
				if (!seen.has(target)) {
					queue.push(target);
				}
				continue;
			}
			externals.add(spec.value);
		}
	}

	return { files, externals: [...externals].sort() };
}

export function posixRel(from: string, file: string) {
	return relative(resolve(from), resolve(file)).replace(/\\/g, "/");
}

export function isForbiddenExternal(specifier: string) {
	return FORBIDDEN_EXTERNALS.some((pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`));
}

export function isForbiddenRootFile(rel: string) {
	return rel.startsWith("charts/") || FORBIDDEN_FILES.has(rel);
}

export function rootBoundaryViolations(closure: EsmClosure, distRoot: string) {
	const errors: string[] = [];
	for (const file of closure.files) {
		const rel = posixRel(distRoot, file);
		if (isForbiddenRootFile(rel)) {
			errors.push(`root closure includes ${rel}`);
		}
	}
	for (const specifier of closure.externals) {
		if (isForbiddenExternal(specifier)) {
			errors.push(`root closure imports ${specifier}`);
		}
	}
	return errors;
}

export function verifyRootBoundary(distRoot: string, io: FileIo = fsIo) {
	const entry = join(distRoot, "index.js");
	if (!io.exists(entry)) {
		throw new Error("dist/index.js does not exist");
	}
	const closure = collectEsmClosure(entry, io);
	const errors = rootBoundaryViolations(closure, distRoot);
	if (errors.length > 0) {
		throw new Error(errors.join("\n"));
	}
	return closure;
}

if (import.meta.main) {
	const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
	const closure = verifyRootBoundary(join(packageRoot, "dist"));
	console.log(`root closure files=${closure.files.length} externals=${closure.externals.length}`);
}
