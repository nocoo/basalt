import assert from "node:assert/strict";
import type { Page } from "playwright";

/** The same interaction contract runs against A/B tarballs and a real Next server. */
export async function assertConsumerFilters(page: Page) {
	const cases: string[] = [];
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 950 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.reload({ waitUntil: "domcontentloaded" });
			await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), dark);
			const trigger = page.getByRole("button", { name: "Models", exact: true });
			await trigger.focus();
			await page.keyboard.press("ArrowDown");
			const search = page.getByRole("combobox", { name: "Models: search" });
			await search.waitFor();
			await page.waitForFunction(
				() => document.activeElement?.getAttribute("aria-label") === "Models: search",
			);
			assert.equal(await search.evaluate((node) => node === document.activeElement), true);
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
			assert.match(await page.getByTestId("filters-result").innerText(), /Selected: a,b/);
			assert.equal(await page.getByRole("option", { name: "Archive" }).isDisabled(), true);
			await search.fill("ced");
			await page.keyboard.press("Enter");
			await page.keyboard.press("Escape");
			await search.waitFor({ state: "detached" });
			await page.waitForFunction(
				() => document.activeElement?.getAttribute("aria-label") === "Models",
			);
			assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
			await page.getByRole("button", { name: "Remove filter b" }).click();
			await page.getByRole("textbox", { name: "Search resources" }).fill("report");
			await page.getByRole("button", { name: "Clear filters", exact: true }).click();
			assert.equal(await page.getByRole("textbox", { name: "Search resources" }).inputValue(), "");
			assert.equal(await page.getByRole("button", { name: "Remove filter a" }).count(), 0);
			const native = page.getByRole("button", { name: "Native folders", exact: true });
			await native.click();
			await page.getByRole("option", { name: "Cedar" }).click();
			await page.keyboard.press("Escape");
			await page.getByRole("button", { name: "Reset native selection" }).click();
			await page.getByRole("button", { name: "Read form" }).click();
			assert.equal(await page.getByTestId("native-result").innerText(), "a,c");
			await page.getByRole("button", { name: "Allow reset" }).click();
			await page.getByRole("button", { name: "Reset native selection" }).click();
			await page.getByRole("button", { name: "Read form" }).click();
			assert.equal(await page.getByTestId("native-result").innerText(), "a");
			const input = page.locator('input[type="file"]');
			await input.setInputFiles([
				{ name: "bad.exe", mimeType: "application/octet-stream", buffer: Buffer.from("bad") },
				{
					name: "large.pdf",
					mimeType: "application/pdf",
					buffer: Buffer.from("too large for this fixture"),
				},
			]);
			const alert = page.getByRole("group", { name: "Evidence", exact: true }).getByRole("alert");
			assert.match(await alert.innerText(), /File type is not accepted/);
			assert.match(await alert.innerText(), /File exceeds the size limit/);
			await input.setInputFiles({
				name: "notes.pdf",
				mimeType: "application/pdf",
				buffer: Buffer.from("pdf"),
			});
			assert.equal(
				await page.getByRole("progressbar", { name: "notes.pdf" }).getAttribute("aria-valuenow"),
				"40",
			);
			await page.getByRole("button", { name: "Cancel notes.pdf" }).click();
			await page.getByRole("button", { name: "Retry notes.pdf" }).click();
			assert.match(
				await page.getByRole("list", { name: "Evidence queue" }).innerText(),
				/Uploaded/,
			);
			await page.getByRole("button", { name: "Remove notes.pdf" }).click();
			await page.getByRole("button", { name: "Browse files: Evidence" }).evaluate((node) => {
				const transfer = new DataTransfer();
				transfer.items.add(new File(["png"], "cover.png", { type: "image/png" }));
				node.dispatchEvent(new DragEvent("drop", { bubbles: true, dataTransfer: transfer }));
			});
			await page.getByRole("progressbar", { name: "cover.png" }).waitFor();
			assert.equal(
				await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
				false,
				"filters/uploads must fit mobile width",
			);
			cases.push(`${width}/${dark ? "dark" : "light"}`);
		}
	return {
		cases,
		keyboard: true,
		controlledFilters: true,
		nativeReset: true,
		validation: true,
		drop: true,
		queueActions: true,
	};
}
