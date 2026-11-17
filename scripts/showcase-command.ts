import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertCommandSelection(page: Page, baseUrl: string) {
	await page.setViewportSize({ width: 640, height: 900 });
	await page.goto(`${baseUrl}/ui/command-palette`);
	await page.locator('[data-status="ready"]').waitFor();
	await page
		.locator('[data-scenario="command-palette-simple-flat-list"]')
		.getByRole("button", { name: "Search conversations..." })
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
			for (const variant of [
				{
					name: "with-grouped-items",
					trigger: "Search pages...",
					first: "Button",
					second: "Input",
				},
				{
					name: "simple-flat-list",
					trigger: "Search conversations...",
					first: "Sys2: 工作流编制",
					second: "Pull And Run Code Locally",
				},
			]) {
				await page.emulateMedia({ reducedMotion: "no-preference" });
				const scenario = page.locator(`[data-scenario="command-palette-${variant.name}"]`);
				await scenario.getByRole("button", { name: variant.trigger, exact: true }).click();
				const list = page.getByRole("listbox");
				await page.getByRole("option", { name: new RegExp(`^${variant.first}`) }).waitFor();
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
					insets.every((pair) => pair.every((inset) => Math.abs(inset - 8) < 1)),
					JSON.stringify(insets),
				);
				const before = await list.evaluate(
					(node) => new DOMMatrix(getComputedStyle(node, "::before").transform).m42,
				);
				await page.getByRole("combobox").press("ArrowDown");
				await page.waitForFunction(
					(second) =>
						document
							.querySelector('[cmdk-item][data-selected="true"]')
							?.textContent?.startsWith(second),
					variant.second,
				);
				await page.waitForFunction(() =>
					document
						.querySelector("[cmdk-list]")
						?.getAnimations({ subtree: true })
						.some(
							(animation) =>
								animation instanceof CSSTransition && animation.transitionProperty === "transform",
						),
				);
				const movement = await list.evaluate((node) => {
					const animation = node
						.getAnimations({ subtree: true })
						.find(
							(item) => item instanceof CSSTransition && item.transitionProperty === "transform",
						);
					if (!animation?.effect) throw new Error("Missing command highlight transition");
					animation.pause();
					animation.currentTime = Number(animation.effect.getTiming().duration) / 2;
					const middle = new DOMMatrix(getComputedStyle(node, "::before").transform).m42;
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
				await page.getByRole("option", { name: new RegExp(`^${variant.first}`) }).hover();
				await page.waitForFunction(
					(first) =>
						document
							.querySelector('[cmdk-item][data-selected="true"]')
							?.textContent?.startsWith(first),
					variant.first,
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
				await page.getByRole("combobox").fill(variant.second);
				await page.getByRole("option", { name: new RegExp(`^${variant.second}`) }).waitFor();
				await page.keyboard.press("Escape");
				await page.getByRole("dialog").waitFor({ state: "detached" });
			}
		}
	}
	return { insets: 8, variants: 2, keyboard: true, pointer: true, reducedMotion: true };
}
