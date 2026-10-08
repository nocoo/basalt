import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

async function assertCardGeometry(card: Locator, rootFont: number) {
	const geometry = await card.evaluate((node) => {
		const box = node.getBoundingClientRect();
		const style = getComputedStyle(node);
		const childBox = (slot: string) => {
			const child = node.querySelector(`[data-slot="stat-card-${slot}"]`);
			assertElement(child);
			const rect = child.getBoundingClientRect();
			return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
		};
		function assertElement(value: Element | null): asserts value is Element {
			if (!value) throw new Error("Missing metric slot");
		}
		const heading = childBox("heading");
		const metric = childBox("metric");
		const content = childBox("content");
		return {
			heading,
			metric,
			content,
			x: box.x,
			right: box.right,
			padding: Number.parseFloat(style.paddingLeft),
			border: style.borderTopWidth,
			overflow: node.scrollWidth > node.clientWidth + 1,
			font: getComputedStyle(node.querySelector('[data-slot="stat-card-value"]') as Element)
				.fontFamily,
		};
	});
	assert.equal(geometry.padding, rootFont);
	assert.equal(geometry.border, "0px");
	assert.equal(geometry.overflow, false, JSON.stringify(geometry));
	assert.match(geometry.font, /DM Sans/);
	assert.ok(Math.abs(geometry.heading.x - geometry.x - rootFont) < 1);
	assert.ok(Math.abs(geometry.content.x - geometry.metric.x) < 1);
	assert.ok(geometry.metric.y - geometry.heading.bottom >= rootFont * 0.75 - 1);
	assert.ok(geometry.content.y - geometry.metric.bottom >= rootFont * 0.75 - 1);
	assert.ok(geometry.content.right <= geometry.right - rootFont + 1);
}

export async function assertMetricCards(page: Page, baseUrl: string) {
	const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 1000 });
		await page.goto(`${baseUrl}/ui/stat-card`);
		await page.locator('[data-status="ready"]').waitFor();
		const cards = page.locator('[data-hero-scenario] [data-slot="stat-card"]');
		assert.equal(await cards.count(), 2);
		for (const dark of [false, true]) {
			await setShowcaseTheme(page, dark);
			for (const rootFont of [16, 32]) {
				await page.evaluate((size) => {
					document.documentElement.style.fontSize = `${size}px`;
				}, rootFont);
				await page.waitForFunction(() =>
					[...document.querySelectorAll("[data-hero-scenario] .basalt-chart")].every((plot) => {
						const svg = plot.querySelector("svg.recharts-surface");
						return svg && Math.abs(svg.getBoundingClientRect().width - plot.clientWidth) <= 1;
					}),
				);
				for (const card of await cards.all()) {
					await assertCardGeometry(card, rootFont);
					const plot = await card.locator(".basalt-chart").boundingBox();
					assert.ok(plot && Math.abs(plot.height - 4 * rootFont) < 1);
				}
			}
		}
		await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
		const standalone = await page.context().newPage();
		try {
			await standalone.setViewportSize({ width, height: 1000 });
			const markup = await cards.first().evaluate((node) => node.outerHTML);
			await standalone.setContent(
				`<style>${css}</style><div data-basalt-surface-root>${markup}</div>`,
			);
			for (const rootFont of [16, 32]) {
				await standalone.evaluate((size) => {
					document.documentElement.style.fontSize = `${size}px`;
				}, rootFont);
				await assertCardGeometry(standalone.locator('[data-slot="stat-card"]'), rootFont);
			}
		} finally {
			await standalone.close();
		}
	}
	await page.setViewportSize({ width: 1280, height: 1000 });
	await page.goto(`${baseUrl}/dashboard`);
	const charts = page.locator('[data-slot="stat-card"] .basalt-chart');
	await charts.first().waitFor();
	assert.equal(await charts.count(), 3);
	for (const chart of await charts.all()) {
		const box = await chart.boundingBox();
		assert.ok(box && Math.abs(box.height - 64) < 1);
	}
	return { widths: [390, 1280], rootFonts: [16, 32], cssEntrypoints: 2, dashboardTrends: 3 };
}
