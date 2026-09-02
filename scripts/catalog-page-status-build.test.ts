import { readFileSync } from "node:fs";
import { build, type PluginOption } from "vite";
import { describe, expect, it } from "vitest";
import { showcaseBuildConfig } from "./catalog-page-status-build";

interface BuiltChunk {
	fileName: string;
	code: string;
	isEntry: boolean;
	isDynamicEntry: boolean;
	imports: string[];
	dynamicImports: string[];
	modules: string[];
	facadeModuleId: string | null;
}

const PAGE_MODULES = [
	"AccountsPage.tsx",
	"BankingDashboardPage.tsx",
	"ComponentsPage.tsx",
	"DashboardPage.tsx",
	"DataPage.tsx",
	"FlowComparisonPage.tsx",
	"FormsPage.tsx",
	"HealthPage.tsx",
	"InteractionShowcasePage.tsx",
	"InteractivePage.tsx",
	"LayoutPage.tsx",
	"LoadingPage.tsx",
	"LoginPage.tsx",
	"NavigationPage.tsx",
	"NetworkOpsDashboardPage.tsx",
	"NotFound.tsx",
	"PalettePage.tsx",
	"PortfolioPage.tsx",
	"ProgressTrackingPage.tsx",
	"SettingsPage.tsx",
	"StaticPage.tsx",
	"ui/UiIndexPage.tsx",
	"ui/UiPlaceholderPage.tsx",
	"WearableDashboardPage.tsx",
] as const;

describe("application route build boundary", () => {
	it("declares every page module as a genuine lazy import behind one fallback", () => {
		const source = readFileSync("src/App.tsx", "utf8");
		for (const page of PAGE_MODULES) {
			const specifier = `./pages/${page.replace(/\.tsx$/, "")}`;
			expect(source).toContain(`lazy(() => import(${JSON.stringify(specifier)}))`);
			expect(source).not.toMatch(
				new RegExp(
					`import\\s+[^;]+\\s+from\\s+["']${specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
				),
			);
		}
		expect(source.match(/<Suspense /g)).toHaveLength(1);
		expect(source.match(/fallback={<RouteLoadingFallback \/>}/g)).toHaveLength(1);
		expect(source).toContain('role="status"');
		expect(source).toContain('aria-live="polite"');
	});

	it("keeps heavy catalog data and every page outside the production entry static closure", async () => {
		let chunks: BuiltChunk[] = [];
		const evidencePlugin: PluginOption = {
			name: "catalog-route-boundary-evidence",
			generateBundle(_options, bundle) {
				chunks = Object.values(bundle).flatMap((output) =>
					output.type === "chunk"
						? [
								{
									fileName: output.fileName,
									code: output.code,
									isEntry: output.isEntry,
									isDynamicEntry: output.isDynamicEntry,
									imports: [...output.imports],
									dynamicImports: [...output.dynamicImports],
									modules: Object.keys(output.modules),
									facadeModuleId: output.facadeModuleId,
								},
							]
						: [],
				);
			},
		};
		await build({
			...showcaseBuildConfig({ write: false, plugins: [evidencePlugin] }),
			logLevel: "silent",
		});

		const entry = chunks.find((chunk) => chunk.isEntry);
		expect(entry).toBeDefined();
		expect(new TextEncoder().encode(entry?.code).byteLength).toBeLessThan(500_000);

		const chunksByFile = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
		for (const suffix of [
			"/src/pages/ui/catalog-content-legacy.ts",
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
		]) {
			expect(
				chunks.some((chunk) => chunk.modules.some((id) => id.endsWith(suffix))),
				`production build contains removed owner ${suffix}`,
			).toBe(false);
		}
		const staticFiles = new Set<string>();
		const visitStatic = (chunk: BuiltChunk | undefined) => {
			if (!chunk || staticFiles.has(chunk.fileName)) return;
			staticFiles.add(chunk.fileName);
			for (const imported of chunk.imports) visitStatic(chunksByFile.get(imported));
		};
		visitStatic(entry);
		const staticModules = chunks
			.filter((chunk) => staticFiles.has(chunk.fileName))
			.flatMap((chunk) => chunk.modules);
		const forbidden = [
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
			...PAGE_MODULES.map((page) => `/src/pages/${page}`),
		];
		for (const suffix of forbidden) {
			expect(
				staticModules.some((id) => id.endsWith(suffix)),
				suffix,
			).toBe(false);
		}

		for (const page of PAGE_MODULES) {
			const suffix = `/src/pages/${page}`;
			expect(
				chunks.some((chunk) => chunk.isDynamicEntry && chunk.facadeModuleId?.endsWith(suffix)),
				suffix,
			).toBe(true);
		}
		expect(entry?.dynamicImports.length).toBeGreaterThanOrEqual(PAGE_MODULES.length);

		const catalogPage = chunks.find((chunk) =>
			chunk.facadeModuleId?.endsWith("/src/pages/ui/UiPlaceholderPage.tsx"),
		);
		expect(catalogPage?.isDynamicEntry).toBe(true);
		const catalogPageFiles = new Set<string>();
		const visitCatalogPageStatic = (chunk: BuiltChunk | undefined) => {
			if (!chunk || catalogPageFiles.has(chunk.fileName)) return;
			catalogPageFiles.add(chunk.fileName);
			for (const imported of chunk.imports) visitCatalogPageStatic(chunksByFile.get(imported));
		};
		visitCatalogPageStatic(catalogPage);
		const catalogPageModules = chunks
			.filter((chunk) => catalogPageFiles.has(chunk.fileName))
			.flatMap((chunk) => chunk.modules);
		for (const suffix of [
			"/src/pages/ui/catalog-index.ts",
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
		]) {
			expect(
				catalogPageModules.some((id) => id.endsWith(suffix)),
				`catalog detail static closure contains ${suffix}`,
			).toBe(false);
		}

		const indexPage = chunks.find((chunk) =>
			chunk.facadeModuleId?.endsWith("/src/pages/ui/UiIndexPage.tsx"),
		);
		expect(indexPage?.isDynamicEntry).toBe(true);
		const indexStaticFiles = new Set<string>();
		const visitIndexStatic = (chunk: BuiltChunk | undefined) => {
			if (!chunk || indexStaticFiles.has(chunk.fileName)) return;
			indexStaticFiles.add(chunk.fileName);
			for (const imported of chunk.imports) visitIndexStatic(chunksByFile.get(imported));
		};
		visitIndexStatic(indexPage);
		const indexStaticModules = chunks
			.filter((chunk) => indexStaticFiles.has(chunk.fileName))
			.flatMap((chunk) => chunk.modules);
		expect(
			indexStaticModules.some((id) => /catalog-content\/families\/[^/]+\.tsx$/.test(id)),
			"catalog index statically imports a content family",
		).toBe(false);

		const indexReachableFiles = new Set<string>();
		const visitIndexReachable = (chunk: BuiltChunk | undefined) => {
			if (!chunk || indexReachableFiles.has(chunk.fileName)) return;
			indexReachableFiles.add(chunk.fileName);
			for (const imported of [...chunk.imports, ...chunk.dynamicImports]) {
				visitIndexReachable(chunksByFile.get(imported));
			}
		};
		visitIndexReachable(indexPage);
		const indexFamilies = new Set(
			chunks
				.filter((chunk) => indexReachableFiles.has(chunk.fileName))
				.flatMap((chunk) => chunk.modules)
				.flatMap((id) => id.match(/catalog-content\/families\/([^/]+)\.tsx$/)?.[1] ?? []),
		);
		expect([...indexFamilies].sort()).toEqual([
			"charts",
			"data-layout",
			"docs",
			"feedback",
			"forms",
			"foundation",
			"navigation",
			"overlay",
		]);

		const foundation = chunks.find((chunk) =>
			chunk.modules.some((id) =>
				id.endsWith("/src/pages/ui/catalog-content/families/foundation.tsx"),
			),
		);
		expect(foundation).toBeDefined();
		const foundationFiles = new Set<string>();
		const visitFoundation = (chunk: BuiltChunk | undefined) => {
			if (!chunk || foundationFiles.has(chunk.fileName)) return;
			foundationFiles.add(chunk.fileName);
			for (const imported of chunk.imports) visitFoundation(chunksByFile.get(imported));
		};
		visitFoundation(foundation);
		const foundationModules = chunks
			.filter((chunk) => foundationFiles.has(chunk.fileName))
			.flatMap((chunk) => chunk.modules);
		for (const suffix of [
			"/src/pages/ui/catalog-content-legacy.ts",
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
			"/src/charts/sample.ts",
			"/packages/basalt/src/charts/sample.ts",
		]) {
			expect(
				foundationModules.some((id) => id.endsWith(suffix)),
				`button family closure contains ${suffix}`,
			).toBe(false);
		}
		expect(
			foundationModules.some((id) => /recharts/i.test(id)),
			"button family closure contains recharts",
		).toBe(false);
		expect(
			foundationModules.some((id) =>
				/catalog-content\/families\/(data-layout|forms|overlay|feedback|navigation|charts)\.tsx$/.test(
					id,
				),
			),
			"button family closure contains another family",
		).toBe(false);

		const forms = chunks.find((chunk) =>
			chunk.modules.some((id) => id.endsWith("/src/pages/ui/catalog-content/families/forms.tsx")),
		);
		expect(forms).toBeDefined();
		const formsFiles = new Set<string>();
		const visitForms = (chunk: BuiltChunk | undefined) => {
			if (!chunk || formsFiles.has(chunk.fileName)) return;
			formsFiles.add(chunk.fileName);
			for (const imported of chunk.imports) visitForms(chunksByFile.get(imported));
		};
		visitForms(forms);
		const formsModules = chunks
			.filter((chunk) => formsFiles.has(chunk.fileName))
			.flatMap((chunk) => chunk.modules);
		for (const suffix of [
			"/src/pages/ui/catalog-content-legacy.ts",
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
			"/src/charts/sample.ts",
			"/packages/basalt/src/charts/sample.ts",
		]) {
			expect(
				formsModules.some((id) => id.endsWith(suffix)),
				`input-group family closure contains ${suffix}`,
			).toBe(false);
		}
		expect(
			formsModules.some((id) => /recharts/i.test(id)),
			"input-group family closure contains recharts",
		).toBe(false);
		expect(
			formsModules.some((id) =>
				/catalog-content\/families\/(data-layout|foundation|overlay|feedback|navigation|charts)\.tsx$/.test(
					id,
				),
			),
			"input-group family closure contains another family",
		).toBe(false);

		const overlay = chunks.find((chunk) =>
			chunk.modules.some((id) => id.endsWith("/src/pages/ui/catalog-content/families/overlay.tsx")),
		);
		expect(overlay).toBeDefined();
		const overlayFiles = new Set<string>();
		const visitOverlay = (chunk: BuiltChunk | undefined) => {
			if (!chunk || overlayFiles.has(chunk.fileName)) return;
			overlayFiles.add(chunk.fileName);
			for (const imported of chunk.imports) visitOverlay(chunksByFile.get(imported));
		};
		visitOverlay(overlay);
		const overlayModules = chunks
			.filter((chunk) => overlayFiles.has(chunk.fileName))
			.flatMap((chunk) => chunk.modules);
		for (const suffix of [
			"/src/pages/ui/catalog-content-legacy.ts",
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
			"/src/charts/sample.ts",
			"/packages/basalt/src/charts/sample.ts",
		]) {
			expect(
				overlayModules.some((id) => id.endsWith(suffix)),
				`dialog family closure contains ${suffix}`,
			).toBe(false);
		}
		expect(
			overlayModules.some((id) => /recharts/i.test(id)),
			"dialog family closure contains recharts",
		).toBe(false);
		expect(
			overlayModules.some((id) =>
				/catalog-content\/families\/(data-layout|foundation|forms|feedback|navigation|charts)\.tsx$/.test(
					id,
				),
			),
			"dialog family closure contains another family",
		).toBe(false);

		const feedback = chunks.find((chunk) =>
			chunk.modules.some((id) =>
				id.endsWith("/src/pages/ui/catalog-content/families/feedback.tsx"),
			),
		);
		expect(feedback).toBeDefined();
		const feedbackFiles = new Set<string>();
		const visitFeedback = (chunk: BuiltChunk | undefined) => {
			if (!chunk || feedbackFiles.has(chunk.fileName)) return;
			feedbackFiles.add(chunk.fileName);
			for (const imported of chunk.imports) visitFeedback(chunksByFile.get(imported));
		};
		visitFeedback(feedback);
		const feedbackModules = chunks
			.filter((chunk) => feedbackFiles.has(chunk.fileName))
			.flatMap((chunk) => chunk.modules);
		for (const suffix of [
			"/src/pages/ui/catalog-content-legacy.ts",
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
			"/src/charts/sample.ts",
			"/packages/basalt/src/charts/sample.ts",
		]) {
			expect(
				feedbackModules.some((id) => id.endsWith(suffix)),
				`banner family closure contains ${suffix}`,
			).toBe(false);
		}
		expect(
			feedbackModules.some((id) => /recharts/i.test(id)),
			"banner family closure contains recharts",
		).toBe(false);
		expect(
			feedbackModules.some((id) =>
				/catalog-content\/families\/(data-layout|foundation|forms|overlay|navigation|charts)\.tsx$/.test(
					id,
				),
			),
			"banner family closure contains another family",
		).toBe(false);

		const navigation = chunks.find((chunk) =>
			chunk.modules.some((id) =>
				id.endsWith("/src/pages/ui/catalog-content/families/navigation.tsx"),
			),
		);
		expect(navigation).toBeDefined();
		const navigationFiles = new Set<string>();
		const visitNavigation = (chunk: BuiltChunk | undefined) => {
			if (!chunk || navigationFiles.has(chunk.fileName)) return;
			navigationFiles.add(chunk.fileName);
			for (const imported of chunk.imports) visitNavigation(chunksByFile.get(imported));
		};
		visitNavigation(navigation);
		const navigationModules = chunks
			.filter((chunk) => navigationFiles.has(chunk.fileName))
			.flatMap((chunk) => chunk.modules);
		for (const suffix of [
			"/src/pages/ui/catalog-content-legacy.ts",
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
			"/src/charts/sample.ts",
			"/packages/basalt/src/charts/sample.ts",
		]) {
			expect(
				navigationModules.some((id) => id.endsWith(suffix)),
				`tabs family closure contains ${suffix}`,
			).toBe(false);
		}
		expect(
			navigationModules.some((id) => /recharts/i.test(id)),
			"tabs family closure contains recharts",
		).toBe(false);
		expect(
			navigationModules.some((id) =>
				/catalog-content\/families\/(data-layout|foundation|forms|overlay|feedback|charts)\.tsx$/.test(
					id,
				),
			),
			"tabs family closure contains another family",
		).toBe(false);

		const dataLayout = chunks.find((chunk) =>
			chunk.modules.some((id) =>
				id.endsWith("/src/pages/ui/catalog-content/families/data-layout.tsx"),
			),
		);
		expect(dataLayout).toBeDefined();
		const dataLayoutFiles = new Set<string>();
		const visitDataLayout = (chunk: BuiltChunk | undefined) => {
			if (!chunk || dataLayoutFiles.has(chunk.fileName)) return;
			dataLayoutFiles.add(chunk.fileName);
			for (const imported of chunk.imports) visitDataLayout(chunksByFile.get(imported));
		};
		visitDataLayout(dataLayout);
		const dataLayoutModules = chunks
			.filter((chunk) => dataLayoutFiles.has(chunk.fileName))
			.flatMap((chunk) => chunk.modules);
		for (const suffix of [
			"/src/pages/ui/catalog-content-legacy.ts",
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
			"/src/charts/sample.ts",
			"/packages/basalt/src/charts/sample.ts",
		]) {
			expect(
				dataLayoutModules.some((id) => id.endsWith(suffix)),
				`table family closure contains ${suffix}`,
			).toBe(false);
		}
		expect(
			dataLayoutModules.some((id) => /recharts/i.test(id)),
			"table family closure contains recharts",
		).toBe(false);
		expect(
			dataLayoutModules.some((id) =>
				/catalog-content\/families\/(foundation|forms|overlay|feedback|navigation|charts)\.tsx$/.test(
					id,
				),
			),
			"table family closure contains another family",
		).toBe(false);

		const charts = chunks.find((chunk) =>
			chunk.modules.some((id) => id.endsWith("/src/pages/ui/catalog-content/families/charts.tsx")),
		);
		expect(charts).toBeDefined();
		const chartsFiles = new Set<string>();
		const visitCharts = (chunk: BuiltChunk | undefined) => {
			if (!chunk || chartsFiles.has(chunk.fileName)) return;
			chartsFiles.add(chunk.fileName);
			for (const imported of chunk.imports) visitCharts(chunksByFile.get(imported));
		};
		visitCharts(charts);
		const chartsModules = chunks
			.filter((chunk) => chartsFiles.has(chunk.fileName))
			.flatMap((chunk) => chunk.modules);
		for (const suffix of [
			"/src/pages/ui/catalog-content-legacy.ts",
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
		]) {
			expect(
				chartsModules.some((id) => id.endsWith(suffix)),
				`charts family closure contains ${suffix}`,
			).toBe(false);
		}
		expect(
			chartsModules.some((id) =>
				/catalog-content\/families\/(data-layout|foundation|forms|overlay|feedback|navigation)\.tsx$/.test(
					id,
				),
			),
			"charts family closure contains another family",
		).toBe(false);
	});
});
