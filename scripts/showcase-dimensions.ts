import assert from "node:assert/strict";
import type { Page } from "playwright";

export async function assertDimensionTokens(page: Page, baseUrl: string) {
	await page.setViewportSize({ width: 1280, height: 1000 });
	await page.goto(`${baseUrl}/ui/input`);
	await page.locator('[data-status="ready"]').waitFor();
	const sizes = page.locator('[data-scenario="input-sizes"]');
	for (const [name, expected] of [
		["Small", 28],
		["Default", 32],
		["Large", 40],
	] as const) {
		assert.equal(
			Math.round(
				(await sizes.getByRole("textbox", { name, exact: true }).boundingBox())?.height ?? 0,
			),
			expected,
		);
	}
	const input = sizes.getByRole("textbox", { name: "Default", exact: true });
	const before = await input.evaluate((node) => {
		const s = getComputedStyle(node);
		return { height: s.height, padding: s.padding };
	});
	await page.evaluate(() => document.documentElement.style.setProperty("--spacing", "9px"));
	assert.deepEqual(
		await input.evaluate((node) => {
			const s = getComputedStyle(node);
			return { height: s.height, padding: s.padding };
		}),
		before,
	);
	await page.evaluate(() => {
		document.documentElement.style.removeProperty("--spacing");
		document.documentElement.style.setProperty("--basalt-size-control", "36px");
	});
	assert.equal(Math.round((await input.boundingBox())?.height ?? 0), 36);
	await page.evaluate(() => document.documentElement.style.removeProperty("--basalt-size-control"));
	await page.goto(`${baseUrl}/ui/button`);
	await page.locator('[data-status="ready"]').waitFor();
	const buttons = page.locator("[data-hero-scenario] button");
	assert.ok((await buttons.count()) > 0);
	const heights = await buttons.evaluateAll((nodes) =>
		nodes.map((node) => node.getBoundingClientRect().height),
	);
	assert.ok(
		heights.every((height) => height === 32 || height === 28),
		JSON.stringify(heights),
	);
	return { sizes: [28, 32, 40], isolatedHostSpacing: true, semanticOverride: true };
}
