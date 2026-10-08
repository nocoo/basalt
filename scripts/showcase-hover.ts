import assert from "node:assert/strict";
import type { Locator, Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertMovingHighlight(group: Locator) {
	const items = group.locator("[data-basalt-hover-item]:not([disabled]):not([data-disabled])");
	await items.first().hover();
	await group.evaluate(async (node) => {
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
		);
		await Promise.allSettled(
			node.getAnimations({ subtree: true }).map((animation) => animation.finished),
		);
	});
	await items.nth(1).hover();
	await group.evaluate(async (node) => {
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
		);
		const transition = node
			.getAnimations({ subtree: true })
			.find(
				(animation) =>
					animation instanceof CSSTransition && animation.transitionProperty === "transform",
			);
		if (transition) await Promise.allSettled([transition.finished]);
		if (!getComputedStyle(node, "::before").transitionProperty.includes("transform"))
			throw new Error("Missing transform transition contract");
	});
	const measured = await group.evaluate((node) => {
		const item = node.querySelectorAll<HTMLElement>("[data-basalt-hover-item]")[1];
		const root = node.getBoundingClientRect();
		const box = item.getBoundingClientRect();
		const style = getComputedStyle(node, "::before");
		const transform = new DOMMatrix(style.transform);
		return {
			itemX: box.x - root.x + node.scrollLeft - node.clientLeft,
			highlightX: transform.m41,
			itemY: box.y - root.y + node.scrollTop - node.clientTop,
			highlightY: transform.m42,
			width: box.width,
			highlightWidth: parseFloat(style.width),
			opacity: style.opacity,
		};
	});
	assert.ok(Math.abs(measured.itemX - measured.highlightX) < 1, JSON.stringify(measured));
	assert.ok(Math.abs(measured.itemY - measured.highlightY) < 1, JSON.stringify(measured));
	assert.ok(Math.abs(measured.width - measured.highlightWidth) < 1, JSON.stringify(measured));
	assert.equal(measured.opacity, "1");
}

export async function assertHoverAndDensity(page: Page, baseUrl: string) {
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			for (const slug of ["select", "dropdown-menu", "approval-card", "tool-chips"]) {
				await page.emulateMedia({ reducedMotion: "no-preference" });
				await page.goto(`${baseUrl}/ui/${slug}`);
				await page.locator('[data-status="ready"]').waitFor();
				await setShowcaseTheme(page, dark);
				const demo = page.locator("[data-hero-scenario]");
				let group: Locator;
				if (slug === "select" || slug === "dropdown-menu") {
					const trigger =
						slug === "select" ? demo.getByRole("combobox") : demo.getByRole("button").first();
					assert.equal(Math.round((await trigger.boundingBox())?.height ?? 0), 34);
					await trigger.click();
					group = page.locator(".basalt-hover-list");
				} else group = demo.locator(".basalt-hover-list").first();
				try {
					await assertMovingHighlight(group);
				} catch (error) {
					throw new Error(`${slug} ${width}/${dark}: ${error}`);
				}
				await page.emulateMedia({ reducedMotion: "reduce" });
				await group.locator("[data-basalt-hover-item]").first().hover();
				assert.equal(
					await group.evaluate((node) => getComputedStyle(node, "::before").transitionDuration),
					"0s",
				);
				if (slug === "select") {
					await page.keyboard.press("End");
					await page.keyboard.press("Enter");
					await page.getByRole("listbox").waitFor({ state: "detached" });
				}
			}
			await page.goto(`${baseUrl}/ui/input`);
			await page.locator('[data-status="ready"]').waitFor();
			assert.equal(
				Math.round(
					(
						await page
							.locator('[data-scenario="input-sizes"]')
							.getByRole("textbox", { name: "Default", exact: true })
							.boundingBox()
					)?.height ?? 0,
				),
				34,
			);
		}
	return { viewports: 2, themes: 2, hoverLists: 4, defaultHeight: 34, transformOnly: true };
}
