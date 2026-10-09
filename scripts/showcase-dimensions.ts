import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Page } from "playwright";

export async function assertDimensionTokens(page: Page, baseUrl: string) {
	await page.setViewportSize({ width: 1280, height: 1000 });
	await page.goto(`${baseUrl}/ui/input`);
	await page.locator('[data-status="ready"]').waitFor();
	const sizes = page.locator('[data-scenario="input-sizes"]');
	for (const [name, expected] of [
		["Small", 28],
		["Default", 34],
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
		document.documentElement.style.setProperty("--basalt-leading-action", "2");
	});
	assert.equal(Math.round((await input.boundingBox())?.height ?? 0), 38);
	await page.evaluate(() =>
		document.documentElement.style.removeProperty("--basalt-leading-action"),
	);
	await page.evaluate(() => {
		document.documentElement.style.fontSize = "32px";
	});
	assert.ok(((await input.boundingBox())?.height ?? 0) >= 66, "Input must grow with the root font");
	await page.evaluate(() => {
		document.documentElement.style.removeProperty("font-size");
	});
	await page.goto(`${baseUrl}/ui/button`);
	await page.locator('[data-status="ready"]').waitFor();
	const buttons = page.locator("[data-hero-scenario] button");
	assert.ok((await buttons.count()) > 0);
	const heights = await buttons.evaluateAll((nodes) =>
		nodes
			.filter((node) => !node.closest('[data-slot="code-header"]'))
			.map((node) => node.getBoundingClientRect().height),
	);
	assert.ok(
		heights.every((height) => height === 34 || height === 28),
		JSON.stringify(heights),
	);
	const first = buttons.first();
	await first.evaluate((node) => {
		node.textContent = "A deliberately long label that wraps without clipping";
		(node as HTMLElement).style.width = "6rem";
	});
	assert.ok(((await first.boundingBox())?.height ?? 0) > 34, "Wrapped labels grow naturally");
	const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	for (const [slug, selector] of [
		["input-group", '[data-scenario="input-group-button"] [data-slot="input-group"]'],
		["sensitive-input", "[data-hero-scenario] .basalt-ui:has(> input)"],
		["clipboard-text", '[data-hero-scenario] [data-slot="clipboard-text"]'],
		["toggle-group", '[data-hero-scenario] [role="radiogroup"]'],
	] as const) {
		await page.goto(`${baseUrl}/ui/${slug}`);
		await page.locator('[data-status="ready"]').waitFor();
		const control = page.locator(selector).first();
		const markup = await control.evaluate((node) => node.outerHTML);
		const standalone = await page.context().newPage();
		try {
			await standalone.setContent(`<style>${css}</style>${markup}`);
			for (const rootFont of [16, 20]) {
				for (const target of [page, standalone]) {
					await target.evaluate((size) => {
						document.documentElement.style.fontSize = `${size}px`;
					}, rootFont);
					const node = target === page ? control : standalone.locator("body > :not(style)").first();
					assert.ok(
						Math.abs(((await node.boundingBox())?.height ?? 0) - (34 * rootFont) / 16) <= 1,
						`${slug} at root ${rootFont}`,
					);
				}
			}
		} finally {
			await standalone.close();
			await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
		}
	}
	await page.goto(`${baseUrl}/ui/badge`);
	await page.locator('[data-status="ready"]').waitFor();
	assert.equal(
		Math.round((await page.locator(".basalt-inline").first().boundingBox())?.height ?? 0),
		22,
	);
	await page.goto(`${baseUrl}/ui/banner`);
	await page.locator('[data-status="ready"]').waitFor();
	const banner = page.locator(".basalt-banner").first();
	await banner.evaluate((node) => {
		node.textContent = "Single-line notification";
	});
	assert.deepEqual(
		await banner.evaluate((node) => {
			const style = getComputedStyle(node);
			return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
		}),
		["12px", "16px", "12px", "16px"],
	);
	assert.equal(Math.round((await banner.boundingBox())?.height ?? 0), 46);
	return {
		sizes: [22, 28, 34, 38, 40, 46],
		compoundControls: 4,
		cssEntrypoints: 2,
		isolatedHostSpacing: true,
		semanticOverride: true,
		textZoom: true,
		wrapping: true,
	};
}
