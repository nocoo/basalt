import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertTemplateCharts(page: Page, baseUrl: string) {
	const widths = [1440, 1024, 820, 768, 390];
	for (const width of widths) {
		await page.setViewportSize({ width, height: 1180 });
		await page.goto(`${baseUrl}/banking`);
		const card = page.locator("[data-basalt-surface]").filter({
			has: page.getByRole("heading", { name: "Bullet KPIs", exact: true }),
		});
		await card.waitFor();
		for (const dark of [false, true]) {
			await setShowcaseTheme(page, dark);
			for (const fontSize of [16, 32]) {
				await page.evaluate((size) => {
					document.documentElement.style.fontSize = `${size}px`;
				}, fontSize);
				await card.scrollIntoViewIfNeeded();
				await page.waitForFunction((height) => {
					const chart = document.querySelector('figure[aria-label="Bullet KPIs"]');
					const plot = chart?.querySelector(".basalt-chart");
					const svg = plot?.querySelector("svg.recharts-surface");
					return (
						plot &&
						svg &&
						Math.abs(svg.getBoundingClientRect().height - height) < 1 &&
						Math.abs(svg.getBoundingClientRect().width - plot.getBoundingClientRect().width) < 1
					);
				}, 14 * fontSize);
				await page
					.waitForFunction(() => {
						const chart = document.querySelector('figure[aria-label="Bullet KPIs"]');
						const bars = chart?.querySelectorAll(".recharts-bar-rectangle path");
						const labels = chart?.querySelectorAll(".recharts-yAxis-tick-labels text");
						return (
							bars?.length === 6 &&
							labels?.length === 3 &&
							[...bars].every((bar) => bar.getBoundingClientRect().width > 1)
						);
					})
					.catch(async (error: unknown) => {
						console.error({
							width,
							fontSize,
							dark,
							chart: await card.evaluate((node) => ({
								width: node.getBoundingClientRect().width,
								labels: [...node.querySelectorAll(".recharts-yAxis-tick-labels text")].map(
									(label) => ({
										text: label.textContent,
										bounds: label.getBoundingClientRect().toJSON(),
									}),
								),
								bars: [...node.querySelectorAll(".recharts-bar-rectangle path")].map((bar) =>
									bar.getBoundingClientRect().toJSON(),
								),
							})),
						});
						throw error;
					});
				const plot = await card.locator(".basalt-chart").boundingBox();
				assert.ok(plot && Math.abs(plot.height - 14 * fontSize) < 1);
				const bars = card.locator(".recharts-bar-rectangle path");
				assert.equal(await bars.count(), 6, "both series must render all three metrics");
				for (const bar of await bars.all()) {
					const bounds = await bar.boundingBox();
					assert.ok(
						bounds && bounds.width > 1 && bounds.height > 1,
						JSON.stringify({ width, fontSize, bounds }),
					);
				}
				const labels = await card.locator(".recharts-yAxis-tick-labels text").evaluateAll((nodes) =>
					nodes.map((node) => {
						const svg = node.closest("svg");
						if (!svg) throw new Error("Missing plot SVG");
						const label = node.getBoundingClientRect();
						const plot = svg.getBoundingClientRect();
						return {
							text: node.textContent,
							inside: label.left >= plot.left - 1 && label.right <= plot.right + 1,
						};
					}),
				);
				assert.equal(labels.length, 3);
				assert.ok(
					labels.every((label) => label.inside),
					JSON.stringify({ width, fontSize, labels }),
				);
			}
		}
		await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
	}
	return { widths, themes: 2, rootFonts: [16, 32], renderedBars: 6, containedLabels: 3 };
}
