import assert from "node:assert/strict";
import type { Page } from "playwright";

export async function assertMobileLayouts(page: Page, url: string) {
	page.setDefaultTimeout(12_000);
	await page.emulateMedia({ reducedMotion: "reduce" });
	const evidence: string[] = [];
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 780 });
		await page.goto(`${url}/examples/reader`);
		await page.getByRole("article", { name: "A slower way to see" }).waitFor();
		const geometry = await page.evaluate(() => {
			const shell = document.querySelector<HTMLElement>("[data-basalt-shell]");
			const main = document.querySelector<HTMLElement>("[data-basalt-main]");
			const island = document.querySelector<HTMLElement>("[data-basalt-island]");
			if (!shell || !main || !island) throw new Error("Missing shell regions");
			return {
				rootScrolls: document.documentElement.scrollHeight > innerHeight + 1,
				mainOverflow: getComputedStyle(main).overflowY,
				islandOverflow: getComputedStyle(island).overflowY,
				islandPadding: getComputedStyle(island).paddingLeft,
				shellHeight: shell.getBoundingClientRect().height,
				bodyWidth: document.documentElement.scrollWidth,
			};
		});
		assert.equal(geometry.rootScrolls, width < 768);
		assert.equal(geometry.mainOverflow, width < 768 ? "visible" : "hidden");
		assert.equal(geometry.islandOverflow, width < 768 ? "visible" : "auto");
		assert.equal(geometry.bodyWidth, width);
		if (width < 768) assert.equal(geometry.islandPadding, "0px");
		else assert.equal(geometry.shellHeight, 780);
		await page.evaluate(() => {
			if (innerWidth < 768) window.scrollTo(0, 900);
			else {
				const island = document.querySelector("[data-basalt-island]");
				if (!island) throw new Error("Missing island");
				island.scrollTop = 900;
			}
		});
		const header = page.locator("[data-basalt-header]");
		await page.waitForFunction(
			() =>
				(document.querySelector("[data-basalt-header]")?.getBoundingClientRect().top ?? -999) < 40,
		);
		const bounds = await header.boundingBox();
		assert.ok(bounds && bounds.y >= 0 && bounds.height === 52);
		for (const name of ["Back to layouts", "Reading preferences", "Reading actions"]) {
			const box = await page
				.getByRole(name === "Back to layouts" ? "link" : "button", { name })
				.boundingBox();
			assert.ok(box && box.width >= 44 && box.height >= 44, name);
		}
		await page.getByRole("button", { name: "Reading preferences" }).click();
		await page.getByRole("button", { name: "Larger text" }).click();
		await page.keyboard.press("Escape");
		await page.waitForFunction(
			() => document.activeElement?.getAttribute("aria-label") === "Reading preferences",
		);
		await page.getByRole("button", { name: "Reading actions" }).click();
		await page.getByRole("menuitem", { name: "Bookmark", exact: true }).click();
		await page.getByRole("status").filter({ hasText: "Bookmarked locally" }).waitFor();
		await page.locator("[data-reader-end]").scrollIntoViewIfNeeded();
		assert.ok(await page.locator("[data-reader-end]").isVisible());
		if (width < 768) {
			await page.evaluate(() => {
				document
					.querySelector<HTMLElement>("[data-basalt-shell]")
					?.style.setProperty("--basalt-safe-top", "24px");
				window.scrollTo(0, 1000);
			});
			await page.waitForFunction(
				() =>
					Math.abs(
						(document.querySelector("[data-basalt-header]")?.getBoundingClientRect().top ?? -999) -
							24,
					) < 1,
			);
			assert.equal(
				await header.evaluate((node) => getComputedStyle(node, "::before").height),
				"24px",
			);
		}

		await page.evaluate(() => {
			const shell = document.querySelector<HTMLElement>("[data-basalt-shell]");
			const article = document.querySelector("article");
			if (!shell || !article) throw new Error("Missing reader");
			shell.style.removeProperty("--basalt-safe-top");
			article.replaceChildren(document.createTextNode("A short note."));
			window.scrollTo(0, 0);
		});
		const shortSurface = await page.locator("[data-basalt-island]").boundingBox();
		assert.ok(
			shortSurface &&
				Math.abs(shortSurface.y + shortSurface.height - (width < 768 ? 780 : 768)) < 2,
			"Short content fills the remaining viewport",
		);
		if (width < 768) {
			await page.setViewportSize({ width: 768, height: 780 });
			assert.equal(
				await page
					.locator("[data-basalt-main]")
					.evaluate((node) => getComputedStyle(node).overflowY),
				"hidden",
			);
			await page.setViewportSize({ width: 767, height: 780 });
			assert.equal(
				await page
					.locator("[data-basalt-main]")
					.evaluate((node) => getComputedStyle(node).overflowY),
				"visible",
			);
			await page.setViewportSize({ width, height: 780 });
		}
		await page.goto(`${url}/examples/list-detail`);
		await page.getByRole("button", { name: "Field note 12", exact: true }).click();
		const detail = page.getByRole("region", { name: "Selected note" });
		if (width < 768) {
			await page.waitForFunction(
				() => document.activeElement?.getAttribute("aria-label") === "Selected note",
			);
			assert.equal(await page.getByRole("region", { name: "Notes" }).count(), 0);
			await page.locator("[data-detail-end]").scrollIntoViewIfNeeded();
			assert.ok(await page.evaluate(() => scrollY > 0));
			await page.getByRole("button", { name: "Back to notes" }).click();
			await page.waitForFunction(() => document.activeElement?.textContent === "Field note 12");
		} else {
			assert.equal(await detail.evaluate((node) => getComputedStyle(node).overflowY), "auto");
			await detail.evaluate((node) => {
				node.scrollTop = 500;
			});
			assert.ok(await detail.evaluate((node) => node.scrollTop > 0));
			assert.equal(await page.evaluate(() => scrollY), 0);
		}

		await page.goto(`${url}/examples/workspace`);
		await page.getByLabel("Final note", { exact: true }).fill("Keyboard reachable");
		await page.getByRole("button", { name: "Save preferences" }).click();
		await page.getByRole("status").filter({ hasText: "Preferences saved locally." }).waitFor();
		const trigger = page.getByRole("button", { name: "Open navigation" });
		await trigger.click();
		const dialog = page.getByRole("dialog", { name: "Workspace navigation" });
		await dialog.waitFor();
		assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), "hidden");
		const navGeometry = await dialog.evaluate((node) => {
			const sidebar = node.querySelector("[data-basalt-sidebar]");
			if (!sidebar) throw new Error("Missing navigation sidebar");
			return {
				sidebar: sidebar.getBoundingClientRect().height,
				sheet: node.getBoundingClientRect().height,
			};
		});
		assert.ok(navGeometry.sidebar <= navGeometry.sheet + 1);
		await page.keyboard.press("Escape");
		await dialog.waitFor({ state: "hidden" });
		await page.waitForFunction(
			() => document.activeElement?.getAttribute("aria-label") === "Open navigation",
		);
		assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflow), "hidden");
		await page.getByRole("button", { name: "workspace", exact: true }).click();
		assert.equal(
			await page.locator("[data-basalt-main]").evaluate((node) => getComputedStyle(node).overflowY),
			"hidden",
		);
		await page.getByRole("button", { name: "document", exact: true }).click();
		assert.equal(
			await page.locator("[data-basalt-main]").evaluate((node) => getComputedStyle(node).overflowY),
			"visible",
		);
		await page.setViewportSize({ width, height: 460 });
		await page.getByLabel("Final note", { exact: true }).focus();
		await page.getByLabel("Final note", { exact: true }).scrollIntoViewIfNeeded();
		const fieldBox = await page.getByLabel("Final note", { exact: true }).boundingBox();
		assert.ok(fieldBox && fieldBox.y >= 0 && fieldBox.y + fieldBox.height <= 460);
		evidence.push(`${width}px: root/panes, sticky, safe-top, actions, focus, modal, form`);
	}
	return evidence;
}
