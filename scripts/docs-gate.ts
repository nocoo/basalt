import { spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path, { join } from "node:path";
import * as ts from "typescript-api";
import { createServer } from "vite";
import { CATALOG, catalogBarrelImport, catalogGranularImport } from "../src/pages/ui/catalog";
import type { CatalogPageContent } from "../src/pages/ui/catalog-content";
import { CATALOG_PAGE_STATUS } from "../src/pages/ui/generated/catalog-page-status";
import { materializeApplicationRecipes } from "./consumer-recipes";

export type CodeFenceKind = "compile" | "excerpt";

export type ScannedDocFence = {
	file: string;
	line: number;
	lang: string;
	kind: CodeFenceKind;
	id: string;
	reason?: string;
	rawHeader: string;
	code: string;
};

export const REQUIRED_DOC_FILES = [
	"README.md",
	"packages/basalt/README.md",
	"INTEGRATION.md",
	"packages/basalt/ai/USAGE.md",
	"packages/basalt/ai/COMPATIBILITY.md",
	"packages/basalt/ai/INTEGRATION.md",
] as const;

export function discoverDocumentationFiles(repoRoot = process.cwd()): string[] {
	const files = new Set<string>();

	// 1. Mandatory core doc files (must exist)
	for (const req of REQUIRED_DOC_FILES) {
		const absPath = join(repoRoot, req);
		if (!existsSync(absPath)) {
			throw new Error(`required documentation file missing: ${req}`);
		}
		files.add(req);
	}

	// 2. Automatically discover all Markdown files under packages/basalt/ai recursively
	const aiDir = join(repoRoot, "packages/basalt/ai");
	if (existsSync(aiDir)) {
		const walkDir = (dir: string, baseRel: string) => {
			const entries = readdirSync(dir, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = join(dir, entry.name);
				const relPath = join(baseRel, entry.name);
				if (entry.isDirectory()) {
					walkDir(fullPath, relPath);
				} else if (entry.isFile() && entry.name.endsWith(".md")) {
					files.add(relPath);
				}
			}
		};
		walkDir(aiDir, "packages/basalt/ai");
	}

	return Array.from(files).sort();
}

/**
 * Scans markdown files by line looking for opening (```lang ...) and closing (```) fences.
 * Every tsx or jsx code fence must be explicitly classified as:
 *   - compile:<unique-id>
 *   - excerpt:<reason-or-id>
 * Fails fast if any file is missing, any fence is unclosed, any tsx/jsx fence lacks classification,
 * or if any compile/excerpt ID is duplicated.
 */
export function scanDocFences(repoRoot = process.cwd()): ScannedDocFence[] {
	const allFences: ScannedDocFence[] = [];
	const seenIds = new Set<string>();
	const filesToScan = discoverDocumentationFiles(repoRoot);

	for (const relFile of filesToScan) {
		const absPath = join(repoRoot, relFile);
		const content = readFileSync(absPath, "utf8");
		const lines = content.split("\n");

		let inFence = false;
		let startLine = 0;
		let rawHeader = "";
		let codeLines: string[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.startsWith("```")) {
				if (!inFence) {
					inFence = true;
					startLine = i + 1;
					rawHeader = line.slice(3).trim();
					codeLines = [];
				} else {
					inFence = false;
					const parts = rawHeader.split(/\s+/).filter(Boolean);
					const lang = parts[0] || "";
					const tag = parts[1] || "";

					if (lang === "tsx" || lang === "jsx") {
						let kind: CodeFenceKind | undefined;
						let id: string | undefined;
						let reason: string | undefined;

						if (tag.startsWith("compile:")) {
							kind = "compile";
							id = tag.slice("compile:".length);
						} else if (tag.startsWith("excerpt:")) {
							kind = "excerpt";
							id = tag.slice("excerpt:".length);
							reason = parts.slice(2).join(" ") || id;
						}

						if (!kind || !id) {
							throw new Error(
								`unclassified ${lang} code block in ${relFile}:${startLine} (must be tagged 'compile:<id>' or 'excerpt:<id>')`,
							);
						}

						// Namespaced unique ID by relative file path to prevent collision across mirrored docs (e.g. INTEGRATION.md vs packages/basalt/ai/INTEGRATION.md)
						const uniqueFenceKey = `${relFile}:${id}`;
						if (seenIds.has(uniqueFenceKey)) {
							throw new Error(`duplicate code block id '${id}' found in ${relFile}:${startLine}`);
						}
						seenIds.add(uniqueFenceKey);

						// Also compute a collision-safe module ID for extracted compilable modules
						// by stripping non-alphanumeric chars from relFile prefix
						const filePrefix = relFile.replace(/[^a-zA-Z0-9]/g, "-").replace(/^-+|-+$/g, "");
						const namespacedId = `${filePrefix}-${id}`;

						allFences.push({
							file: relFile,
							line: startLine,
							lang,
							kind,
							id: namespacedId,
							reason,
							rawHeader,
							code: codeLines.join("\n"),
						});
					}
				}
			} else if (inFence) {
				codeLines.push(line);
			}
		}

		if (inFence) {
			throw new Error(`unclosed code fence in ${relFile} starting at line ${startLine}`);
		}
	}

	return allFences;
}

export function extractCompilableDocModules(repoRoot = process.cwd()): ScannedDocFence[] {
	const fences = scanDocFences(repoRoot);
	const compilable = fences.filter((f) => f.kind === "compile");
	if (compilable.length === 0) {
		throw new Error("no compilable documentation modules found across markdown sources");
	}
	return compilable;
}

export function generateCatalogInstallationSnippets() {
	const ready = CATALOG.filter((e) => CATALOG_PAGE_STATUS[e.slug] === "ready");
	const lines = [
		`import "@nocoo/basalt/styles/standalone";`,
		`// Generated verification harness for all ready catalog installation snippets`,
	];

	let granularCount = 0;
	let barrelCount = 0;

	for (let i = 0; i < ready.length; i++) {
		const e = ready[i];
		const granular = catalogGranularImport(e);
		const barrel = catalogBarrelImport(e);

		lines.push(`// --- ${e.slug} ---`);
		lines.push(
			granular.replace(
				`import { ${e.exportName} }`,
				`import { ${e.exportName} as Granular_${i}_${e.exportName} }`,
			),
		);
		granularCount++;

		if (barrel) {
			lines.push(
				barrel.replace(
					`import { ${e.exportName} }`,
					`import { ${e.exportName} as Barrel_${i}_${e.exportName} }`,
				),
			);
			barrelCount++;
		}
	}

	return {
		readyCount: ready.length,
		granularCount,
		barrelCount,
		code: lines.join("\n"),
	};
}

export function computeDocModuleFilename(index: number, id: string): string {
	const sanitizedSlug = id.replace(/[^a-zA-Z0-9_-]/g, "_");
	return `doc_${String(index).padStart(3, "0")}_${sanitizedSlug}.tsx`;
}

export function computeUsageModuleFilename(index: number, slug: string): string {
	const sanitizedSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "_");
	return `usage_${String(index).padStart(3, "0")}_${sanitizedSlug}.tsx`;
}

export function computeScenarioModuleFilename(
	index: number,
	slug: string,
	scenarioId: string,
): string {
	const sanitizedSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "_");
	const sanitizedId = scenarioId.replace(/[^a-zA-Z0-9_-]/g, "_");
	return `scenario_${String(index).padStart(3, "0")}_${sanitizedSlug}_${sanitizedId}.tsx`;
}

/**
 * Validates that code string represents a complete, consumable TypeScript/TSX module:
 *  - non-empty
 *  - parses into TypeScript AST
 *  - contains at least one runtime exported symbol or default export
 *  - rejects empty export {}, type-only exports, interface/type declarations, and bare unexported JSX fragments
 *  - missing imports for library/third-party identifiers are strictly rejected by the tsc compilation phase
 */
export function validateCompleteConsumerModule(
	code: string,
	context: { slug: string; id: string; kind: "usage" | "scenario" },
): void {
	if (!code || typeof code !== "string" || code.trim().length === 0) {
		throw new Error(
			`catalog ${context.kind} "${context.slug}" (id: "${context.id}") is missing or empty code`,
		);
	}

	const sourceFile = ts.createSourceFile(
		"module.tsx",
		code,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);

	let hasRuntimeExport = false;

	for (const stmt of sourceFile.statements) {
		// export default ...
		if (ts.isExportAssignment(stmt)) {
			if (!stmt.isExportEquals) {
				hasRuntimeExport = true;
				break;
			}
		}

		// export function / class / const / let / var / enum
		if (
			ts.isFunctionDeclaration(stmt) ||
			ts.isVariableStatement(stmt) ||
			ts.isClassDeclaration(stmt) ||
			ts.isEnumDeclaration(stmt)
		) {
			const modifiers = ts.getModifiers(stmt);
			if (modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
				hasRuntimeExport = true;
				break;
			}
		}

		// export { ... } or export *
		if (ts.isExportDeclaration(stmt)) {
			if (stmt.isTypeOnly) {
				continue;
			}
			if (!stmt.exportClause) {
				hasRuntimeExport = true;
				break;
			}
			if (ts.isNamespaceExport(stmt.exportClause)) {
				hasRuntimeExport = true;
				break;
			}
			if (ts.isNamedExports(stmt.exportClause)) {
				const hasValueExport = stmt.exportClause.elements.some((elem) => !elem.isTypeOnly);
				if (hasValueExport) {
					hasRuntimeExport = true;
					break;
				}
			}
		}
	}

	if (!hasRuntimeExport) {
		throw new Error(
			`catalog ${context.kind} "${context.slug}" (id: "${context.id}") is not a complete consumable module: missing export statement (bare JSX fragment or unexported code is not consumable)`,
		);
	}
}

export type CatalogUsageModule = { slug: string; code: string };

export type CatalogScenarioModule = {
	slug: string;
	id: string;
	title: string;
	code: string;
};

export type CatalogExtractedModules = {
	usageModules: CatalogUsageModule[];
	scenarioModules: CatalogScenarioModule[];
};

export async function loadCatalogModules(
	repoRoot = process.cwd(),
): Promise<CatalogExtractedModules> {
	const server = await createServer({
		root: repoRoot,
		configFile: path.join(repoRoot, "vite.config.ts"),
		server: { middlewareMode: true },
		appType: "custom",
		logLevel: "silent",
	});
	try {
		const catalogMod = (await server.ssrLoadModule("/src/pages/ui/catalog.ts")) as {
			CATALOG: typeof CATALOG;
		};
		const statusMod = (await server.ssrLoadModule(
			"/src/pages/ui/generated/catalog-page-status.ts",
		)) as {
			CATALOG_PAGE_STATUS: typeof CATALOG_PAGE_STATUS;
		};
		const readySlugs = new Set(
			catalogMod.CATALOG.filter((e) => statusMod.CATALOG_PAGE_STATUS[e.slug] === "ready").map(
				(e) => e.slug,
			),
		);

		const registryMod = (await server.ssrLoadModule(
			"/src/pages/ui/catalog-content-registry.ts",
		)) as {
			loadCatalogContentRecord: () => Promise<Readonly<Record<string, CatalogPageContent>>>;
		};
		const record = await registryMod.loadCatalogContentRecord();

		for (const slug of readySlugs) {
			if (!record[slug]) {
				throw new Error(`ready catalog entry "${slug}" did not load in catalog record`);
			}
		}

		const usageModules: CatalogUsageModule[] = [];
		const scenarioModules: CatalogScenarioModule[] = [];
		const seenScenarioIds = new Set<string>();

		for (const slug of Object.keys(record).sort()) {
			if (!readySlugs.has(slug)) {
				continue;
			}
			const content = record[slug];
			const rawUsage = content?.docs?.usage;
			validateCompleteConsumerModule(rawUsage, { slug, id: "usage", kind: "usage" });
			usageModules.push({ slug, code: rawUsage });

			const examples = content?.examples;
			if (!examples || examples.length === 0) {
				throw new Error(`ready catalog entry "${slug}" has no example scenarios`);
			}

			for (const ex of examples) {
				if (seenScenarioIds.has(ex.id)) {
					throw new Error(`duplicate scenario id "${ex.id}" across catalog scenarios`);
				}
				seenScenarioIds.add(ex.id);
				validateCompleteConsumerModule(ex.code, {
					slug,
					id: ex.id,
					kind: "scenario",
				});
				scenarioModules.push({
					slug,
					id: ex.id,
					title: ex.title,
					code: ex.code,
				});
			}
		}

		if (usageModules.length !== readySlugs.size) {
			throw new Error(
				`expected ${readySlugs.size} ready usage modules, loaded ${usageModules.length}`,
			);
		}

		return {
			usageModules,
			scenarioModules,
		};
	} finally {
		await server.close();
	}
}

export async function loadCatalogUsageModules(
	repoRoot = process.cwd(),
): Promise<Array<{ slug: string; code: string }>> {
	const { usageModules } = await loadCatalogModules(repoRoot);
	return usageModules;
}

export async function runDocsGate(repoRoot = process.cwd()) {
	const packageRoot = join(repoRoot, "packages/basalt");
	const tempRoot = realpathSync(mkdtempSync(join(tmpdir(), "basalt-docs-gate-")));

	try {
		// 1. Pack fresh tarball from built packages/basalt using --ignore-scripts
		const pack = spawnSync("npm", ["pack", "--ignore-scripts", "--pack-destination", tempRoot], {
			cwd: packageRoot,
			stdio: "pipe",
			encoding: "utf8",
		});
		if (pack.status !== 0) {
			throw new Error(`npm pack failed:\n${pack.stderr}`);
		}

		const tarballs = readdirSync(tempRoot).filter((name) => name.endsWith(".tgz"));
		if (tarballs.length !== 1) {
			throw new Error(`expected 1 tarball, found: ${tarballs.join(", ")}`);
		}
		const tarballPath = join(tempRoot, tarballs[0]);

		// 2. Extract compilable doc modules and fail-fast if none
		const compilableModules = extractCompilableDocModules(repoRoot);

		// 3. Scaffold clean consumer using fixtures/vite-standalone template
		const consumerDir = join(tempRoot, "consumer");
		cpSync(join(repoRoot, "fixtures/vite-standalone"), consumerDir, { recursive: true });

		const pkgJsonPath = join(consumerDir, "package.json");
		const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf8")) as {
			dependencies: Record<string, string>;
		};
		pkgJson.dependencies = {
			...pkgJson.dependencies,
			"@nocoo/basalt": `file:${tarballPath}`,
			recharts: "3.10.1",
			"react-day-picker": "10.0.1",
			"@tanstack/react-table": "9.1.2",
			"react-hook-form": "7.71.1",
			"react-router": "7.13.0",
		};
		writeFileSync(pkgJsonPath, `${JSON.stringify(pkgJson, null, "\t")}\n`);

		// 4. Install dependencies in clean consumer
		const install = spawnSync("npm", ["install", "--no-fund", "--no-audit"], {
			cwd: consumerDir,
			stdio: "pipe",
			encoding: "utf8",
		});
		if (install.status !== 0) {
			throw new Error(`consumer npm install failed:\n${install.stderr}`);
		}
		const applicationRecipes = materializeApplicationRecipes(consumerDir, "src/recipe-modules");

		// 5. Generate catalog snippets file in dedicated harness location
		const catalogData = generateCatalogInstallationSnippets();
		const harnessDir = join(consumerDir, "src/__generated_harness__");
		mkdirSync(harnessDir, { recursive: true });
		writeFileSync(join(harnessDir, "catalog-snippets.tsx"), catalogData.code);

		// 6. Write out exact compilable documentation modules into an isolated docs directory
		// using collision-proof indexed filenames so arbitrary user IDs can never collide or overwrite
		const docsDir = join(consumerDir, "src/__generated_docs__");
		mkdirSync(docsDir, { recursive: true });
		const writtenDocPaths = new Set<string>();

		for (let idx = 0; idx < compilableModules.length; idx++) {
			const mod = compilableModules[idx];
			const docFilename = computeDocModuleFilename(idx, mod.id);
			const docFilePath = join(docsDir, docFilename);

			if (writtenDocPaths.has(docFilePath) || existsSync(docFilePath)) {
				throw new Error(
					`fatal destination file collision for doc module '${mod.id}': ${docFilename}`,
				);
			}
			writtenDocPaths.add(docFilePath);
			writeFileSync(docFilePath, mod.code);
		}

		// 7. Write out exact verbatim library usage and scenario modules loaded via SSR catalog content registry
		const { usageModules, scenarioModules } = await loadCatalogModules(repoRoot);

		const usageDir = join(consumerDir, "src/__generated_usages__");
		mkdirSync(usageDir, { recursive: true });
		const writtenUsagePaths = new Set<string>();

		for (let idx = 0; idx < usageModules.length; idx++) {
			const mod = usageModules[idx];
			const usageFilename = computeUsageModuleFilename(idx, mod.slug);
			const usageFilePath = join(usageDir, usageFilename);

			if (writtenUsagePaths.has(usageFilePath) || existsSync(usageFilePath)) {
				throw new Error(
					`fatal destination file collision for usage module '${mod.slug}': ${usageFilename}`,
				);
			}
			writtenUsagePaths.add(usageFilePath);
			writeFileSync(usageFilePath, mod.code);
		}

		// 8. Write out exact verbatim scenario modules into an isolated scenarios directory
		const scenarioDir = join(consumerDir, "src/__generated_scenarios__");
		mkdirSync(scenarioDir, { recursive: true });
		const writtenScenarioPaths = new Set<string>();

		for (let idx = 0; idx < scenarioModules.length; idx++) {
			const mod = scenarioModules[idx];
			const scenarioFilename = computeScenarioModuleFilename(idx, mod.slug, mod.id);
			const scenarioFilePath = join(scenarioDir, scenarioFilename);

			if (writtenScenarioPaths.has(scenarioFilePath) || existsSync(scenarioFilePath)) {
				throw new Error(
					`fatal destination file collision for scenario module '${mod.id}': ${scenarioFilename}`,
				);
			}
			writtenScenarioPaths.add(scenarioFilePath);
			writeFileSync(scenarioFilePath, mod.code);
		}

		// 9. Strict tsc typecheck of consumer
		const tsc = spawnSync("npx", ["tsc", "-p", "tsconfig.json", "--noEmit"], {
			cwd: consumerDir,
			stdio: "pipe",
			encoding: "utf8",
		});
		if (tsc.status !== 0) {
			throw new Error(`consumer tsc --noEmit failed:\n${tsc.stdout}\n${tsc.stderr}`);
		}

		return {
			applicationRecipes,
			tarball: tarballs[0],
			consumerDir,
			readyCount: catalogData.readyCount,
			granularCount: catalogData.granularCount,
			barrelCount: catalogData.barrelCount,
			compilableCount: compilableModules.length,
			compilableIds: compilableModules.map((m) => m.id),
			usageCount: usageModules.length,
			usageSlugs: usageModules.map((m) => m.slug),
			scenarioCount: scenarioModules.length,
			scenarioIds: scenarioModules.map((m) => m.id),
		};
	} finally {
		rmSync(tempRoot, { recursive: true, force: true });
	}
}

if (import.meta.main) {
	const result = await runDocsGate();
	console.log(`consumer docs ok ${JSON.stringify(result, null, 2)}`);
}
