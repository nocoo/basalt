import assert from "node:assert/strict";
import type { Page } from "playwright";

/** Real installed-package behavior, independent of the catalog's mock service. */
export async function assertConsumerResources(page: Page) {
	const cases: string[] = [];
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 900 });
			await page.reload({ waitUntil: "domcontentloaded" });
			await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), dark);
			const table = page.getByRole("table", { name: "Managed devices" });
			await table.getByRole("cell", { name: "Cedar", exact: true }).waitFor();
			assert.equal(
				await table.locator("tbody tr").count(),
				2,
				"manual page two must not be sliced again",
			);
			assert.equal(
				await table.getByRole("meter", { name: "Cedar, discharging" }).getAttribute("value"),
				"0",
			);
			assert.equal(
				await table.getByRole("meter", { name: "Delta, discharging" }).getAttribute("value"),
				"14",
			);
			const name = table.getByRole("button", { name: "Name", exact: true });
			await name.focus();
			await page.keyboard.press("Enter");
			assert.equal(
				await table.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort"),
				"ascending",
			);
			await page.keyboard.press("Space");
			assert.equal(
				await table.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort"),
				"descending",
			);
			assert.equal(
				await table.locator("tbody tr").first().locator("td").nth(1).innerText(),
				"Cedar",
				"manual sorting waits for caller data",
			);
			await table.getByRole("checkbox", { name: "Select c", exact: true }).check();
			await page.getByRole("button", { name: "Next page", exact: true }).click();
			await table.getByRole("cell", { name: "Ember", exact: true }).waitFor();
			await table.getByRole("checkbox", { name: "Select e", exact: true }).check();
			assert.equal(await page.getByTestId("selected").innerText(), "Selected: c,e");
			await page.getByRole("button", { name: "Previous page", exact: true }).click();
			assert.equal(
				await table.getByRole("checkbox", { name: "Select c", exact: true }).isChecked(),
				true,
			);
			const scroll = page.getByRole("region", { name: "Managed devices scroll area" });
			if (width === 390) {
				await scroll.focus();
				await page.keyboard.press("ArrowRight");
				await page.waitForFunction(
					() =>
						(document.querySelector('[aria-label="Managed devices scroll area"]')?.scrollLeft ??
							0) > 0,
				);
			}
			await page.getByRole("button", { name: "loading", exact: true }).click();
			assert.equal(await table.getAttribute("aria-busy"), "true");
			assert.equal(
				await page.getByRole("button", { name: "Next page", exact: true }).isDisabled(),
				true,
			);
			await page.getByRole("button", { name: "error", exact: true }).click();
			await table.getByRole("alert").waitFor();
			await table.getByRole("button", { name: "Try again" }).click();
			assert.match(await page.getByTestId("requests").innerText(), /retries:1/);
			await table.getByRole("cell", { name: "Cedar", exact: true }).waitFor();
			await page.getByRole("button", { name: "empty", exact: true }).click();
			await table.getByText("No results", { exact: true }).waitFor();
			assert.equal(
				await page.getByRole("button", { name: "Next page", exact: true }).isDisabled(),
				true,
			);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth > window.innerWidth,
			);
			assert.equal(overflow, false, "table overflow must stay local");
			cases.push(`${width}/${dark ? "dark" : "light"}`);
		}
	return {
		cases,
		manualPagination: true,
		manualSort: true,
		stableSelection: true,
		keyboardScroll: true,
		retry: true,
	};
}
