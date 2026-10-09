import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";
export async function assertContextCards(page: Page, baseUrl: string) {
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.goto(`${baseUrl}/ui/context-cards`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, dark);
			const demo = page.locator("[data-hero-scenario]");
			assert.equal(await demo.getByRole("link", { name: /Patient Intake Guide/ }).count(), 1);
			assert.equal(await demo.getByRole("link", { name: /Care Progress Export/ }).count(), 0);
			await demo.getByRole("radio", { name: "loading", exact: true }).click();
			await demo.getByRole("status", { name: "Loading context" }).waitFor();
			await demo.getByRole("radio", { name: "empty", exact: true }).click();
			await demo.getByText("No context retrieved", { exact: true }).waitFor();
			await demo.getByRole("radio", { name: "error", exact: true }).click();
			await demo.getByRole("button", { name: "Try again" }).click();
			await demo.getByText("Patient intake rule", { exact: true }).waitFor();
			await page.emulateMedia({ reducedMotion: "reduce" });
			const animations = await demo
				.locator(".basalt-agent-reveal")
				.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).animationName));
			assert.ok(animations.every((name) => name === "none"));
			assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
		}
	return { themes: 2, viewports: 2, sourceLinks: true, states: true, reducedMotion: true };
}
