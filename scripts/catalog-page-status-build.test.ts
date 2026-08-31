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
	});
});
