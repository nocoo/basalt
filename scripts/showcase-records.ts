import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertRecordGeometry(page: Page, baseUrl: string) {
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.goto(`${baseUrl}/ui/data-table`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, dark);
			const demo = page.locator('[data-scenario="data-table-records"]');
			await demo.scrollIntoViewIfNeeded();
			const table = demo.getByRole("table");
			const region = demo.getByRole("region", { name: "Supplier records scroll area" });
			const geometry = await table.evaluate((node) => ({
				rows: Array.from(node.querySelectorAll("tbody tr")).map(
					(row) => row.getBoundingClientRect().height,
				),
				heads: Array.from(node.querySelectorAll("th")).map((head) => ({
					width: head.getBoundingClientRect().width,
					whiteSpace: getComputedStyle(head).whiteSpace,
				})),
				scroll: node.parentElement?.scrollWidth ?? 0,
				client: node.parentElement?.clientWidth ?? 0,
			}));
			await page.evaluate(() => document.documentElement.style.setProperty("--spacing", "9px"));
			const foreignRows = await table
				.locator("tbody tr")
				.evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height));
			assert.ok(
				foreignRows.every((height) => height === 36),
				JSON.stringify(foreignRows),
			);
			await page.evaluate(() => document.documentElement.style.removeProperty("--spacing"));
			assert.ok(
				geometry.rows.every((height) => height === 36),
				JSON.stringify(geometry),
			);
			assert.ok(geometry.heads.every((head) => head.whiteSpace === "nowrap"));
			assert.ok(geometry.heads[1].width >= 240 && geometry.heads[2].width >= 240);
			assert.ok(geometry.scroll > geometry.client);
			await region.evaluate((node) => {
				node.style.maxHeight = "140px";
				node.scrollTop = node.scrollHeight;
			});
			const sticky = await region.evaluate((node) => ({
				top: node.getBoundingClientRect().top,
				head: node.querySelector("th")?.getBoundingClientRect().top,
				last: node.querySelector("tbody tr:last-child")?.getBoundingClientRect().bottom,
				bottom: node.getBoundingClientRect().bottom,
			}));
			assert.ok(Math.abs((sticky.head ?? 0) - sticky.top) < 1, JSON.stringify(sticky));
			assert.ok((sticky.last ?? Infinity) <= sticky.bottom + 1);
			await region.evaluate((node) => {
				node.scrollTop = 0;
			});
			await table.getByRole("checkbox").first().check();
			assert.equal(await table.locator('tbody tr[aria-selected="true"]').count(), 1);
			const heading = table.getByRole("button", { name: "Company", exact: true });
			await heading.click();
			assert.equal(
				await heading.locator("xpath=ancestor::th").getAttribute("aria-sort"),
				"descending",
			);
			assert.equal(await heading.locator("svg").count(), 1);
			assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
		}
	return { rowHeight: 36, headerIcons: 12, widthsPreserved: true, scroll: true, selection: true };
}
