import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, type Page } from "playwright";
import { build } from "vite";
import { showcaseBuildConfig } from "./catalog-page-status-build";
import { assertNoPageFaults, assertPinnedChromium, attachPageFaults } from "./consumer-browser";
import { allocatePort, assertServerCleaned, startHttpServer, stopChild } from "./consumer-http";
import { prerenderHtml } from "./prerender";
import { assertLandingShowcase } from "./showcase-landing";
import { assertLibraryShowcases } from "./showcase-library";
import { assertNavigationLists } from "./showcase-navigation";
import { assertPageLayout } from "./showcase-page-layout";
import { assertSelectionHierarchy } from "./showcase-selection";
import { assertTemplatesShowcase } from "./showcase-templates";

export async function runShowcaseSmoke() {
	if (process.env.BASALT_SKIP_SHOWCASE_BUILD === "1") {
		if (!existsSync(resolve("dist/index.html"))) {
			throw new Error("BASALT_SKIP_SHOWCASE_BUILD requires the B1 site build output");
		}
	} else {
		await build({ ...showcaseBuildConfig(), logLevel: "warn" });
		prerenderHtml(resolve("dist"), readFileSync(resolve("dist/index.html"), "utf8"));
	}
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
			const libraryCombos: Array<{ key: string; width: 390 | 1280; dark: boolean }> = [
				{ key: "library-390-light", width: 390, dark: false },
				{ key: "library-390-dark", width: 390, dark: true },
				{ key: "library-1280-light", width: 1280, dark: false },
				{ key: "library-1280-dark", width: 1280, dark: true },
			];
			const allTasks: Array<[string, (page: Page, baseUrl: string) => Promise<unknown>]> = [
				["landing", assertLandingShowcase],
				["navigation", assertNavigationLists],
				["pageLayout", assertPageLayout],
				...libraryCombos.map(
					({ key, width, dark }): [string, (page: Page, baseUrl: string) => Promise<unknown>] => [
						key,
						(page, baseUrl) => assertLibraryShowcases(page, baseUrl, [{ width, dark }]),
					],
				),
				["templates", assertTemplatesShowcase],
				["selection", assertSelectionHierarchy],
			];
			const requestedTasks = process.env.BASALT_SHOWCASE_TASKS
				? new Set(
						process.env.BASALT_SHOWCASE_TASKS.split(",")
							.map((item) => item.trim())
							.filter(Boolean),
					)
				: null;
			const tasks = requestedTasks ? allTasks.filter(([key]) => requestedTasks.has(key)) : allTasks;
			if (tasks.length === 0) {
				throw new Error(
					`BASALT_SHOWCASE_TASKS matched zero tasks: ${process.env.BASALT_SHOWCASE_TASKS}`,
				);
			}
			const results = new Map<string, unknown>();
			let cursor = 0;
			const rawWorkers = Number(process.env.BASALT_SHOWCASE_WORKERS);
			const workerCount = Math.min(
				Number.isInteger(rawWorkers) && rawWorkers > 0 ? rawWorkers : 4,
				tasks.length,
			);
			await Promise.all(
				Array.from({ length: workerCount }, async () => {
					while (cursor < tasks.length) {
						const [key, runTask] = tasks[cursor++];
						const started = Date.now();
						const context = await browser.newContext();
						try {
							const page = await context.newPage();
							const faults = attachPageFaults(page);
							page.setDefaultTimeout(12_000);
							results.set(key, await runTask(page, url));
							assertNoPageFaults(faults);
						} finally {
							await context.close();
							console.log(`Showcase smoke task ${key} finished in ${Date.now() - started}ms`);
						}
					}
				}),
			);
			const ranLibraryCombos = libraryCombos.filter(({ key }) => results.has(key));
			const library =
				ranLibraryCombos.length > 0
					? {
							...(results.get(ranLibraryCombos[0].key) as Record<string, unknown>),
							cases: ranLibraryCombos.flatMap(
								({ key }) => (results.get(key) as { cases: string[] }).cases,
							),
						}
					: undefined;
			const evidence = {
				...(results.has("landing") ? { landing: results.get("landing") } : {}),
				...(library ? { library } : {}),
				...(results.has("navigation") ? { navigation: results.get("navigation") } : {}),
				...(results.has("selection") ? { selection: results.get("selection") } : {}),
				...(results.has("pageLayout") ? { pageLayout: results.get("pageLayout") } : {}),
				...(results.has("templates") ? { templates: results.get("templates") } : {}),
			};
			console.log(`Showcase smoke passed ${JSON.stringify(evidence)}`);
		} finally {
			await browser.close();
		}
	} finally {
		await stopChild(child);
		assertServerCleaned(child.pid, []);
	}
}

if (import.meta.main) await runShowcaseSmoke();
