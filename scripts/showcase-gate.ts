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
import { assertLibraryShowcases } from "./showcase-library";

/** Build and test the current source; never silently consume yesterday's dist. */
export async function runShowcaseGate() {
	await build({ ...showcaseBuildConfig(), logLevel: "warn" });
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
			const library = await assertLibraryShowcases(page, url);
			assertNoPageFaults(faults);
			return { library };
		});
		console.log(`Showcase gate passed ${JSON.stringify(evidence)}`);
	} finally {
		await stopChild(child);
		assertServerCleaned(child.pid, []);
	}
}
if (import.meta.main) await runShowcaseGate();
