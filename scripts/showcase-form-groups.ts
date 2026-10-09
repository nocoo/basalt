import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";

async function assertGroupSpacing(group: Locator, rowGap: number) {
	const geometry = await group.evaluate((node) => {
		const legend = node.querySelector("legend") as HTMLElement;
		const rows = Array.from(node.querySelectorAll("label"), (row) => row.getBoundingClientRect());
		return {
			titleGap: rows[0].top - legend.getBoundingClientRect().bottom,
			rowGaps: rows.slice(1).map((row, index) => row.top - rows[index].bottom),
			insets: [
				getComputedStyle(node).marginLeft,
				getComputedStyle(node).marginRight,
				getComputedStyle(node).padding,
			],
		};
	});
	assert.equal(geometry.titleGap, 8);
	assert.ok(
		geometry.rowGaps.every((gap) => gap === rowGap),
		JSON.stringify(geometry),
	);
	assert.deepEqual(geometry.insets, ["0px", "0px", "0px"]);
}

export async function assertFormGroupSpacing(page: Page, baseUrl: string) {
	const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 1000 });
		for (const [route, scenario, title] of [
			["loader", "[data-hero-scenario]", "Display options"],
			["switch", '[data-scenario="switch-group-and-legend"]', "Alerts"],
			["checkbox", '[data-scenario="checkbox-group-and-legend"]', "Topics"],
			["radio", '[data-scenario="radio-group-and-legend"]', "Plan"],
		] as const) {
			await page.goto(`${baseUrl}/ui/${route}`);
			const group = page.locator(scenario).getByRole("group", { name: title, exact: true });
			await group.waitFor();
			await assertGroupSpacing(group, 8);
			const markup = await group.evaluate((node) => node.outerHTML);
			await group.evaluate((node) => (node as HTMLElement).style.setProperty("--spacing", "9px"));
			await assertGroupSpacing(group, 8);
			await page.setContent(`<style>${css}</style>${markup}`);
			const standalone = page.getByRole("group", { name: title, exact: true });
			await assertGroupSpacing(standalone, 8);
			await standalone.evaluate((node) =>
				(node as HTMLElement).style.setProperty("--basalt-space-field-gap", "4px"),
			);
			assert.equal(
				await standalone.locator("legend").evaluate((node) => getComputedStyle(node).marginBottom),
				"4px",
			);
		}
	}
	return { viewports: 2, cssEntrypoints: 2, groups: 4, legendGap: 8, hostIsolation: true };
}
