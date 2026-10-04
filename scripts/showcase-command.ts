import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertCommandSelection(page: Page, baseUrl: string) {
	await page.setViewportSize({ width: 640, height: 900 });
	await page.goto(`${baseUrl}/ui/command-palette`);
	await page.locator('[data-status="ready"]').waitFor();
	await page
		.locator('[data-scenario="command-palette-simple-flat-list"]')
		.getByRole("button", { name: "Search pages..." })
		.click();
	await page.setViewportSize({ width: 640, height: 160 });
	await page.getByRole("dialog").evaluate(async (node) => {
		await Promise.all(node.getAnimations().map((animation) => animation.finished));
	});
	await page.getByRole("combobox").press("End");
	const bounds = await page.getByRole("listbox").evaluate((node) => {
		node.scrollTop = node.scrollHeight;
		const item = node.querySelector("[cmdk-item]:last-child");
		return {
			listBottom: node.getBoundingClientRect().bottom,
			itemBottom: item?.getBoundingClientRect().bottom ?? Infinity,
			viewport: innerHeight,
		};
	});
	assert.ok(
		bounds.itemBottom <= bounds.listBottom + 1 && bounds.listBottom <= bounds.viewport,
		JSON.stringify(bounds),
	);
	await page.keyboard.press("Escape");
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(`${baseUrl}/ui/command-palette`);
		await page.locator('[data-status="ready"]').waitFor();
		for (const dark of [false, true]) {
			await setShowcaseTheme(page, dark);
			for (const variant of ["with-grouped-items", "simple-flat-list"]) {
				await page.emulateMedia({ reducedMotion: "no-preference" });
				const scenario = page.locator(`[data-scenario="command-palette-${variant}"]`);
				await scenario.getByRole("button", { name: "Search pages...", exact: true }).click();
				const list = page.getByRole("listbox");
				await page.getByRole("option", { name: "Button", exact: true }).waitFor();
				await page.getByRole("dialog").evaluate(async (node) => {
					await Promise.all(
						node.getAnimations({ subtree: true }).map((animation) => animation.finished),
					);
				});
				const insets = await list.evaluate((node) => {
					const root = node.getBoundingClientRect();
					return Array.from(node.querySelectorAll("[cmdk-item]")).map((item) => {
						const box = item.getBoundingClientRect();
						return [box.left - root.left, root.right - box.right];
					});
				});
				assert.ok(
					insets.every((pair) => pair.every((inset) => Math.abs(inset - 6) < 1)),
					JSON.stringify(insets),
				);
				const before = await list.evaluate((node) =>
					parseFloat(getComputedStyle(node, "::before").top),
				);
				await page.getByRole("combobox").press("ArrowDown");
				await page.waitForFunction(
					() =>
						document.querySelector('[cmdk-item][data-selected="true"]')?.textContent === "Input",
				);
				await page.waitForFunction(() =>
					document
						.querySelector("[cmdk-list]")
						?.getAnimations({ subtree: true })
						.some(
							(animation) =>
								animation instanceof CSSTransition && animation.transitionProperty === "top",
						),
				);
				const movement = await list.evaluate((node) => {
					const animation = node
						.getAnimations({ subtree: true })
						.find((item) => item instanceof CSSTransition && item.transitionProperty === "top");
					if (!animation?.effect) throw new Error("Missing command highlight transition");
					animation.pause();
					animation.currentTime = Number(animation.effect.getTiming().duration) / 2;
					const middle = parseFloat(getComputedStyle(node, "::before").top);
					animation.finish();
					return {
						middle,
						target: parseFloat(
							(node as HTMLElement).style.getPropertyValue("--basalt-command-top"),
						),
					};
				});
				assert.ok(
					movement.middle > before && movement.middle < movement.target,
					JSON.stringify({ before, ...movement }),
				);
				await page.emulateMedia({ reducedMotion: "reduce" });
				await page.getByRole("option", { name: "Button", exact: true }).hover();
				await page.waitForFunction(
					() =>
						document.querySelector('[cmdk-item][data-selected="true"]')?.textContent === "Button",
				);
				assert.equal(
					await list.evaluate((node) => getComputedStyle(node, "::before").transitionDuration),
					"0s",
				);
				await page.getByRole("combobox").fill("no-match");
				await page.waitForFunction(
					() =>
						document
							.querySelector<HTMLElement>("[cmdk-list]")
							?.style.getPropertyValue("--basalt-command-width") === "0px",
				);
				await page.getByRole("combobox").fill("Input");
				await page.getByRole("option", { name: "Input", exact: true }).waitFor();
				await page.keyboard.press("Escape");
				await page.getByRole("dialog").waitFor({ state: "detached" });
			}
		}
	}
	return { insets: 6, variants: 2, keyboard: true, pointer: true, reducedMotion: true };
}
