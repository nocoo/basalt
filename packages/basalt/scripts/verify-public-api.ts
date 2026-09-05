import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript-api";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const baselinePath = join(packageRoot, "public-api-baseline.json");

if (!existsSync(baselinePath)) {
	console.error("public-api-baseline.json missing");
	process.exit(1);
}

export interface BaselineSymbol {
	name: string;
	value: boolean;
	type: boolean;
}

export interface BaselineEntry {
	path: string;
	symbols: BaselineSymbol[];
}

export interface BaselineDoc {
	packageVersion: string;
	sourceBaseline: string;
	capturedCommit?: string;
	entries: BaselineEntry[];
	cssExports?: string[];
}

export type ExportTargetResolved = {
	typesTarget?: string;
	importTarget?: string;
};

/**
 * Resolves an import subpath against package.json "exports".
 * Precedence: exact match first, then wildcards (./prefix/*), or null if unmatched.
 */
export function resolvePackageExportTarget(
	subpath: string,
	exportsField: Record<string, unknown>,
): ExportTargetResolved | null {
	// Normalize subpath to relative format with leading "."
	const rel = subpath === "." ? "." : subpath.startsWith("./") ? subpath : `./${subpath}`;

	// 1. Exact match
	if (rel in exportsField) {
		const val = exportsField[rel];
		if (typeof val === "string") {
			return { importTarget: val };
		}
		if (val && typeof val === "object") {
			const obj = val as Record<string, unknown>;
			return {
				typesTarget: typeof obj.types === "string" ? obj.types : undefined,
				importTarget: typeof obj.import === "string" ? obj.import : undefined,
			};
		}
		return null;
	}

	// 2. Wildcard matches (longest prefix match)
	let bestMatch: { pattern: string; suffix: string } | null = null;
	for (const pattern of Object.keys(exportsField)) {
		if (pattern.includes("*")) {
			const prefix = pattern.slice(0, pattern.indexOf("*"));
			if (rel.startsWith(prefix)) {
				const suffix = rel.slice(prefix.length);
				if (!bestMatch || prefix.length > bestMatch.pattern.indexOf("*")) {
					bestMatch = { pattern, suffix };
				}
			}
		}
	}

	if (bestMatch) {
		const val = exportsField[bestMatch.pattern];
		if (typeof val === "string") {
			return { importTarget: val.replace("*", bestMatch.suffix) };
		}
		if (val && typeof val === "object") {
			const obj = val as Record<string, unknown>;
			return {
				typesTarget:
					typeof obj.types === "string" ? obj.types.replace("*", bestMatch.suffix) : undefined,
				importTarget:
					typeof obj.import === "string" ? obj.import.replace("*", bestMatch.suffix) : undefined,
			};
		}
	}

	return null;
}

/**
 * Parses a JavaScript file AST to discover named runtime exports.
 */
export function getRuntimeExportNamesFromJs(filePath: string, content: string): Set<string> {
	const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
	const names = new Set<string>();

	for (const stmt of sf.statements) {
		if (ts.isExportDeclaration(stmt)) {
			if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
				for (const el of stmt.exportClause.elements) {
					names.add(el.name.text);
				}
			}
		} else if (
			ts.canHaveModifiers(stmt) &&
			ts.getModifiers(stmt)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
		) {
			if (ts.isVariableStatement(stmt)) {
				for (const decl of stmt.declarationList.declarations) {
					if (ts.isIdentifier(decl.name)) {
						names.add(decl.name.text);
					}
				}
			} else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
				names.add(stmt.name.text);
			} else if (ts.isClassDeclaration(stmt) && stmt.name) {
				names.add(stmt.name.text);
			}
		}
	}

	return names;
}

export function runPublicApiVerification(
	customBaseline?: BaselineDoc,
	customPkg?: { exports: Record<string, unknown> },
	customPackageRoot?: string,
): { errors: string[]; checkedPaths: number; checkedSymbols: number } {
	const baseline =
		customBaseline ?? (JSON.parse(readFileSync(baselinePath, "utf8")) as BaselineDoc);
	const targetPackageRoot = customPackageRoot ?? packageRoot;
	const pkg =
		customPkg ??
		(JSON.parse(readFileSync(join(targetPackageRoot, "package.json"), "utf8")) as {
			exports: Record<string, unknown>;
		});

	const errors: string[] = [];

	// 1. Verify CSS exports
	const expectedCss = baseline.cssExports ?? [
		"@nocoo/basalt/styles",
		"@nocoo/basalt/styles/tailwind",
		"@nocoo/basalt/styles/standalone",
	];
	for (const cssExport of expectedCss) {
		const subpath = cssExport.replace("@nocoo/basalt", ".");
		const resolved = resolvePackageExportTarget(subpath, pkg.exports);
		const cssTarget = resolved?.importTarget;
		if (!cssTarget || typeof cssTarget !== "string") {
			errors.push(`missing or invalid CSS export in package.json: ${cssExport} -> ${subpath}`);
			continue;
		}
		const fullCssPath = resolve(targetPackageRoot, cssTarget);
		if (!existsSync(fullCssPath)) {
			errors.push(`CSS export target file does not exist: ${fullCssPath}`);
			continue;
		}
		if (!fullCssPath.endsWith(".css")) {
			errors.push(`CSS export target must be a .css file, got: ${fullCssPath}`);
			continue;
		}
		const stat = statSync(fullCssPath);
		if (stat.size === 0) {
			errors.push(`CSS export target file is empty: ${fullCssPath}`);
		}
	}

	// 2. Resolve export targets for every baseline entry
	const pathTargets = new Map<string, { fullDtsPath: string; fullJsPath: string }>();
	const dtsFilesForCompiler: string[] = [];

	for (const entry of baseline.entries) {
		const subpath = entry.path === "@nocoo/basalt" ? "." : entry.path.replace("@nocoo/basalt/", "");
		const resolved = resolvePackageExportTarget(subpath, pkg.exports);

		if (!resolved) {
			errors.push(`baseline path ${entry.path} is not covered by package.json exports`);
			continue;
		}
		if (!resolved.typesTarget) {
			errors.push(`baseline path ${entry.path} has no resolved types target`);
			continue;
		}
		if (!resolved.importTarget) {
			errors.push(`baseline path ${entry.path} has no resolved import target`);
			continue;
		}

		const fullDtsPath = resolve(targetPackageRoot, resolved.typesTarget);
		const fullJsPath = resolve(targetPackageRoot, resolved.importTarget);

		let missing = false;
		if (!existsSync(fullDtsPath)) {
			errors.push(`missing types file for ${entry.path}: ${fullDtsPath}`);
			missing = true;
		} else {
			dtsFilesForCompiler.push(fullDtsPath);
		}
		if (!existsSync(fullJsPath)) {
			errors.push(`missing JS file for ${entry.path}: ${fullJsPath}`);
			missing = true;
		}

		if (!missing) {
			pathTargets.set(entry.path, { fullDtsPath, fullJsPath });
		}
	}

	// 3. Programmatic symbol and type/value checking via typescript-api
	let checkedPaths = 0;
	let checkedSymbols = 0;

	if (dtsFilesForCompiler.length > 0) {
		const program = ts.createProgram(dtsFilesForCompiler, {
			target: ts.ScriptTarget.Latest,
			moduleResolution: ts.ModuleResolutionKind.NodeNext,
		});
		const checker = program.getTypeChecker();

		for (const entry of baseline.entries) {
			const target = pathTargets.get(entry.path);
			if (!target || !existsSync(target.fullDtsPath) || !existsSync(target.fullJsPath)) {
				continue;
			}
			const sf = program.getSourceFile(target.fullDtsPath);
			if (!sf) {
				errors.push(
					`TypeScript compiler could not load source file for ${entry.path}: ${target.fullDtsPath}`,
				);
				continue;
			}
			const modSym = checker.getSymbolAtLocation(sf);
			if (!modSym) {
				errors.push(`TypeScript compiler could not find module symbol for ${entry.path}`);
				continue;
			}
			const expList = checker.getExportsOfModule(modSym);
			const expMap = new Map(expList.map((e) => [e.getName(), e]));

			// Parse actual runtime JS exports for this entrypoint
			const jsContent = readFileSync(target.fullJsPath, "utf8");
			const jsRuntimeExports = getRuntimeExportNamesFromJs(target.fullJsPath, jsContent);

			for (const expected of entry.symbols) {
				checkedSymbols++;
				const rawSym = expMap.get(expected.name);
				if (!rawSym) {
					errors.push(`${entry.path}: missing exported symbol "${expected.name}"`);
					continue;
				}
				const sym = rawSym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(rawSym) : rawSym;
				const flags = sym.getFlags();
				const isVal = Boolean(flags & ts.SymbolFlags.Value);
				const isType = Boolean(
					flags & (ts.SymbolFlags.Type | ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias),
				);

				if (expected.value) {
					if (!isVal) {
						errors.push(
							`${entry.path}: symbol "${expected.name}" expected value=true in declaration, but has flags ${flags}`,
						);
					}
					// Must also exist in compiled JavaScript runtime output
					if (!jsRuntimeExports.has(expected.name)) {
						errors.push(
							`${entry.path}: runtime symbol "${expected.name}" missing from compiled JS artifact: ${target.fullJsPath}`,
						);
					}
				}
				if (expected.type && !isType) {
					errors.push(
						`${entry.path}: symbol "${expected.name}" expected type=true, but flags=${flags}`,
					);
				}
			}
			checkedPaths++;
		}
	}

	return { errors, checkedPaths, checkedSymbols };
}

if (import.meta.main) {
	const { errors, checkedPaths, checkedSymbols } = runPublicApiVerification();
	if (errors.length > 0) {
		console.error(`Public API baseline verification failed with ${errors.length} errors:`);
		console.error(errors.slice(0, 20).join("\n"));
		process.exit(1);
	}
	console.log(`verified public API baseline: ${checkedPaths} paths, ${checkedSymbols} symbols`);
}
