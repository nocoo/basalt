import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import * as tsApi from "typescript-api";
import { resolvePackageExportTarget } from "../packages/basalt/scripts/verify-public-api";
import { CATALOG } from "../src/pages/ui/catalog";

import {
	DOCUMENTED_NATIVE_ONLY_SURFACES,
	formatNativeSurfaceStrategy,
	type NativeOnlySurfaceDocumentation,
} from "../src/pages/ui/catalog-native-surfaces";

// Robust TypeScript compiler API interop across runtimes
const ts = (tsApi as unknown as { default?: typeof tsApi }).default ?? tsApi;

export {
	DOCUMENTED_NATIVE_ONLY_SURFACES,
	formatNativeSurfaceStrategy,
	type NativeOnlySurfaceDocumentation,
};

export type PublicSurfaceKind =
	| "catalog-component"
	| "framework-chrome"
	| "provider"
	| "chart-subsystem"
	| "legacy-internal"
	| "stylesheet";

export interface DocOwnerInfo {
	ownerDoc: string;
	kind: PublicSurfaceKind;
	summary: string;
	knownSymbols?: readonly string[];
}

export interface DiscoveredPublicSymbol {
	name: string;
	isValue: boolean;
	isType: boolean;
	ownerDoc: string;
	ownerKind: PublicSurfaceKind;
	originModule: string;
}

export interface DiscoveredExportModule {
	subpath: string; // e.g. "." or "./components/button"
	importPath: string; // e.g. "@nocoo/basalt" or "@nocoo/basalt/components/button"
	sourceFile: string; // relative to repo root
	ownerDoc: string;
	ownerKind: PublicSurfaceKind;
	summary: string;
	symbols: DiscoveredPublicSymbol[];
}

export interface DiscoveredCssExport {
	subpath: string;
	importPath: string;
	target: string;
	ownerDoc: string;
	ownerKind: "stylesheet";
	summary: string;
}

export interface PublicSurfaceManifest {
	packageVersion: string;
	totalModules: number;
	totalSymbols: number;
	totalValues: number;
	totalTypes: number;
	totalCssExports: number;
	modules: DiscoveredExportModule[];
	cssExports: DiscoveredCssExport[];
}

export const GENERATED_SURFACE_MANIFEST_RELATIVE =
	"src/pages/ui/generated/public-surface-manifest.ts";
export const SURFACE_MANIFEST_COMMAND = "bun run catalog-api:generate";

/**
 * Explicit registry for non-catalog or legacy/internal modules exposed by wildcard export.
 * Every public module that is not directly a catalog item MUST be registered here.
 * Any unowned module or unowned helper inside these modules will cause derivation to fail immediately.
 */
export const NON_CATALOG_SURFACE_OWNERS: Record<string, DocOwnerInfo> = {
	"@nocoo/basalt/components/app-header": {
		ownerDoc: "INTEGRATION.md#appheader-and-breadcrumbs",
		kind: "framework-chrome",
		summary: "Application frame top navigation bar component",
		knownSymbols: ["AppHeader"],
	},
	"@nocoo/basalt/components/app-shell": {
		ownerDoc: "INTEGRATION.md#root-geometry",
		kind: "framework-chrome",
		summary:
			"Root layout viewport and main frame structure components (AppShell, AppMain, AppSkipLink)",
		knownSymbols: ["AppMain", "AppShell", "AppSkipLink"],
	},
	"@nocoo/basalt/components/loading-screen": {
		ownerDoc: "INTEGRATION.md#loading",
		kind: "framework-chrome",
		summary: "Full-viewport initial boot and route gate loading indicator",
		knownSymbols: ["LoadingScreen"],
	},
	"@nocoo/basalt/providers/accent": {
		ownerDoc: "INTEGRATION.md#accent-provider",
		kind: "provider",
		summary: "Visual accent color swatch provider, palette utilities and useAccent hook",
		knownSymbols: [
			"ACCENT_SWATCHES",
			"accentForeground",
			"AccentProvider",
			"AccentSwatch",
			"accentSwatchById",
			"applyAccent",
			"DEFAULT_ACCENT_ID",
			"useAccent",
		],
	},
	"@nocoo/basalt/charts/frame": {
		ownerDoc: "INTEGRATION.md#chart-frame",
		kind: "chart-subsystem",
		summary: "Chart container framing and responsive sizing primitives (ChartFrame, ChartShell)",
		knownSymbols: ["ChartFrame", "ChartFrameProps", "ChartShell"],
	},
	"@nocoo/basalt/charts/legend": {
		ownerDoc: "INTEGRATION.md#chart-legend",
		kind: "chart-subsystem",
		summary: "Chart legend layout and indicator shapes (ChartLegend)",
		knownSymbols: ["ChartLegend", "ChartLegendProps", "ChartLegendShape"],
	},
	"@nocoo/basalt/charts/tooltip": {
		ownerDoc: "INTEGRATION.md#chart-tooltip",
		kind: "chart-subsystem",
		summary: "Chart hover tooltip item and content formatters (ChartTooltipContent)",
		knownSymbols: [
			"ChartTooltipContent",
			"ChartTooltipContentProps",
			"ChartTooltipItem",
			"formatChartNumber",
		],
	},
	"@nocoo/basalt/charts/config": {
		ownerDoc: "packages/basalt/ai/COMPATIBILITY.md#chart-config",
		kind: "chart-subsystem",
		summary: "Recharts default axis, margins, grid, and typography styling tokens",
		knownSymbols: [
			"ANIMATION_PROPS",
			"AXIS_CONFIG",
			"BAR_RADIUS",
			"cartesianAxisProps",
			"CHART_PLOT_MARGIN",
			"CHART_PLOT_MARGIN_BARE",
			"CHART_TOOLTIP_CURSOR_BAR",
			"CHART_TOOLTIP_CURSOR_LINE",
			"CHART_TYPE",
			"chartFontSize",
			"ChartSeriesDescriptor",
			"chartTextStyle",
			"chartTickStyle",
			"chartTooltipContentStyle",
			"chartTooltipProps",
			"ChartTypeFace",
			"getChartColor",
			"GRID_PROPS",
			"RESPONSIVE_CONTAINER_PROPS",
			"seriesColor",
		],
	},
	"@nocoo/basalt/charts/series": {
		ownerDoc: "packages/basalt/ai/COMPATIBILITY.md#chart-series",
		kind: "chart-subsystem",
		summary: "Chart series descriptor resolution and color assignment utilities",
		knownSymbols: [
			"applyLeadColor",
			"BulletPoint",
			"BulletSeriesDescriptor",
			"BulletSeriesKey",
			"ChartSeriesDescriptor",
			"NamedValue",
			"RadarPoint",
			"resolveChartSeries",
			"SankeyData",
			"xyFallbackKeys",
			"XYPoint",
			"XYSeriesDescriptor",
			"XYSeriesKey",
		],
	},
	// Explicit legacy / internal building blocks exposed via wildcard in v2.0.3
	"@nocoo/basalt/components/typeahead-field": {
		ownerDoc: "packages/basalt/ai/COMPATIBILITY.md#wildcard-subpaths",
		kind: "legacy-internal",
		summary: "Internal composite input base for autocomplete and combobox",
		knownSymbols: ["TypeaheadField", "TypeaheadItem"],
	},
	"@nocoo/basalt/components/overlay": {
		ownerDoc: "packages/basalt/ai/COMPATIBILITY.md#wildcard-subpaths",
		kind: "legacy-internal",
		summary: "Internal class generators and spacing constants for overlay menus and select",
		knownSymbols: [
			"FOCUS_BORDER",
			"FOCUS_INSET",
			"FOCUS_RING",
			"MENU_GAP",
			"OVERLAY_GAP",
			"OVERLAY_LAYER",
			"OVERLAY_MOTION",
			"overlayItemClass",
			"overlayPanelClass",
		],
	},
	"@nocoo/basalt/charts/sample": {
		ownerDoc: "packages/basalt/ai/COMPATIBILITY.md#wildcard-subpaths",
		kind: "legacy-internal",
		summary: "Static mock datasets used for fallback preview rendering",
		knownSymbols: [
			"BULLET_SAMPLE",
			"BulletPoint",
			"DONUT_SAMPLE",
			"FUNNEL_SAMPLE",
			"NamedValue",
			"RADAR_SAMPLE",
			"RadarPoint",
			"SAMPLE",
			"SANKEY_SAMPLE",
			"SankeyData",
			"XYPoint",
		],
	},
};

/**
 * Explicit registry for known exported helper symbols inside catalog modules that do not
 * share the primary PascalCase exportName prefix. Any new unowned helper added to a module
 * will fail derivation fast.
 */
export const REGISTERED_CATALOG_HELPERS: Record<string, string[]> = {
	"@nocoo/basalt/charts/chart-colors": ["CHART_COLORS"],
	"@nocoo/basalt/charts/heatmap-calendar": ["heatmapColorScales", "HeatmapDataPoint"],
	"@nocoo/basalt/charts/palette": ["chart", "CHART_COLORS", "chartAxis", "chartMuted", "withAlpha"],
	"@nocoo/basalt/charts/slot-bar": ["SlotBarDataProps", "SlotBarItem", "SlotBarItemsProps"],
	"@nocoo/basalt/charts/stat-card": ["StatGrid", "StatGridProps"],
	"@nocoo/basalt/components/button": ["buttonVariants"],
	"@nocoo/basalt/components/command-palette": [
		"CommandEmpty",
		"CommandGroup",
		"CommandInput",
		"CommandItem",
		"CommandList",
		"CommandSeparator",
		"CommandShortcut",
	],
	"@nocoo/basalt/components/confirm-dialog": [
		"useConfirm",
		"UseConfirmOptions",
		"UseConfirmResult",
	],
	"@nocoo/basalt/components/dialog": ["DIALOG_SIZES", "dialogOverlayClass", "dialogPanelClass"],
	"@nocoo/basalt/components/popover": ["POPOVER_SIDES"],
	"@nocoo/basalt/components/sidebar": ["ContentIsland", "useSidebar"],
	"@nocoo/basalt/components/toast": ["toast"],
	"@nocoo/basalt/providers/link": ["useLinkComponent"],
	"@nocoo/basalt/providers/theme": ["BasaltTheme", "useTheme"],
};

export const CSS_EXPORT_OWNERS: Record<string, { ownerDoc: string; summary: string }> = {
	"./styles": {
		ownerDoc: "README.md#css-setup",
		summary: "Tailwind v4 theme token definition stylesheet",
	},
	"./styles/tailwind": {
		ownerDoc: "README.md#css-setup",
		summary: "Tailwind v4 theme token definition stylesheet alias",
	},
	"./styles/standalone": {
		ownerDoc: "README.md#css-setup",
		summary: "Zero-dependency precompiled CSS tokens, control utilities, and animations",
	},
};

/**
 * Resolves the most specific catalog item for a given symbol name.
 * When a module contains multiple catalog items (e.g. Button + LinkButton in button.tsx,
 * or Code + CodeBlock in code.tsx), matches by longest exportName prefix so that LinkButton*
 * resolves to 'link-button' rather than the parent 'button'.
 */
export function resolveCatalogItemForSymbol(
	catalogItems: readonly (typeof CATALOG)[0][],
	symName: string,
): (typeof CATALOG)[0] {
	if (catalogItems.length <= 1) {
		return catalogItems[0];
	}
	const sorted = [...catalogItems].sort((a, b) => b.exportName.length - a.exportName.length);
	const matched = sorted.find((c) => symName.startsWith(c.exportName));
	return matched ?? catalogItems[0];
}

/**
 * Maps a resolved dist importTarget (e.g. "./dist/components/button.js" or "./dist/lib/audit-button.js")
 * to its actual TypeScript source file in packages/basalt/src.
 */
export function mapDistTargetToSourceFile(repoRoot: string, targetPath: string): string {
	let sub = targetPath.replace(/^\.\//, "");
	if (sub.startsWith("dist/")) {
		sub = sub.slice("dist/".length);
	}
	const withoutExt = sub.replace(/\.(js|mjs|cjs|d\.ts)$/, "");

	const pkgSrc = path.join(repoRoot, "packages/basalt/src");
	for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
		const cand = path.join(pkgSrc, `${withoutExt}${ext}`);
		if (existsSync(cand)) {
			return path.relative(repoRoot, cand);
		}
	}
	return path.relative(repoRoot, path.join(pkgSrc, `${withoutExt}.ts`));
}

/**
 * Discovers all public source modules strictly from package.json "exports".
 * Walks source tree and tests each file against resolvePackageExportTarget,
 * respecting explicit null overrides, exact aliases, and wildcards without dist.
 */
export function discoverExportedModulesFromSource(
	repoRoot: string,
	exportsField: Record<string, unknown>,
): { subpath: string; importPath: string; sourceFile: string }[] {
	const packageRoot = path.join(repoRoot, "packages/basalt");
	const srcRoot = path.join(packageRoot, "src");
	if (!existsSync(srcRoot)) {
		throw new Error(`packages/basalt/src directory not found at ${srcRoot}`);
	}

	function walk(dir: string): string[] {
		const res: string[] = [];
		for (const f of readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, f.name);
			if (f.isDirectory()) {
				res.push(...walk(full));
			} else if (
				(f.name.endsWith(".ts") || f.name.endsWith(".tsx")) &&
				!f.name.endsWith(".d.ts") &&
				!f.name.endsWith(".test.ts") &&
				!f.name.endsWith(".test.tsx")
			) {
				res.push(full);
			}
		}
		return res;
	}

	const allSourceFiles = walk(srcRoot);
	const candidateSubpaths = new Set<string>();

	for (const file of allSourceFiles) {
		const rel = path.relative(srcRoot, file).replace(/\.tsx?$/, "");
		if (rel === "index") {
			candidateSubpaths.add(".");
		}

		// Predicted dist output for this source file
		const predictedDist = `dist/${rel}.js`;

		for (const [exportKey, exportVal] of Object.entries(exportsField)) {
			if (exportKey === ".") {
				candidateSubpaths.add(".");
				continue;
			}
			if (!exportKey.includes("*")) {
				continue;
			}

			let targetPattern: string | null = null;
			if (typeof exportVal === "string") {
				targetPattern = exportVal;
			} else if (exportVal && typeof exportVal === "object" && "import" in exportVal) {
				targetPattern = (exportVal as { import?: string }).import ?? null;
			}

			if (!targetPattern || typeof targetPattern !== "string" || !targetPattern.includes("*")) {
				continue;
			}

			const normTarget = targetPattern.replace(/^\.\//, "");
			const [targetPrefix, targetSuffix] = normTarget.split("*");
			if (predictedDist.startsWith(targetPrefix) && predictedDist.endsWith(targetSuffix)) {
				const wildcardVal = predictedDist.slice(
					targetPrefix.length,
					predictedDist.length - targetSuffix.length,
				);
				const subpath = exportKey.replace("*", wildcardVal);
				candidateSubpaths.add(subpath);
			}
		}
	}

	// Also include all explicit non-wildcard keys in exportsField
	for (const exportKey of Object.keys(exportsField)) {
		if (!exportKey.includes("*")) {
			candidateSubpaths.add(exportKey);
		}
	}

	const matchedModules: { subpath: string; importPath: string; sourceFile: string }[] = [];

	for (const subpath of candidateSubpaths) {
		if (subpath in exportsField && exportsField[subpath] === null) {
			continue;
		}

		const resolved = resolvePackageExportTarget(subpath, exportsField);
		if (!resolved?.importTarget) {
			continue;
		}

		if (resolved.importTarget.endsWith(".css")) {
			continue;
		}

		const sourceFile = mapDistTargetToSourceFile(repoRoot, resolved.importTarget);
		const importPath =
			subpath === "." ? "@nocoo/basalt" : `@nocoo/basalt/${subpath.replace(/^\.\//, "")}`;

		matchedModules.push({
			subpath,
			importPath,
			sourceFile,
		});
	}

	return matchedModules.sort((a, b) => a.subpath.localeCompare(b.subpath));
}

/**
 * Creates a source-only TypeScript program for compiler API analysis.
 */
export function createSourceProgram(repoRoot: string, filePaths: string[]) {
	const tsconfigPath = path.join(repoRoot, "tsconfig.catalog-api.json");
	let compilerOptions: tsApi.CompilerOptions = {
		target: ts.ScriptTarget.ES2022,
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
		strict: true,
		skipLibCheck: true,
		jsx: ts.JsxEmit.ReactJSX,
		noEmit: true,
	};
	if (existsSync(tsconfigPath)) {
		const raw = readFileSync(tsconfigPath, "utf8");
		const parsed = ts.parseConfigFileTextToJson(tsconfigPath, raw);
		if (parsed.config?.compilerOptions) {
			const conv = ts.convertCompilerOptionsFromJson(parsed.config.compilerOptions, repoRoot);
			if (conv.options) compilerOptions = { ...compilerOptions, ...conv.options };
		}
	}
	return ts.createProgram(filePaths, compilerOptions);
}

/**
 * Derives the complete public surface manifest directly from actual package exports and source files.
 * Uses TypeScript compiler API typechecker to preserve true value and type semantics, export *, and re-exports.
 */
export function derivePublicSurfaceManifest(repoRoot = process.cwd()): PublicSurfaceManifest {
	const packageJsonPath = path.join(repoRoot, "packages/basalt/package.json");
	if (!existsSync(packageJsonPath)) {
		throw new Error(`packages/basalt/package.json not found at ${packageJsonPath}`);
	}

	const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
		version: string;
		exports: Record<string, unknown>;
	};

	// 1. Discover all exported modules from package.json exports
	const exportedModules = discoverExportedModulesFromSource(repoRoot, pkg.exports);

	// 2. Build catalog index by importPath
	const catalogByImportPath = new Map<string, (typeof CATALOG)[0][]>();
	for (const c of CATALOG) {
		const list = catalogByImportPath.get(c.importPath) ?? [];
		list.push(c);
		catalogByImportPath.set(c.importPath, list);
	}

	// 3. Create TypeScript compiler API program over all exported source files
	const validFiles = exportedModules
		.filter((m) => m.sourceFile && existsSync(path.join(repoRoot, m.sourceFile)))
		.map((m) => path.resolve(repoRoot, m.sourceFile));

	const program = createSourceProgram(repoRoot, validFiles);
	const checker = program.getTypeChecker();

	let totalValues = 0;
	let totalTypes = 0;
	const modules: DiscoveredExportModule[] = [];

	for (const mod of exportedModules) {
		if (!mod.sourceFile || !existsSync(path.join(repoRoot, mod.sourceFile))) {
			throw new Error(
				`unowned or unresolvable public export subpath: '${mod.subpath}' -> '${mod.importPath}'. Source file missing.`,
			);
		}

		// Check module documentation owner
		let modOwner: DocOwnerInfo | undefined;
		if (mod.subpath === ".") {
			modOwner = {
				ownerDoc: "README.md#component-usage",
				kind: "catalog-component",
				summary: "Basalt root entrypoint exporting foundational controls, inputs, and providers",
			};
		} else {
			const catalogItems = catalogByImportPath.get(mod.importPath);
			if (catalogItems && catalogItems.length > 0) {
				modOwner = {
					ownerDoc: `src/pages/ui/${catalogItems[0].slug}`,
					kind: "catalog-component",
					summary: `${catalogItems[0].name} component documentation and catalog playground`,
				};
			} else if (NON_CATALOG_SURFACE_OWNERS[mod.importPath]) {
				modOwner = NON_CATALOG_SURFACE_OWNERS[mod.importPath];
			}
		}

		if (!modOwner) {
			throw new Error(
				`unowned public module surface: '${mod.importPath}' (${mod.sourceFile}). Every public module must be registered in CATALOG or NON_CATALOG_SURFACE_OWNERS.`,
			);
		}

		// Analyze exports using Compiler API
		const absPath = path.resolve(repoRoot, mod.sourceFile);
		const sf = program.getSourceFile(absPath);
		if (!sf) {
			throw new Error(`failed to load TypeScript source file: ${absPath}`);
		}

		const modSym = checker.getSymbolAtLocation(sf);
		if (!modSym) {
			throw new Error(`failed to resolve module symbol: ${absPath}`);
		}

		const rawExports = checker.getExportsOfModule(modSym);
		const symbols: DiscoveredPublicSymbol[] = [];

		for (const exp of rawExports) {
			const symName = exp.getName();
			const target =
				(exp.getFlags() & ts.SymbolFlags.Alias) !== 0 ? checker.getAliasedSymbol(exp) : exp;
			const targetFlags = target.getFlags();

			let isValue = (targetFlags & ts.SymbolFlags.Value) !== 0;
			let isType = (targetFlags & ts.SymbolFlags.Type) !== 0;

			// Respect explicit type-only re-export syntax (e.g., export type { Button } from "...")
			for (const decl of exp.getDeclarations() ?? []) {
				if (ts.isExportSpecifier(decl)) {
					const isExplicitTypeOnly =
						decl.isTypeOnly ||
						(ts.isNamedExports(decl.parent) &&
							ts.isExportDeclaration(decl.parent.parent) &&
							decl.parent.parent.isTypeOnly);
					if (isExplicitTypeOnly) {
						isValue = false;
						isType = true;
					}
				}
			}

			// Trace origin declaration file
			const decls = target.getDeclarations();
			const declFile = decls?.[0]?.getSourceFile()?.fileName ?? absPath;

			// Determine origin importPath
			let originModule = mod.importPath;
			if (mod.subpath === ".") {
				// For root re-export, map origin from decl file
				const relToSrc = path.relative(path.join(repoRoot, "packages/basalt/src"), declFile);
				const sub = relToSrc.replace(/\.tsx?$/, "");
				originModule = sub === "index" ? "@nocoo/basalt" : `@nocoo/basalt/${sub}`;
			}

			// Validate symbol ownership
			let symOwnerDoc = modOwner.ownerDoc;
			let symOwnerKind = modOwner.kind;

			if (mod.subpath === ".") {
				// Root re-export validation: originModule must be recognized
				const originCatalog = catalogByImportPath.get(originModule);
				if (originCatalog && originCatalog.length > 0) {
					// Origin is a catalog component: verify that symbol belongs to it
					const catalogItems = originCatalog;
					const prefixes = catalogItems.map((c) => c.exportName);
					const isPrefixed = prefixes.some((p) => symName.startsWith(p));
					const registeredHelpers = new Set(REGISTERED_CATALOG_HELPERS[originModule] ?? []);
					if (!isPrefixed && !registeredHelpers.has(symName)) {
						throw new Error(
							`unowned public symbol '${symName}' in root entrypoint re-exported from '${originModule}'. Symbol must be prefixed by component exportName or registered in REGISTERED_CATALOG_HELPERS.`,
						);
					}
					const bestMatch = resolveCatalogItemForSymbol(catalogItems, symName);
					symOwnerDoc = `src/pages/ui/${bestMatch.slug}`;
					symOwnerKind = "catalog-component";
				} else if (NON_CATALOG_SURFACE_OWNERS[originModule]) {
					const registeredModule = NON_CATALOG_SURFACE_OWNERS[originModule];
					if (registeredModule.knownSymbols && !registeredModule.knownSymbols.includes(symName)) {
						throw new Error(
							`unowned public symbol '${symName}' re-exported on root from '${originModule}'. Symbol is not registered in knownSymbols for this module.`,
						);
					}
					symOwnerDoc = registeredModule.ownerDoc;
					symOwnerKind = registeredModule.kind;
				} else {
					throw new Error(
						`unowned public symbol '${symName}' re-exported on root from unowned module '${originModule}'`,
					);
				}
			} else {
				// Granular module symbol validation
				const catalogItems = catalogByImportPath.get(mod.importPath);
				if (catalogItems && catalogItems.length > 0) {
					const prefixes = catalogItems.map((c) => c.exportName);
					const isPrefixed = prefixes.some((p) => symName.startsWith(p));
					const registeredHelpers = new Set(REGISTERED_CATALOG_HELPERS[mod.importPath] ?? []);
					if (!isPrefixed && !registeredHelpers.has(symName)) {
						throw new Error(
							`unowned public helper or symbol '${symName}' in '${mod.importPath}'. Every symbol in a catalog module must start with the component exportName or be registered in REGISTERED_CATALOG_HELPERS.`,
						);
					}
					const bestMatch = resolveCatalogItemForSymbol(catalogItems, symName);
					symOwnerDoc = `src/pages/ui/${bestMatch.slug}`;
					symOwnerKind = "catalog-component";
				} else if (NON_CATALOG_SURFACE_OWNERS[mod.importPath]) {
					const registeredModule = NON_CATALOG_SURFACE_OWNERS[mod.importPath];
					if (registeredModule.knownSymbols && !registeredModule.knownSymbols.includes(symName)) {
						throw new Error(
							`unowned public helper or symbol '${symName}' in registered non-catalog module '${mod.importPath}'. Symbol must be explicitly registered in knownSymbols.`,
						);
					}
				}
			}

			if (isValue) totalValues++;
			if (isType) totalTypes++;

			symbols.push({
				name: symName,
				isValue,
				isType,
				ownerDoc: symOwnerDoc,
				ownerKind: symOwnerKind,
				originModule,
			});
		}

		modules.push({
			subpath: mod.subpath,
			importPath: mod.importPath,
			sourceFile: mod.sourceFile,
			ownerDoc: modOwner.ownerDoc,
			ownerKind: modOwner.kind,
			summary: modOwner.summary,
			symbols,
		});
	}

	// 4. Process CSS exports
	const cssExports: DiscoveredCssExport[] = [];
	for (const [subpath, target] of Object.entries(pkg.exports)) {
		if (typeof target === "string" && target.endsWith(".css")) {
			const info = CSS_EXPORT_OWNERS[subpath];
			if (!info) {
				throw new Error(
					`unowned CSS export '${subpath}'. Every CSS export must be registered in CSS_EXPORT_OWNERS.`,
				);
			}
			const importPath =
				subpath === "./styles"
					? "@nocoo/basalt/styles"
					: `@nocoo/basalt/${subpath.replace("./", "")}`;
			cssExports.push({
				subpath,
				importPath,
				target,
				ownerDoc: info.ownerDoc,
				ownerKind: "stylesheet",
				summary: info.summary,
			});
		}
	}

	return {
		packageVersion: pkg.version,
		totalModules: modules.length,
		totalSymbols: modules.reduce((acc, m) => acc + m.symbols.length, 0),
		totalValues,
		totalTypes,
		totalCssExports: cssExports.length,
		modules,
		cssExports,
	};
}

export function renderPublicSurfaceManifest(manifest: PublicSurfaceManifest): string {
	return [
		"// Generated by scripts/catalog-surface-owners.ts. Do not edit.",
		"// biome-ignore format: generated deterministic pure-data manifest",
		`export const PUBLIC_SURFACE_MANIFEST = ${JSON.stringify(manifest, null, "\t")} as const;`,
		"",
	].join("\n");
}

export function checkSurfaceManifestFreshness(repoRoot = process.cwd()): void {
	const targetPath = path.join(repoRoot, GENERATED_SURFACE_MANIFEST_RELATIVE);
	if (!existsSync(targetPath)) {
		throw new Error(
			`missing public surface manifest at ${GENERATED_SURFACE_MANIFEST_RELATIVE}; run ${SURFACE_MANIFEST_COMMAND}`,
		);
	}
	const expected = renderPublicSurfaceManifest(derivePublicSurfaceManifest(repoRoot));
	const actual = readFileSync(targetPath, "utf8");
	if (actual !== expected) {
		throw new Error(
			`stale public surface manifest at ${GENERATED_SURFACE_MANIFEST_RELATIVE}; run ${SURFACE_MANIFEST_COMMAND}`,
		);
	}
}

export function writeSurfaceManifest(repoRoot = process.cwd()): void {
	const targetPath = path.join(repoRoot, GENERATED_SURFACE_MANIFEST_RELATIVE);
	mkdirSync(path.dirname(targetPath), { recursive: true });
	const content = renderPublicSurfaceManifest(derivePublicSurfaceManifest(repoRoot));
	writeFileSync(targetPath, content);
}
