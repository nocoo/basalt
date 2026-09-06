import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import * as ts from "typescript-api";
import { CATALOG } from "../src/pages/ui/catalog";
import type { CatalogApiSurface } from "../src/pages/ui/catalog-source";
import { CATALOG_PAGE_STATUS } from "../src/pages/ui/generated/catalog-page-status";
import { type DiscoveredExportModule, derivePublicSurfaceManifest } from "./catalog-surface-owners";

export interface PackageRegistryEntry {
	displayName: string;
	exportName: string;
	importPath: string;
	subpath: string;
	sourceFile: string;
	sourceHash: string;
	rootAvailable: boolean;
	maturity: "ready" | "planned";
	kind: string;
	ownerDoc: string;
	packageDoc: string;
	summary: string;
	peers: string[];
	optionalPeers: string[];
	symbols: Array<{
		name: string;
		isValue: boolean;
		isType: boolean;
		ownerDoc: string;
		packageDoc: string;
		originModule: string;
	}>;
	catalogEntries?: Array<{
		slug: string;
		name: string;
		exportName: string;
		rootAvailable: boolean;
		maturity: "ready" | "planned";
		packageDoc: string;
		api?: CatalogApiSurface[];
	}>;
	api?: CatalogApiSurface[];
}

export interface PackageRegistry {
	packageName: string;
	packageVersion: string;
	totalModules: number;
	totalSymbols: number;
	totalValues: number;
	totalTypes: number;
	totalCssExports: number;
	totalCatalogEntries: number;
	modules: PackageRegistryEntry[];
	catalogEntries: Array<{
		slug: string;
		name: string;
		exportName: string;
		importPath: string;
		sourceFile: string;
		sourceHash: string;
		rootAvailable: boolean;
		maturity: "ready" | "planned";
		packageDoc: string;
		api: CatalogApiSurface[];
	}>;
	cssExports: Array<{
		subpath: string;
		importPath: string;
		target: string;
		ownerDoc: string;
		packageDoc: string;
		summary: string;
		contract: "tailwind" | "standalone";
	}>;
}

/**
 * Statically collects imports from source file without requiring a pre-built dist.
 */
function collectStaticImports(
	filePath: string,
	repoRoot: string,
	visited = new Set<string>(),
	external = new Set<string>(),
): Set<string> {
	if (visited.has(filePath)) return external;
	visited.add(filePath);
	if (!existsSync(filePath)) return external;

	const content = readFileSync(filePath, "utf8");
	const source = ts.createSourceFile(
		filePath,
		content,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);

	function packageName(specifier: string): string {
		return specifier.startsWith("@")
			? specifier.split("/").slice(0, 2).join("/")
			: specifier.split("/")[0];
	}

	let hasJsx = false;
	function visit(node: ts.Node) {
		if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
			hasJsx = true;
		}
		let specifier: string | null = null;
		if (
			ts.isImportDeclaration(node) &&
			node.moduleSpecifier &&
			ts.isStringLiteral(node.moduleSpecifier)
		) {
			if (!node.importClause?.isTypeOnly) {
				specifier = node.moduleSpecifier.text;
			}
		} else if (
			ts.isExportDeclaration(node) &&
			node.moduleSpecifier &&
			ts.isStringLiteral(node.moduleSpecifier)
		) {
			if (!node.isTypeOnly) {
				specifier = node.moduleSpecifier.text;
			}
		} else if (
			ts.isCallExpression(node) &&
			node.expression.kind === ts.SyntaxKind.ImportKeyword &&
			node.arguments[0] &&
			ts.isStringLiteral(node.arguments[0])
		) {
			specifier = node.arguments[0].text;
		}

		if (specifier) {
			if (specifier.startsWith(".")) {
				const resolved = path.resolve(path.dirname(filePath), specifier);
				const candidates = [
					resolved,
					`${resolved}.tsx`,
					`${resolved}.ts`,
					path.join(resolved, "index.tsx"),
					path.join(resolved, "index.ts"),
				];
				for (const cand of candidates) {
					if (existsSync(cand)) {
						collectStaticImports(cand, repoRoot, visited, external);
						break;
					}
				}
			} else {
				external.add(packageName(specifier));
			}
		}
		ts.forEachChild(node, visit);
	}

	visit(source);
	if (hasJsx) {
		external.add("react");
	}
	return external;
}

/**
 * Robustly parses generated CatalogApiSurface from AST without regex or JSON.parse fragility.
 */
export function loadCatalogApiSurface(slug: string, repoRoot = process.cwd()): CatalogApiSurface[] {
	const shardPath = path.join(repoRoot, "src/pages/ui/generated/catalog-api", `${slug}.ts`);
	if (!existsSync(shardPath)) {
		throw new Error(`Missing generated catalog API shard for slug '${slug}' at ${shardPath}`);
	}
	const content = readFileSync(shardPath, "utf8");
	const source = ts.createSourceFile("shard.ts", content, ts.ScriptTarget.Latest, true);

	let apiNode: ts.Expression | null = null;
	for (const stmt of source.statements) {
		if (ts.isVariableStatement(stmt)) {
			for (const decl of stmt.declarationList.declarations) {
				if (ts.isIdentifier(decl.name) && decl.name.text === "API") {
					apiNode = decl.initializer ?? null;
				}
			}
		}
	}

	if (!apiNode) {
		throw new Error(`Failed to find 'export const API' in ${shardPath}`);
	}

	function nodeToValue(node: ts.Node): unknown {
		if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
			return node.text;
		}
		if (ts.isNumericLiteral(node)) {
			return Number(node.text);
		}
		if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
		if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
		if (node.kind === ts.SyntaxKind.NullKeyword) return null;
		if (node.kind === ts.SyntaxKind.UndefinedKeyword) return undefined;
		if (ts.isArrayLiteralExpression(node)) {
			return node.elements.map(nodeToValue);
		}
		if (ts.isObjectLiteralExpression(node)) {
			const obj: Record<string, unknown> = {};
			for (const prop of node.properties) {
				if (ts.isPropertyAssignment(prop)) {
					const key =
						ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)
							? prop.name.text
							: prop.name.getText(source);
					obj[key] = nodeToValue(prop.initializer);
				}
			}
			return obj;
		}
		return undefined;
	}

	const evaluated = nodeToValue(apiNode);
	if (!Array.isArray(evaluated)) {
		throw new Error(`Catalog API shard in ${shardPath} did not evaluate to an array`);
	}
	return evaluated as CatalogApiSurface[];
}

/**
 * Maps repo-relative doc paths to published in-package documentation files.
 */
export function mapToPackageDoc(repoDoc: string): string {
	const [file, anchor] = repoDoc.split("#");
	const hash = anchor ? `#${anchor}` : "";
	if (file === "INTEGRATION.md") {
		return `ai/INTEGRATION.md${hash}`;
	}
	if (file.startsWith("packages/basalt/")) {
		return `${file.slice("packages/basalt/".length)}${hash}`;
	}
	if (file === "README.md") {
		return `README.md${hash}`;
	}
	if (file.startsWith("src/pages/ui/")) {
		return `ai/registry.json#${file.replace("src/pages/ui/", "")}`;
	}
	return `${file}${hash}`;
}

export function generatePackageRegistry(repoRoot = process.cwd()): PackageRegistry {
	const rootPkgPath = path.join(repoRoot, "package.json");
	const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf8")) as {
		version: string;
	};

	const pkgPath = path.join(repoRoot, "packages/basalt/package.json");
	const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
		name: string;
		version: string;
		peerDependencies: Record<string, string>;
		peerDependenciesMeta: Record<string, { optional?: boolean }>;
	};

	if (pkg.version !== rootPkg.version) {
		throw new Error(
			`Version mismatch between root package.json (${rootPkg.version}) and packages/basalt/package.json (${pkg.version})`,
		);
	}

	const surfaceManifest = derivePublicSurfaceManifest(repoRoot);
	const declaredPeers = new Set(Object.keys(pkg.peerDependencies ?? {}));
	const declaredOptional = new Set(
		Object.entries(pkg.peerDependenciesMeta ?? {})
			.filter(([, meta]) => meta.optional)
			.map(([name]) => name),
	);

	const rootMod = surfaceManifest.modules.find((m) => m.subpath === ".");
	const rootSymbolNames = new Set(rootMod?.symbols.map((s) => s.name) ?? []);

	// Pre-load all ready catalog APIs
	const pageStatusMap = CATALOG_PAGE_STATUS as Record<string, string>;
	const readyCatalog = CATALOG.filter((c) => pageStatusMap[c.slug] === "ready");
	const catalogApiMap = new Map<string, CatalogApiSurface[]>();
	for (const cat of readyCatalog) {
		catalogApiMap.set(cat.slug, loadCatalogApiSurface(cat.slug, repoRoot));
	}

	const catalogEntries: PackageRegistry["catalogEntries"] = [];
	const slugToModule = new Map<string, DiscoveredExportModule>();

	for (const mod of surfaceManifest.modules) {
		if (mod.subpath === ".") continue;
		for (const sym of mod.symbols) {
			if (sym.ownerDoc.startsWith("src/pages/ui/")) {
				const slug = sym.ownerDoc.replace("src/pages/ui/", "");
				if (!slugToModule.has(slug)) {
					slugToModule.set(slug, mod);
				}
			}
		}
	}

	for (const cat of readyCatalog) {
		const mod = slugToModule.get(cat.slug);
		if (!mod) {
			throw new Error(`Failed to find module for catalog slug '${cat.slug}'`);
		}
		const fullSource = path.resolve(repoRoot, mod.sourceFile);
		const content = readFileSync(fullSource, "utf8");
		const sourceHash = createHash("sha256").update(content).digest("hex").slice(0, 16);
		const api = catalogApiMap.get(cat.slug);
		if (!api) {
			throw new Error(`Missing API surface for catalog entry '${cat.slug}'`);
		}

		catalogEntries.push({
			slug: cat.slug,
			name: cat.name,
			exportName: cat.exportName,
			importPath: mod.importPath,
			sourceFile: mod.sourceFile,
			sourceHash,
			rootAvailable: cat.hasRootBarrel,
			maturity: "ready",
			packageDoc: `ai/registry.json#${cat.slug}`,
			api,
		});
	}

	const modules: PackageRegistryEntry[] = [];

	for (const mod of surfaceManifest.modules) {
		const fullSource = path.resolve(repoRoot, mod.sourceFile);
		const sourceContent = existsSync(fullSource) ? readFileSync(fullSource, "utf8") : "";
		const sourceHash = sourceContent
			? createHash("sha256").update(sourceContent).digest("hex").slice(0, 16)
			: "";

		const ext = collectStaticImports(fullSource, repoRoot);
		const peers = [...ext].filter((p) => declaredPeers.has(p)).sort();
		const optionalPeers = [...ext].filter((p) => declaredOptional.has(p)).sort();

		// Find all catalog entries served by this module
		const matchingCatalogs = readyCatalog.filter(
			(c) => slugToModule.get(c.slug)?.importPath === mod.importPath,
		);

		const rootAvailable =
			mod.subpath === "."
				? true
				: mod.symbols.some((s) => s.isValue && rootSymbolNames.has(s.name));

		const primaryCatalog = matchingCatalogs[0];
		const primaryApi = primaryCatalog ? catalogApiMap.get(primaryCatalog.slug) : undefined;

		const catalogEntriesForMod =
			matchingCatalogs.length > 0
				? matchingCatalogs.map((c) => ({
						slug: c.slug,
						name: c.name,
						exportName: c.exportName,
						rootAvailable: c.hasRootBarrel,
						maturity: "ready" as const,
						packageDoc: `ai/registry.json#${c.slug}`,
						api: catalogApiMap.get(c.slug),
					}))
				: undefined;

		modules.push({
			displayName: primaryCatalog?.name ?? mod.symbols[0]?.name ?? path.basename(mod.subpath),
			exportName: primaryCatalog?.exportName ?? mod.symbols[0]?.name ?? path.basename(mod.subpath),
			importPath: mod.importPath,
			subpath: mod.subpath,
			sourceFile: mod.sourceFile,
			sourceHash,
			rootAvailable,
			maturity: primaryCatalog ? "ready" : "ready",
			kind: mod.ownerKind,
			ownerDoc: mod.ownerDoc,
			packageDoc: mapToPackageDoc(mod.ownerDoc),
			summary: mod.summary,
			peers,
			optionalPeers,
			symbols: mod.symbols.map((s) => ({
				name: s.name,
				isValue: s.isValue,
				isType: s.isType,
				ownerDoc: s.ownerDoc,
				packageDoc: mapToPackageDoc(s.ownerDoc),
				originModule: s.originModule,
			})),
			catalogEntries: catalogEntriesForMod,
			api: primaryApi,
		});
	}

	const cssExports = surfaceManifest.cssExports.map((css) => ({
		subpath: css.subpath,
		importPath: css.importPath,
		target: css.target,
		ownerDoc: css.ownerDoc,
		packageDoc: mapToPackageDoc(css.ownerDoc),
		summary: css.summary,
		contract: (css.subpath.includes("standalone") ? "standalone" : "tailwind") as
			| "tailwind"
			| "standalone",
	}));

	return {
		packageName: pkg.name,
		packageVersion: pkg.version,
		totalModules: modules.length,
		totalSymbols: surfaceManifest.totalSymbols,
		totalValues: surfaceManifest.totalValues,
		totalTypes: surfaceManifest.totalTypes,
		totalCssExports: cssExports.length,
		totalCatalogEntries: catalogEntries.length,
		modules,
		catalogEntries,
		cssExports,
	};
}

export function generateBasicUsageGuide(registry: PackageRegistry): string {
	return `# Basalt AI & Machine Usage Guide

This document describes how AI code assistants, automated agents, and developers can consume \`@nocoo/basalt\` (v${registry.packageVersion}).

---

## 1. Machine Registry Entrypoint

The complete, machine-readable component registry and API surface is published within the installed npm package at file:
\`node_modules/@nocoo/basalt/ai/registry.json\` (relative package path: \`ai/registry.json\`).
*(Note: \`ai/registry.json\` is a published file within the npm package directory, not an imported JavaScript/ESM export subpath.)*
Document anchors formatted as \`ai/registry.json#<slug>\` reference specific catalog entries within the \`catalogEntries\` array by matching the \`slug\` property (e.g. \`ai/registry.json#button\` matches the entry where \`slug === "button"\`).

It contains:
- **${registry.totalModules} Exported Modules** (1 root barrel, components, charts, providers)
- **${registry.totalCatalogEntries} Ready Catalog Entries** with full API definitions
- **${registry.totalSymbols} Public Symbols** (${registry.totalValues} runtime values, ${registry.totalTypes} TypeScript types)
- **Detailed Component API**: Props, types, defaults, descriptions, and function callable signatures (including all \`toast()\` variants)
- **Exact Peer Dependency Closures**: Identifies optional peers required per subpath (e.g., Recharts)

---

## 2. Reading Original Component Sources From Installed Package

Basalt distributes complete TypeScript source code embedded directly inside the published package artifacts:
- **Compiled Modules**: Full TypeScript source code is embedded in the \`sourcesContent\` field of individual sourcemaps under \`node_modules/@nocoo/basalt/dist/<subpath>.js.map\`.
- **Pure Re-Export Modules**: Modules without an independent sourcemap (such as pure re-export modules) are preserved verbatim with integrity hashes in \`node_modules/@nocoo/basalt/ai/sources.json\`. The root entrypoint \`@nocoo/basalt\` still emits full JavaScript exports in \`dist/index.js\`.

Inspect \`ai/registry.json\` or the component's catalog metadata to identify the exact package read location and expected SHA-256 integrity hash for each module. Do not attempt to read from unbundled repository source paths or unreleased remote git tags.

---

## 3. Component Import Conventions

### Root Import vs. Granular Subpaths
Basalt supports both lightweight root imports and tree-shakeable granular subpaths:

\`\`\`tsx compile:usage-import-conventions
// Root import for standard components
import { Button, Input, LayerCard, Dialog, Toaster, toast } from "@nocoo/basalt";

// Granular subpaths for visualization, calendar pickers, and tables
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { Sparkline } from "@nocoo/basalt/charts/sparkline";

export function ImportConventionsDemo() {
  return (
    <div>
      <Button variant="default">Root Button</Button>
      <DatePicker aria-label="Target Date" />
    </div>
  );
}
\`\`\`

### Optional Peer Dependency Rules
- **Recharts**: Required ONLY when using chart subpaths (\`@nocoo/basalt/charts/*\`). Root imports and basic UI do not import Recharts.
- **DatePicker & DataTable**: Built-in implementations operate standalone without requiring \`react-day-picker\` or \`@tanstack/react-table\`.

---

## 4. Styling Setup

### Tailwind CSS v4 Contract
\`\`\`css
@import "@nocoo/basalt/styles/tailwind";
@import "tailwindcss";
\`\`\`

### Standalone CSS Contract (No Tailwind)
\`\`\`ts
import "@nocoo/basalt/styles/standalone";
\`\`\`

---

## 5. Toast Notification Architecture

Mount a single \`<Toaster />\` globally at the root of your application (without an id):
\`\`\`tsx compile:usage-toast-architecture
import type React from "react";
import { Toaster, toast, Button } from "@nocoo/basalt";

export function App() {
  return (
    <>
      <Toaster />
      <Button onClick={() => toast.success("Project saved")}>Save</Button>
    </>
  );
}
\`\`\`
`;
}

export interface CatalogSourceLocationInfo {
	file: string;
	hash: string;
	kind: "sourcemap" | "source-bundle";
	packageReadLocation: string;
}

export function generateCatalogSourceFilesModule(
	registry: PackageRegistry,
	sourcesBundle: Record<string, { content: string; hash: string }>,
): string {
	const table: Record<string, CatalogSourceLocationInfo> = {};
	for (const cat of registry.catalogEntries) {
		const isBundle = Boolean(sourcesBundle[cat.sourceFile]);
		let packageReadLocation = "";
		if (isBundle) {
			packageReadLocation = `node_modules/@nocoo/basalt/ai/sources.json ("${cat.sourceFile}")`;
		} else {
			const rel = cat.sourceFile.replace(/^packages\/basalt\/src\//, "").replace(/\.(tsx|ts)$/, "");
			packageReadLocation = `node_modules/@nocoo/basalt/dist/${rel}.js.map (sourcesContent[0])`;
		}
		table[cat.slug] = {
			file: cat.sourceFile,
			hash: cat.sourceHash,
			kind: isBundle ? "source-bundle" : "sourcemap",
			packageReadLocation,
		};
	}
	return `// Generated by scripts/package-registry.ts. Do not edit.\n// biome-ignore format: generated deterministic pure-data table\nexport const CATALOG_SOURCE_FILES: Record<string, {\n\tfile: string;\n\thash: string;\n\tkind: "sourcemap" | "source-bundle";\n\tpackageReadLocation: string;\n}> = ${JSON.stringify(
		table,
		null,
		"\t",
	)};\n`;
}

export function findPureReExportSourceFiles(repoRoot = process.cwd()): string[] {
	const surfaceManifest = derivePublicSurfaceManifest(repoRoot);
	const pureFiles: string[] = [];
	for (const m of surfaceManifest.modules) {
		const filePath = path.resolve(repoRoot, m.sourceFile);
		if (!existsSync(filePath)) continue;
		const content = readFileSync(filePath, "utf8");
		const source = ts.createSourceFile(
			filePath,
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);

		let hasDeclaration = false;
		let hasReExport = false;
		for (const stmt of source.statements) {
			if (
				ts.isFunctionDeclaration(stmt) ||
				ts.isVariableStatement(stmt) ||
				ts.isClassDeclaration(stmt)
			) {
				hasDeclaration = true;
			}
			if (ts.isExportDeclaration(stmt) && stmt.moduleSpecifier) {
				hasReExport = true;
			}
		}
		if (hasReExport && !hasDeclaration && !pureFiles.includes(m.sourceFile)) {
			pureFiles.push(m.sourceFile);
		}
	}
	return pureFiles.sort();
}

export function generateSourcesBundle(
	repoRoot = process.cwd(),
): Record<string, { content: string; hash: string }> {
	const fallbackFiles = findPureReExportSourceFiles(repoRoot);
	const sourcesBundle: Record<string, { content: string; hash: string }> = {};
	for (const rel of fallbackFiles) {
		const abs = path.join(repoRoot, rel);
		if (existsSync(abs)) {
			const content = readFileSync(abs, "utf8");
			const hash = createHash("sha256").update(content).digest("hex").slice(0, 16);
			sourcesBundle[rel] = { content, hash };
		}
	}
	return sourcesBundle;
}

const require = createRequire(import.meta.url);
const BIOME_BIN = require.resolve("@biomejs/biome/bin/biome");

export function formatJsonDeterministic(rawJson: string, filePath = "registry.json"): string {
	const formatted = execFileSync(
		process.execPath,
		[BIOME_BIN, "format", `--stdin-file-path=${filePath}`],
		{
			input: rawJson,
			encoding: "utf8",
			maxBuffer: 10 * 1024 * 1024,
			timeout: 10000,
		},
	);
	return formatted;
}

export function syncAiPackageAssets(repoRoot = process.cwd()): void {
	const registry = generatePackageRegistry(repoRoot);
	const aiDir = path.join(repoRoot, "packages/basalt/ai");
	mkdirSync(aiDir, { recursive: true });

	// 1. Write registry.json
	const registryPath = path.join(aiDir, "registry.json");
	const rawRegistryJson = `${JSON.stringify(registry, null, "\t")}\n`;
	writeFileSync(registryPath, formatJsonDeterministic(rawRegistryJson, registryPath));

	// 2. Write USAGE.md
	const usagePath = path.join(aiDir, "USAGE.md");
	writeFileSync(usagePath, generateBasicUsageGuide(registry));

	// 3. Mirror INTEGRATION.md into packages/basalt/ai/INTEGRATION.md for standalone tarball consumption
	const integrationSrc = path.join(repoRoot, "INTEGRATION.md");
	if (existsSync(integrationSrc)) {
		const integrationDst = path.join(aiDir, "INTEGRATION.md");
		writeFileSync(integrationDst, readFileSync(integrationSrc, "utf8"));
	}

	// 4. Write packages/basalt/ai/sources.json for pure re-export files that bundlers do not emit sourcemaps for
	const sourcesBundle = generateSourcesBundle(repoRoot);
	const rawSourcesJson = `${JSON.stringify(sourcesBundle, null, "\t")}\n`;
	writeFileSync(
		path.join(aiDir, "sources.json"),
		formatJsonDeterministic(rawSourcesJson, path.join(aiDir, "sources.json")),
	);

	// 5. Generate and sync src/pages/ui/generated/catalog-source-files.ts
	const sourceFilesPath = path.join(repoRoot, "src/pages/ui/generated/catalog-source-files.ts");
	writeFileSync(sourceFilesPath, generateCatalogSourceFilesModule(registry, sourcesBundle));
}

export function validatePackageDocReferences(
	registry: PackageRegistry,
	repoRoot = process.cwd(),
): void {
	const packageRoot = path.join(repoRoot, "packages/basalt");
	const allDocs = new Set<string>();

	for (const mod of registry.modules) {
		allDocs.add(mod.packageDoc);
		for (const sym of mod.symbols) {
			allDocs.add(sym.packageDoc);
		}
	}
	for (const css of registry.cssExports) {
		allDocs.add(css.packageDoc);
	}
	for (const cat of registry.catalogEntries) {
		allDocs.add(cat.packageDoc);
	}

	for (const docRef of allDocs) {
		const [relFile, anchor] = docRef.split("#");
		const absPath = path.resolve(packageRoot, relFile);
		if (!existsSync(absPath)) {
			throw new Error(
				`Package doc validation error: missing package file '${relFile}' referenced by '${docRef}'`,
			);
		}
		if (!anchor) continue;

		if (relFile.endsWith(".json")) {
			const json = JSON.parse(readFileSync(absPath, "utf8")) as {
				catalogEntries?: Array<{ slug: string }>;
			};
			const found = json.catalogEntries?.some((c) => c.slug === anchor);
			if (!found) {
				throw new Error(
					`Package doc validation error: anchor #${anchor} not found in '${relFile}'`,
				);
			}
		} else if (relFile.endsWith(".md")) {
			const text = readFileSync(absPath, "utf8");
			const anchors = new Set<string>(
				[...text.matchAll(/(?:id|name)=["']([^"']+)["']/g)].map((m) => m[1]),
			);
			for (const match of text.matchAll(/^#{1,6} +(.+)$/gm)) {
				anchors.add(
					match[1]
						.toLowerCase()
						.replace(/[`*_]/g, "")
						.replace(/[^\p{L}\p{N} _-]/gu, "")
						.replace(/ /g, "-"),
				);
			}
			if (!anchors.has(anchor)) {
				throw new Error(
					`Package doc validation error: missing anchor '#${anchor}' in package markdown file '${relFile}'`,
				);
			}
		}
	}
}

export function checkAiPackageAssetsFreshness(repoRoot = process.cwd()): void {
	const expectedRegistry = generatePackageRegistry(repoRoot);
	validatePackageDocReferences(expectedRegistry, repoRoot);
	const aiDir = path.join(repoRoot, "packages/basalt/ai");
	const registryPath = path.join(aiDir, "registry.json");
	const usagePath = path.join(aiDir, "USAGE.md");
	const integrationDst = path.join(aiDir, "INTEGRATION.md");
	const sourcesPath = path.join(aiDir, "sources.json");
	const sourceFilesPath = path.join(repoRoot, "src/pages/ui/generated/catalog-source-files.ts");

	if (!existsSync(registryPath)) {
		throw new Error("Missing packages/basalt/ai/registry.json. Run sync or build.");
	}
	const actualRegistryStr = readFileSync(registryPath, "utf8");
	const expectedRegistryStr = formatJsonDeterministic(
		`${JSON.stringify(expectedRegistry, null, "\t")}\n`,
		registryPath,
	);
	if (actualRegistryStr !== expectedRegistryStr) {
		throw new Error("Stale packages/basalt/ai/registry.json. Run sync or build.");
	}

	if (!existsSync(usagePath)) {
		throw new Error("Missing packages/basalt/ai/USAGE.md. Run sync or build.");
	}
	const expectedUsage = generateBasicUsageGuide(expectedRegistry);
	if (readFileSync(usagePath, "utf8") !== expectedUsage) {
		throw new Error("Stale packages/basalt/ai/USAGE.md. Run sync or build.");
	}

	const integrationSrc = path.join(repoRoot, "INTEGRATION.md");
	if (existsSync(integrationSrc)) {
		if (!existsSync(integrationDst)) {
			throw new Error("Missing packages/basalt/ai/INTEGRATION.md. Run sync or build.");
		}
		if (readFileSync(integrationDst, "utf8") !== readFileSync(integrationSrc, "utf8")) {
			throw new Error("Stale packages/basalt/ai/INTEGRATION.md. Run sync or build.");
		}
	}

	if (!existsSync(sourcesPath)) {
		throw new Error("Missing packages/basalt/ai/sources.json. Run sync or build.");
	}
	const expectedSourcesBundle = generateSourcesBundle(repoRoot);
	const expectedSourcesStr = formatJsonDeterministic(
		`${JSON.stringify(expectedSourcesBundle, null, "\t")}\n`,
		sourcesPath,
	);
	if (readFileSync(sourcesPath, "utf8") !== expectedSourcesStr) {
		throw new Error("Stale packages/basalt/ai/sources.json. Run sync or build.");
	}

	if (!existsSync(sourceFilesPath)) {
		throw new Error("Missing src/pages/ui/generated/catalog-source-files.ts. Run sync or build.");
	}
	const expectedSourceFilesStr = generateCatalogSourceFilesModule(
		expectedRegistry,
		expectedSourcesBundle,
	);
	if (readFileSync(sourceFilesPath, "utf8") !== expectedSourceFilesStr) {
		throw new Error("Stale src/pages/ui/generated/catalog-source-files.ts. Run sync or build.");
	}
}
