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
	"BadgeLoginPage.tsx",
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
		for (const suffix of [
			"/src/pages/ui/catalog-ready.tsx",
			"/src/pages/ui/kumo-examples.tsx",
			"/src/pages/ui/docs.ts",
			"/src/pages/ui/demos.tsx",
		]) {
			expect(
				chunks.some((chunk) => chunk.modules.some((id) => id.endsWith(suffix))),
				`production build is missing legacy owner ${suffix}`,
			).toBe(true);
		}

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
				/catalog-content\/families\/(forms|overlay|charts)\.tsx$/.test(id),
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
				/catalog-content\/families\/(foundation|overlay|charts)\.tsx$/.test(id),
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
				/catalog-content\/families\/(foundation|forms|charts)\.tsx$/.test(id),
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
				/catalog-content\/families\/(foundation|forms|overlay|charts)\.tsx$/.test(id),
			),
			"banner family closure contains another family",
		).toBe(false);
	});
});
