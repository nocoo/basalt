import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertRecommendation(page: Page, baseUrl: string) {
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.goto(`${baseUrl}/ui/recommendation-card`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, dark);
			await page.emulateMedia({ reducedMotion: "no-preference" });
			const demo = page.locator("[data-hero-scenario]");
			await demo.getByRole("button", { name: "Alternatives", exact: true }).click();
			const option = demo.getByRole("button", { name: /Switch to Vanilla Madagascar/ });
			await option.focus();
			await page.keyboard.press("Enter");
			await demo.getByRole("button", { name: "Configure", exact: true }).waitFor();
			assert.equal(
				await demo
					.getByRole("button", { name: "Alternatives", exact: true })
					.evaluate((node) => node === document.activeElement),
				true,
			);
			await demo.getByRole("button", { name: "Configure", exact: true }).click();
			await demo.getByRole("button", { name: "Accepted", exact: true }).waitFor();
			assert.equal(
				await demo.getByRole("button", { name: "Accepted", exact: true }).isDisabled(),
				true,
			);
			await demo.getByRole("button", { name: "Reset recommendation", exact: true }).click();
			await page.emulateMedia({ reducedMotion: "reduce" });
			assert.ok(
				(
					await demo
						.locator(".basalt-agent-reveal")
						.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).animationName))
				).every((name) => name === "none"),
			);
			assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
		}
	return {
		themes: 2,
		viewports: 2,
		alternatives: true,
		acceptance: true,
		keyboard: true,
		reducedMotion: true,
	};
}
