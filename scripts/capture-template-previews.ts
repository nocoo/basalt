import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { LANDING_TEMPLATES } from "../src/lib/landing";
import { APP_VERSION } from "../src/lib/version";
import { createBrowserProfileDir, withChromiumPage } from "./consumer-browser";
import { setShowcaseTheme } from "./showcase-theme";

export function verifyCaptureVersion(renderedVersion: string, expectedVersion: string) {
	const version = renderedVersion.trim().replace(/^v/, "");
	assert.equal(version, expectedVersion, "The served catalog must match the checkout version");
	return version;
}

export async function captureTemplatePreviews(baseUrl: URL, output: string) {
	assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(baseUrl.hostname));
	assert.equal(baseUrl.protocol, "http:");
	assert.ok(output, "Pass a local base URL and an output directory");
	const directory = resolve(output);
	mkdirSync(directory, { recursive: true });
	let observedVersion = "";

	await withChromiumPage(createBrowserProfileDir(), async (parent) => {
		const browser = parent.context().browser();
		assert.ok(browser);
		const context = await browser.newContext({
			viewport: { width: 1600, height: 1000 },
			deviceScaleFactor: 2,
			locale: "en-US",
			reducedMotion: "reduce",
		});
		try {
			const page = await context.newPage();
			await page.goto(baseUrl.href);
			await page.locator(".landing-header-actions button").waitFor();
			for (const template of LANDING_TEMPLATES) {
				for (const mode of ["light", "dark"] as const) {
					await setShowcaseTheme(page, mode === "dark");
					await page.goto(new URL(template.href, baseUrl).href);
					await page.locator("[data-doc-scroll] h1").waitFor();
					const version = await page
						.locator("[data-dashboard-shell] > aside")
						.getByText(/^v\d+\.\d+\.\d+$/)
						.textContent();
					observedVersion = verifyCaptureVersion(version, APP_VERSION);
					await page.evaluate(() => document.fonts.ready);
					await page.waitForFunction(() =>
						[...document.querySelectorAll(".basalt-chart")].every((chart) => {
							const box = chart.getBoundingClientRect();
							if (box.top >= innerHeight || box.bottom <= 0) return true;
							const svg = chart.querySelector("svg.recharts-surface");
							return svg && Math.abs(svg.getBoundingClientRect().width - box.width) < 1;
						}),
					);
					await page.screenshot({ path: resolve(directory, `${template.image}-${mode}.png`) });
				}
			}
		} finally {
			await context.close();
		}
	});
	writeFileSync(
		resolve(directory, "capture.json"),
		`${JSON.stringify({ version: observedVersion, viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2, routes: LANDING_TEMPLATES.map(({ href }) => href) }, null, 2)}\n`,
	);
	console.log(`Captured template previews in ${directory}`);
}

if (import.meta.main) {
	assert.ok(process.argv[2] && process.argv[3], "Pass a local base URL and an output directory");
	await captureTemplatePreviews(new URL(process.argv[2]), process.argv[3]);
}
