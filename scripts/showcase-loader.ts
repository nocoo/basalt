import assert from "node:assert/strict";
import type { Page } from "playwright";

export async function assertLoaderShowcase(page: Page, baseUrl: string) {
	await page.goto(`${baseUrl}/ui/loader`);
	await page.locator('[data-status="ready"]').waitFor();
	await page.emulateMedia({ reducedMotion: "no-preference" });
	const demo = page.locator("[data-hero-scenario]");
	await demo.getByRole("button", { name: "Restart", exact: true }).click();
	assert.equal(await demo.locator("[data-basalt-elapsed]").count(), 0);
	const steps = await demo
		.locator("[data-basalt-loader] > span")
		.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-step")));
	assert.deepEqual(steps, ["0", "1", "2", "7", "8", "3", "6", "5", "4"]);
	await demo.locator("[data-basalt-elapsed]").waitFor({ timeout: 6500 });
	assert.match(await demo.locator("[data-basalt-elapsed]").innerText(), /^5\./);
	await page.emulateMedia({ reducedMotion: "reduce" });
	const animations = await demo
		.locator("[data-basalt-loader] > span, .basalt-shimmer-label")
		.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).animationName));
	assert.ok(animations.every((name) => name === "none"));
	await demo.getByRole("switch", { name: "Elapsed time", exact: true }).click();
	assert.equal(await demo.locator("[data-basalt-elapsed]").count(), 0);
	return { path: steps, delay: 5000, reducedMotion: true };
}
