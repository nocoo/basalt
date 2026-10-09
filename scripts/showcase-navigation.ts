import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";
import { assertMovingHighlight } from "./showcase-hover";
import { setShowcaseTheme } from "./showcase-theme";

async function assertNavigationGeometry(sidebar: Locator, collapsed: boolean, inset = 8) {
	const geometry = await sidebar.evaluate((node) => {
		const nav = node.querySelector("nav") as HTMLElement;
		const box = node.getBoundingClientRect();
		const rows = Array.from(nav.querySelectorAll<HTMLElement>("[data-basalt-hover-item]"));
		return {
			width: box.width,
			padding: getComputedStyle(nav).padding,
			firstTop:
				rows[0].getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop,
			rows: rows.map((row) => ({
				left: row.getBoundingClientRect().left - box.left,
				height: row.getBoundingClientRect().height,
				padding: getComputedStyle(row).padding,
			})),
			centers: Array.from(node.querySelectorAll("button svg"), (icon) => {
				const rect = icon.getBoundingClientRect();
				return rect.x + rect.width / 2 - box.x;
			}),
		};
	});
	assert.equal(geometry.padding, `${inset}px`);
	assert.equal(geometry.firstTop, inset);
	assert.ok(
		geometry.rows.every((row) => row.height === 34),
		JSON.stringify(geometry),
	);
	if (collapsed) {
		assert.equal(geometry.width, 68);
		assert.ok(
			geometry.centers.every((center) => Math.abs(center - 34) < 1),
			JSON.stringify(geometry),
		);
	} else {
		assert.ok(
			geometry.rows.every((row) => row.left === inset && row.padding === "6px 8px"),
			JSON.stringify(geometry),
		);
	}
}

export async function assertNavigationLists(page: Page, baseUrl: string) {
	const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 1000 });
		for (const dark of [false, true]) {
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.goto(`${baseUrl}/ui/sidebar`);
			const sidebar = page.locator("[data-hero-scenario] [data-basalt-sidebar]");
			await sidebar.waitFor();
			await setShowcaseTheme(page, dark);
			await sidebar.evaluate((node) => ((node as HTMLElement).style.height = "480px"));
			await assertNavigationGeometry(sidebar, false);
			const expanded = await sidebar.evaluate((node) => node.outerHTML);
			const nav = sidebar.getByRole("navigation");
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await assertMovingHighlight(nav);
			await sidebar.evaluate((node) => (node as HTMLElement).style.setProperty("--spacing", "9px"));
			await assertNavigationGeometry(sidebar, false);
			await sidebar.evaluate((node) =>
				(node as HTMLElement).style.setProperty("--basalt-space-nav-inset", "4px"),
			);
			await assertNavigationGeometry(sidebar, false, 4);
			await sidebar.evaluate((node) =>
				(node as HTMLElement).style.removeProperty("--basalt-space-nav-inset"),
			);
			const last = nav.getByRole("button", { name: "Daily activity notes" });
			await last.focus();
			await last.press("Enter");
			assert.equal(await last.getAttribute("aria-current"), "page");
			const bottom = await last.boundingBox();
			const viewport = await nav.boundingBox();
			assert.ok(bottom && viewport && bottom.y + bottom.height <= viewport.y + viewport.height + 1);
			await sidebar.getByRole("button", { name: "Collapse navigation example" }).click();
			await sidebar.evaluate(async (node) => {
				await new Promise<void>((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
				);
				await Promise.allSettled(
					node.getAnimations({ subtree: true }).map((animation) => animation.finished),
				);
			});
			await assertNavigationGeometry(sidebar, true);
			await assertMovingHighlight(nav);
			await page.emulateMedia({ reducedMotion: "reduce" });
			await nav.getByRole("button", { name: "New chat" }).hover();
			assert.equal(
				await nav.evaluate((node) => getComputedStyle(node, "::before").transitionDuration),
				"0s",
			);
			const collapsed = await sidebar.evaluate((node) => node.outerHTML);
			for (const [markup, state] of [
				[expanded, false],
				[collapsed, true],
			] as const) {
				await page.setContent(`<style>${css}</style>${markup}`);
				await page.evaluate(
					(dark) => (document.documentElement.dataset.mode = dark ? "dark" : "light"),
					dark,
				);
				await assertNavigationGeometry(page.locator("[data-basalt-sidebar]"), state);
			}
		}
	}
	await page.emulateMedia({ reducedMotion: "no-preference" });
	for (const slug of ["navigation-menu", "editable-nav-item"]) {
		await page.goto(`${baseUrl}/ui/${slug}`);
		const list = page.locator("[data-hero-scenario] .basalt-hover-list");
		await list.waitFor();
		await assertMovingHighlight(list);
		assert.equal(await list.evaluate((node) => getComputedStyle(node).padding), "8px");
	}
	return {
		viewports: 2,
		themes: 2,
		cssEntrypoints: 2,
		rowHeight: 34,
		railAxis: 34,
		inset: 8,
		navigationFamilies: 3,
	};
}
