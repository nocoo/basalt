import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "vite";
import { showcaseBuildConfig } from "./catalog-page-status-build";
import {
	assertNoPageFaults,
	attachPageFaults,
	createBrowserProfileDir,
	withChromiumPage,
} from "./consumer-browser";
import { allocatePort, assertServerCleaned, startHttpServer, stopChild } from "./consumer-http";
import { prerenderHtml } from "./prerender";
import { assertLandingShowcase } from "./showcase-landing";
import { assertLibraryShowcases } from "./showcase-library";
import { assertNavigationLists } from "./showcase-navigation";
import { assertPageLayout } from "./showcase-page-layout";
import { assertSelectionHierarchy } from "./showcase-selection";

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
		const evidence = await withChromiumPage(createBrowserProfileDir(), async (page) => {
			const faults = attachPageFaults(page);
			page.setDefaultTimeout(12_000);
			const landing = await assertLandingShowcase(page, url);
			const library = await assertLibraryShowcases(page, url);
			const navigation = await assertNavigationLists(page, url);
			const selection = await assertSelectionHierarchy(page, url);
			const pageLayout = await assertPageLayout(page, url);
			assertNoPageFaults(faults);
			return { landing, library, navigation, selection, pageLayout };
		});
		console.log(`Showcase smoke passed ${JSON.stringify(evidence)}`);
	} finally {
		await stopChild(child);
		assertServerCleaned(child.pid, []);
	}
}

if (import.meta.main) await runShowcaseSmoke();
