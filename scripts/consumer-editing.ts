import assert from "node:assert/strict";
import type { Locator, Page } from "playwright";

async function focused(locator: Locator) {
	await locator
		.page()
		.waitForFunction((node) => document.activeElement === node, await locator.elementHandle());
}

/** Opaque named tag colors must ship actual CSS and maintain 4.5:1 text contrast. */
export async function measureTagPalette(page: Page, selector = "[data-palette] [data-tag-color]") {
	const samples = await page.locator(selector).evaluateAll((nodes) => {
		const canvas = document.createElement("canvas");
		canvas.width = canvas.height = 1;
		const context = canvas.getContext("2d", { willReadFrequently: true });
		if (!context) throw new Error("No canvas context");
		function rgb(color: string) {
			if (!context) throw new Error("No canvas context");
			context.clearRect(0, 0, 1, 1);
			context.fillStyle = color;
			context.fillRect(0, 0, 1, 1);
			return [...context.getImageData(0, 0, 1, 1).data];
		}
		function luminance(color: number[]) {
			return color
				.slice(0, 3)
				.map((n) => n / 255)
				.map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4))
				.reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
		}
		return nodes.map((node) => {
			const style = getComputedStyle(node);
			const foreground = rgb(style.color),
				background = rgb(style.backgroundColor);
			const a = luminance(foreground),
				b = luminance(background);
			return {
				name: node.getAttribute("data-tag-color"),
				ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
				opaque: foreground[3] === 255 && background[3] === 255,
				background,
			};
		});
	});
	assert.equal(samples.length, 10, "Every named tag color must be rendered");
	assert.equal(new Set(samples.map((sample) => sample.name)).size, 10);
	for (const sample of samples) {
		assert.equal(sample.opaque, true, `Missing or translucent ${sample.name} palette CSS`);
		assert.ok(sample.ratio >= 4.5, `${sample.name}: text contrast ${sample.ratio}`);
	}
	return samples;
}

export async function assertConsumerEditing(page: Page) {
	const cases: string[] = [];
	const palette: Awaited<ReturnType<typeof measureTagPalette>>[] = [];
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1100 });
			await page.emulateMedia({ reducedMotion: "reduce", colorScheme: dark ? "light" : "dark" });
			await page.reload({ waitUntil: "domcontentloaded" });
			await page.getByRole("heading", { name: "Editing and navigation" }).waitFor();
			await page.locator("[data-editing-ready=true]").waitFor();
			await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), dark);
			const editor = page.getByRole("group", { name: "Collection name", exact: true });
			await editor.getByRole("button", { name: "Edit Collection name" }).click();
			const input = editor.getByRole("textbox", { name: "Collection name" });
			await focused(input);
			await input.fill("Renamed collection");
			await page.keyboard.press("Enter");
			assert.equal(await editor.getAttribute("aria-busy"), "true");
			await page.getByRole("button", { name: "Fail save", exact: true }).click();
			await editor.getByRole("alert").filter({ hasText: "Save failed. Retry." }).waitFor();
			assert.equal(await input.inputValue(), "Renamed collection");
			await input.press("Enter");
			await page.getByRole("button", { name: "Complete save", exact: true }).click();
			const trigger = editor.getByRole("button", { name: "Edit Collection name" });
			await focused(trigger);
			assert.equal(await page.getByTestId("saved-name").innerText(), "Renamed collection");
			await trigger.click();
			await input.fill("Discarded");
			await input.press("Escape");
			await focused(trigger);
			assert.equal(await page.getByTestId("saved-name").innerText(), "Renamed collection");
			await trigger.click();
			await input.fill("Saved by blur");
			await page.getByRole("button", { name: "Outside editor" }).focus();
			await page.getByRole("button", { name: "Complete save", exact: true }).click();
			await trigger.waitFor();
			await focused(page.getByRole("button", { name: "Complete save", exact: true }));
			assert.equal(await page.getByTestId("saved-name").innerText(), "Saved by blur");

			const nav = page.getByRole("navigation", { name: "Editable folders" });
			await nav.getByRole("button", { name: "Research", exact: true }).click();
			assert.equal(
				await nav
					.getByRole("button", { name: "Research", exact: true })
					.getAttribute("aria-current"),
				"page",
			);
			await nav.getByRole("button", { name: "Pin folder" }).click();
			assert.equal(await page.getByTestId("pinned").innerText(), "true");
			await nav.getByRole("button", { name: "Rename Research" }).click();
			await nav.getByRole("textbox", { name: "Rename Research" }).fill("Reading");
			await page.keyboard.press("Enter");
			await focused(nav.getByRole("button", { name: "Rename Reading" }));
			assert.equal(await nav.locator("button button, a button, button a").count(), 0);
			const locked = nav.getByRole("link", { name: "Locked folder" });
			assert.equal(await locked.getAttribute("aria-disabled"), "true");

			const picker = page.getByRole("button", { name: "Folder icon", exact: true });
			await picker.focus();
			await page.keyboard.press("Enter");
			const search = page.getByRole("textbox", { name: "Folder icon: search" });
			await focused(search);
			await search.fill("nothing");
			await page.getByRole("status").filter({ hasText: "No icons found." }).waitFor();
			await search.fill("");
			await page.keyboard.press("Tab");
			await focused(page.getByRole("radio", { name: "Folder", exact: true }));
			await page.keyboard.press("ArrowRight");
			await focused(page.getByRole("radio", { name: "Book", exact: true }));
			await page.keyboard.press("Space");
			await focused(picker);
			assert.match(await picker.innerText(), /Book/);
			const colors = page.getByRole("radiogroup", { name: "Tag color", exact: true });
			await colors.getByRole("radio", { name: "Blue", exact: true }).focus();
			await page.keyboard.press("ArrowRight");
			await focused(colors.getByRole("radio", { name: "Violet", exact: true }));
			await page.keyboard.press("Space");
			assert.equal(await page.getByTestId("chosen-tag").getAttribute("data-tag-color"), "violet");
			const samples = await measureTagPalette(page);
			for (const sample of samples) {
				const brightness = sample.background.slice(0, 3).reduce((sum, value) => sum + value, 0);
				assert.ok(
					dark ? brightness < 250 : brightness > 600,
					`Tag ${sample.name} must follow the selected theme, even when the OS is opposite`,
				);
			}
			palette.push(samples);

			const composition = page.getByRole("group", { name: "Resource browser", exact: true });
			const list = composition.locator('section[aria-label="Resources"]');
			const detail = composition.locator('section[aria-label="Resource details"]');
			const alpha = composition.getByRole("button", { name: "Open Alpha", exact: true });
			await alpha.click();
			await detail.getByRole("textbox", { name: "Draft note" }).fill("Retained draft");
			if (width < 768) {
				assert.equal(await list.isVisible(), false);
				assert.equal(await list.evaluate((node) => node.inert && node.hidden), true);
				await detail.focus();
				await page.keyboard.press("Tab");
				await focused(composition.getByRole("button", { name: "Back to items" }));
				await page.keyboard.press("Enter");
				await focused(alpha);
				assert.equal(await detail.isVisible(), false);
				assert.equal(await detail.evaluate((node) => node.inert && node.hidden), true);
				await alpha.click();
				await focused(detail);
				assert.equal(
					await detail.getByRole("textbox", { name: "Draft note" }).inputValue(),
					"Retained draft",
				);
				await page.setViewportSize({ width: 1280, height: 1100 });
				await list.waitFor({ state: "visible" });
				await page.waitForFunction(
					(node) => node instanceof HTMLElement && !node.inert && !node.hidden,
					await list.elementHandle(),
				);
				assert.equal(await list.evaluate((node) => node.inert || node.hidden), false);
				await page.setViewportSize({ width, height: 1100 });
				await focused(detail);
				await detail.getByRole("button", { name: "Remove opened item" }).click();
				await composition.getByRole("button", { name: "Back to items" }).click();
				await focused(list);
			} else {
				assert.equal(await list.isVisible(), true);
				assert.equal(await detail.isVisible(), true);
				const [a, b] = await Promise.all([list.boundingBox(), detail.boundingBox()]);
				assert.ok(
					a && b && Math.abs(a.y - b.y) < 1 && a.x + a.width <= b.x + 1,
					"Desktop master/detail must be adjacent columns",
				);
				await detail.getByRole("button", { name: "Close details" }).click();
				await composition.getByText("Choose a resource.").waitFor();
			}
			assert.equal(
				await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
				false,
			);
			cases.push(`${width}/${dark ? "dark" : "light"}`);
		}
	return {
		cases,
		palette,
		editing: true,
		navActions: true,
		keyboard: true,
		draftRetention: true,
		focusRestoration: true,
		resize: true,
	};
}
