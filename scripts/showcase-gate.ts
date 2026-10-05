import { readFileSync } from "node:fs";
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
import { assertAgentFeedback } from "./showcase-agent";
import { assertCompositeAlignment } from "./showcase-alignment";
import { assertChatComposerSizing } from "./showcase-chat-composer";
import { assertCodePanels } from "./showcase-code";
import { assertCommandSelection } from "./showcase-command";
import { assertContextCards } from "./showcase-context";
import { assertDiffReview } from "./showcase-diff";
import { assertDimensionTokens } from "./showcase-dimensions";
import { assertEditingShowcases } from "./showcase-editing";
import { assertExamplePages } from "./showcase-examples";
import { assertFormGroupSpacing } from "./showcase-form-groups";
import { assertHoverAndDensity } from "./showcase-hover";
import { assertLandingShowcase } from "./showcase-landing";
import { assertLibraryShowcases } from "./showcase-library";
import { assertLoaderShowcase } from "./showcase-loader";
import { assertOverlayMotion } from "./showcase-motion";
import { assertPaletteShowcases } from "./showcase-palette";
import { assertRecommendation } from "./showcase-recommendation";
import { assertRecordGeometry } from "./showcase-records";
import { assertReusableShowcases } from "./showcase-reuse";

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
		const evidence = await withChromiumPage(createBrowserProfileDir(), async (page) => {
			const faults = attachPageFaults(page);
			page.setDefaultTimeout(12_000);
			const landing = await assertLandingShowcase(page, url);
			const library = await assertLibraryShowcases(page, url);
			const motion = await assertOverlayMotion(page, url);
			const command = await assertCommandSelection(page, url);
			const loader = await assertLoaderShowcase(page, url);
			const agent = await assertAgentFeedback(page, url);
			const alignment = await assertCompositeAlignment(page, url);
			const formGroups = await assertFormGroupSpacing(page, url);
			const codePanels = await assertCodePanels(page, url);
			const hover = await assertHoverAndDensity(page, url);
			const dimensions = await assertDimensionTokens(page, url);
			const records = await assertRecordGeometry(page, url);
			const recommendation = await assertRecommendation(page, url);
			const context = await assertContextCards(page, url);
			const diffReview = await assertDiffReview(page, url);
			const chatComposer = await assertChatComposerSizing(page, url);
			const examples = await assertExamplePages(page, url);
			const reusable = await assertReusableShowcases(page, url);
			const editing = await assertEditingShowcases(page, url);
			const palette = await assertPaletteShowcases(page, url);
			assertNoPageFaults(faults);
			return {
				landing,
				library,
				motion,
				command,
				loader,
				agent,
				alignment,
				formGroups,
				codePanels,
				hover,
				dimensions,
				records,
				recommendation,
				context,
				diffReview,
				chatComposer,
				examples,
				reusable,
				editing,
				palette,
			};
		});
		console.log(`Showcase gate passed ${JSON.stringify(evidence)}`);
	} finally {
		await stopChild(child);
		assertServerCleaned(child.pid, []);
	}
}
if (import.meta.main) await runShowcaseGate();
