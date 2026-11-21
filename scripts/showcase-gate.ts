import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, type Page } from "playwright";
import { build } from "vite";
import { showcaseBuildConfig } from "./catalog-page-status-build";
import { assertNoPageFaults, assertPinnedChromium, attachPageFaults } from "./consumer-browser";
import { allocatePort, assertServerCleaned, startHttpServer, stopChild } from "./consumer-http";
import { prerenderHtml } from "./prerender";
import { assertCodePanels } from "./showcase-code";
import { assertCommandSelection } from "./showcase-command";
import { assertDimensionTokens } from "./showcase-dimensions";
import { assertEditingShowcases } from "./showcase-editing";
import { assertExamplePages } from "./showcase-examples";
import { assertFocusBoundaries } from "./showcase-focus";
import { assertFormGroupSpacing } from "./showcase-form-groups";
import { assertHoverAndDensity } from "./showcase-hover";
import { assertLandingShowcase } from "./showcase-landing";
import { assertLibraryShowcases } from "./showcase-library";
import { assertLoaderShowcase } from "./showcase-loader";
import { assertMetricCards } from "./showcase-metrics";
import { assertOverlayMotion } from "./showcase-motion";
import { assertNavigationLists } from "./showcase-navigation";
import { assertPageLayout } from "./showcase-page-layout";
import { assertPaletteShowcases } from "./showcase-palette";
import { assertRecordGeometry } from "./showcase-records";
import { assertReusableShowcases } from "./showcase-reuse";
import { assertSelectionHierarchy } from "./showcase-selection";
import { assertTemplatesShowcase } from "./showcase-templates";

/** Build and test the current source; never silently consume yesterday's dist. */
export async function runShowcaseGate() {
	await build({ ...showcaseBuildConfig(), logLevel: "warn" });
	prerenderHtml(resolve("dist"), readFileSync(resolve("dist/index.html"), "utf8"));
	const port = await allocatePort();
	const url = `http://127.0.0.1:${port}`;
	const { child } = await startHttpServer({
		cwd: process.cwd(),
		command: "node",
		args: [
			resolve("node_modules/vite/bin/vite.js"),
			"preview",
			"--host",
			"127.0.0.1",
			"--port",
			String(port),
			"--strictPort",
		],
		url,
	});
	try {
		const executablePath = assertPinnedChromium();
		const browser = await chromium.launch({ headless: true, executablePath });
		try {
			const tasks: Array<[string, (page: Page, baseUrl: string) => Promise<unknown>]> = [
				["landing", assertLandingShowcase],
				["library", assertLibraryShowcases],
				["motion", assertOverlayMotion],
				["command", assertCommandSelection],
				["loader", assertLoaderShowcase],
				["formGroups", assertFormGroupSpacing],
				["codePanels", assertCodePanels],
				["hover", assertHoverAndDensity],
				["navigation", assertNavigationLists],
				["selection", assertSelectionHierarchy],
				["dimensions", assertDimensionTokens],
				["pageLayout", assertPageLayout],
				["focus", assertFocusBoundaries],
				["metrics", assertMetricCards],
				["records", assertRecordGeometry],
				["examples", assertExamplePages],
				["reusable", assertReusableShowcases],
				["editing", assertEditingShowcases],
				["palette", assertPaletteShowcases],
				["templates", assertTemplatesShowcase],
			];
			const results = new Map<string, unknown>();
			let cursor = 0;
			const rawWorkers = Number(process.env.BASALT_SHOWCASE_WORKERS);
			const workerCount = Math.min(
				Number.isInteger(rawWorkers) && rawWorkers > 0 ? rawWorkers : 3,
				tasks.length,
			);
			await Promise.all(
				Array.from({ length: workerCount }, async () => {
					while (cursor < tasks.length) {
						const [key, runTask] = tasks[cursor++];
						const context = await browser.newContext();
						try {
							const page = await context.newPage();
							const faults = attachPageFaults(page);
							page.setDefaultTimeout(20_000);
							await page.goto(url, { waitUntil: "domcontentloaded" });
							results.set(key, await runTask(page, url));
							assertNoPageFaults(faults);
						} finally {
							await context.close();
						}
					}
				}),
			);
			const evidence = Object.fromEntries(tasks.map(([key]) => [key, results.get(key)]));
			console.log(`Showcase gate passed ${JSON.stringify(evidence)}`);
		} finally {
			await browser.close();
		}
	} finally {
		await stopChild(child);
		assertServerCleaned(child.pid, []);
	}
}
if (import.meta.main) await runShowcaseGate();
