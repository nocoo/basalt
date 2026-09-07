import assert from "node:assert/strict";
import type { Page } from "playwright";
import { measureTagPalette } from "./consumer-editing";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertEditingShowcases(page: Page, baseUrl: string) {
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
					`${slug} at ${width}`,
				);
				assert.equal(
					await page.locator("[data-scenario]").count(),
					2,
					`${slug} must show both source-backed scenarios`,
				);
			}
			await visit("inline-editable");
			const name = page.locator('[data-scenario="inline-editable-resource-name"]');
			await name.getByRole("checkbox", { name: "Fail save request" }).check();
			await name.getByRole("button", { name: "Edit Resource name" }).click();
			await name.getByRole("textbox", { name: "Resource name" }).fill("Shared resources");
			await page.keyboard.press("Enter");
			await name.getByRole("alert").waitFor();
			assert.equal(await name.getByRole("textbox").inputValue(), "Shared resources");
			await name.getByRole("checkbox", { name: "Fail save request" }).uncheck();
			await name.getByRole("status").filter({ hasText: "Saving…" }).waitFor({ state: "hidden" });
			await name.getByRole("textbox").press("Enter");
			await name.getByRole("status").filter({ hasText: "Saved name: Shared resources" }).waitFor();
			const caption = page.locator('[data-scenario="inline-editable-caption"]');
			await caption.getByRole("button", { name: "Edit Recording caption" }).click();
			await caption.getByRole("textbox").fill("A retained caption");
			await caption.getByRole("button", { name: "Save", exact: true }).click();
			assert.match(
				await caption.getByRole("status").innerText(),
				/Published caption: A retained caption/,
			);

			await visit("editable-nav-item");
			const folders = page.locator('[data-scenario="editable-nav-item-folders"]');
			await folders.getByRole("button", { name: "Reading list", exact: true }).click();
			await folders.getByRole("button", { name: "Pin Reading list" }).click();
			await folders.getByRole("button", { name: "Rename Reading list" }).click();
			await folders.getByRole("textbox").fill("Reading room");
			await page.keyboard.press("Enter");
			await folders
				.getByRole("status")
				.filter({ hasText: "Opened Reading room · 1 pinned" })
				.waitFor();
			const views = page.locator('[data-scenario="editable-nav-item-saved-views"]');
			assert.equal(
				await views.getByRole("button", { name: "Restricted workspace" }).isDisabled(),
				true,
			);
			await views.getByRole("button", { name: "Rename High usage devices" }).click();
			await views.getByRole("textbox").fill("a");
			await page.keyboard.press("Enter");
			await views.getByRole("alert").filter({ hasText: "Use at least four characters." }).waitFor();
			await views.getByRole("textbox").press("Escape");

			await visit("icon-picker");
			await page
				.locator('[data-scenario="icon-picker-folder-icon"]')
				.getByRole("button", { name: "Folder icon", exact: true })
				.click();
			await page.getByRole("textbox", { name: "Folder icon: search" }).fill("code");
			await page.getByRole("radio", { name: "Code", exact: true }).click();
			await page.getByRole("status").filter({ hasText: "Selected icon: code" }).waitFor();
			await page
				.locator('[data-scenario="icon-picker-resource-icon"]')
				.getByRole("button", { name: "Resource icon", exact: true })
				.click();
			assert.equal(await page.getByRole("radio", { name: "Private vault" }).isDisabled(), true);
			await page.getByRole("radio", { name: "Audio", exact: true }).click();
			await page.getByRole("status").filter({ hasText: "Using the audio icon." }).waitFor();

			await visit("tag-badge");
			const deterministic = page.locator('[data-scenario="tag-badge-deterministic"]');
			assert.equal(
				await deterministic
					.getByText("Research", { exact: true })
					.first()
					.getAttribute("data-tag-color"),
				await deterministic
					.getByText("Research & reading", { exact: true })
					.getAttribute("data-tag-color"),
			);
			await measureTagPalette(
				page,
				'[data-scenario="tag-badge-semantic"] [data-palette] [data-tag-color]',
			);

			await visit("tag-color-picker");
			const tag = page.locator('[data-scenario="tag-color-picker-tag-editor"]');
			await tag.getByRole("textbox", { name: "Tag name" }).fill("Methods");
			await tag.getByRole("radio", { name: "Teal", exact: true }).click();
			assert.equal(
				await tag.getByText("Methods", { exact: true }).getAttribute("data-tag-color"),
				"teal",
			);
			const status = page.locator('[data-scenario="tag-color-picker-status-colors"]');
			await status.getByRole("radio", { name: "Incident", exact: true }).click();
			assert.equal(await status.locator('[data-tag-color="danger"]').innerText(), "Incident");

			await visit("responsive-master-detail");
			const resources = page.locator('[data-scenario="responsive-master-detail-resources"]');
			await resources.getByRole("button", { name: "Research collection", exact: true }).click();
			await resources.getByRole("button", { name: "Edit Collection title" }).click();
			await resources
				.getByRole("textbox", { name: "Collection title" })
				.fill("Interview collection");
			await page.keyboard.press("Enter");
			await resources.getByRole("button", { name: "Edit Collection title" }).waitFor();
			if (width < 768) {
				await resources.getByRole("button", { name: "Back to items" }).click();
				await page.waitForFunction(
					() => document.activeElement?.textContent === "Interview collection",
				);
			}
			await resources.getByRole("button", { name: "Interview collection", exact: true }).waitFor();
			const drafts = page.locator('[data-scenario="responsive-master-detail-drafts"]');
			await drafts.getByRole("button", { name: "Introduction", exact: true }).click();
			await drafts.getByRole("textbox", { name: "Draft text" }).fill("Keep this draft");
			if (width < 768) await drafts.getByRole("button", { name: "Back to drafts" }).click();
			await drafts.getByRole("button", { name: "Checklist", exact: true }).click();
			if (width < 768) await drafts.getByRole("button", { name: "Back to drafts" }).click();
			await drafts.getByRole("button", { name: "Introduction", exact: true }).click();
			assert.equal(
				await drafts.getByRole("textbox", { name: "Draft text" }).inputValue(),
				"Keep this draft",
			);
			assert.equal(
				await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
				false,
			);
			cases.push(`${width}/${dark ? "dark" : "light"}`);
		}
	return {
		cases,
		pages: 6,
		scenarios: 12,
		saves: true,
		tags: true,
		navigation: true,
		mobileDrafts: true,
	};
}
