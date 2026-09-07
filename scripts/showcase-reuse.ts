import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

/** Reusable workflows must be visible, interactive and safe to unmount in the catalog. */
export async function assertReusableShowcases(page: Page, baseUrl: string) {
	const cases: string[] = [];
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.emulateMedia({ reducedMotion: "reduce", colorScheme: dark ? "dark" : "light" });
			async function visit(slug: string) {
				await page.goto(`${baseUrl}/ui/${slug}`);
				await page.locator('[data-status="ready"]').waitFor();
				await setShowcaseTheme(page, dark);
				assert.equal(
					await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
					false,
					`${slug} must reflow at ${width}`,
				);
			}
			await visit("multi-select");
			const folders = page.locator('[data-scenario="multi-select-folders"]');
			assert.equal(
				await folders.getByRole("button", { name: "Remove Team archive" }).isDisabled(),
				true,
			);
			await folders.getByRole("button", { name: "Folders", exact: true }).click();
			await page.getByRole("combobox", { name: "Folders: search" }).fill("design");
			await page.keyboard.press("Enter");
			await page.keyboard.press("Escape");
			assert.match(await folders.getByRole("status").innerText(), /3 folders/);
			await folders.getByRole("button", { name: "Remove Design" }).click();
			const remote = page.locator('[data-scenario="multi-select-remote-search"]');
			await remote.getByRole("button", { name: "Models", exact: true }).click();
			await page.getByRole("combobox", { name: "Models: search" }).fill("ember");
			await page.waitForFunction(() => {
				const list = document.querySelector('[role="listbox"][aria-label="Models"]');
				return (
					list?.getAttribute("aria-busy") === "false" &&
					list.querySelectorAll('[role="option"]').length === 1
				);
			});
			await page.getByRole("option", { name: /Ember/ }).waitFor();
			await page.keyboard.press("Enter");
			await page.keyboard.press("Escape");
			assert.match(await remote.getByRole("status").innerText(), /Comparing ember/);
			await visit("filter-bar");
			const resources = page.locator('[data-scenario="filter-bar-resources"]');
			assert.equal(await resources.getByRole("status").innerText(), "2 resources");
			await resources.getByRole("textbox", { name: "Search resources" }).fill("no match");
			assert.equal(await resources.getByRole("status").innerText(), "0 resources");
			await resources.getByRole("button", { name: "Clear filters" }).click();
			assert.equal(await resources.getByRole("status").innerText(), "4 resources");
			const analytics = page.locator('[data-scenario="filter-bar-analytics"]');
			await analytics.getByRole("button", { name: "Last 3 days" }).click();
			assert.equal(await analytics.getByRole("status").innerText(), "6,100");
			await analytics.getByRole("button", { name: "This week" }).click();
			assert.equal(await analytics.getByRole("status").innerText(), "10,300");
			await visit("file-dropzone");
			const docs = page.locator('[data-scenario="file-dropzone-documents"]');
			await docs
				.locator('input[type="file"]')
				.setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("notes") });
			await docs.getByRole("button", { name: "Remove notes.txt" }).click();
			const media = page.locator('[data-scenario="file-dropzone-media"]');
			await page.evaluate(() => {
				const create = URL.createObjectURL.bind(URL),
					revoke = URL.revokeObjectURL.bind(URL);
				const state = { created: [] as string[], revoked: [] as string[] };
				Object.assign(window, { previewAudit: state });
				URL.createObjectURL = (blob) => {
					const url = create(blob);
					state.created.push(url);
					return url;
				};
				URL.revokeObjectURL = (url) => {
					state.revoked.push(url);
					revoke(url);
				};
			});
			const png = {
				name: "cover.png",
				mimeType: "image/png",
				buffer: Buffer.from(
					"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jQyoAAAAASUVORK5CYII=",
					"base64",
				),
			};
			await media.locator('input[type="file"]').setInputFiles(png);
			await media.getByRole("img", { name: "Preview of cover.png" }).waitFor();
			await media.getByRole("button", { name: "Remove cover" }).click();
			const preview = await page.evaluate(
				() =>
					(window as unknown as { previewAudit: { created: string[]; revoked: string[] } })
						.previewAudit,
			);
			assert.equal(preview.created.length, 1);
			assert.deepEqual(preview.revoked, preview.created);
			await visit("upload-queue");
			const queue = page.locator('[data-scenario="upload-queue-local-transport"]');
			await queue.getByRole("button", { name: "Add sample file" }).click();
			await queue.getByRole("checkbox", { name: "Simulate failure" }).check();
			await queue.getByRole("button", { name: "Start uploads" }).click();
			await queue.getByRole("alert").waitFor();
			await queue.getByRole("checkbox", { name: "Simulate failure" }).uncheck();
			await queue.getByRole("button", { name: "Retry Project-notes-1.pdf" }).click();
			await queue.getByRole("button", { name: "Cancel Project-notes-1.pdf" }).click();
			await queue.getByRole("button", { name: "Retry Project-notes-1.pdf" }).click();
			await queue.getByRole("status").filter({ hasText: "1 completed · 1 total" }).waitFor();
			assert.equal(await queue.getByRole("status").innerText(), "1 completed · 1 total");
			await queue.getByRole("button", { name: "Remove Project-notes-1.pdf" }).click();
			await queue.getByRole("button", { name: "Add sample file" }).click();
			await queue.getByRole("button", { name: "Start uploads" }).click();
			// Unmount while a transport timer is pending; fault collection stays attached.
			await page.goto(`${baseUrl}/ui/button`);
			cases.push(`${width}/${dark ? "dark" : "light"}`);
		}
	return { cases, selection: true, filtering: true, previewsReleased: true, queueRetry: true };
}
