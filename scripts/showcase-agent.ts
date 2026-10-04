import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertAgentFeedback(page: Page, baseUrl: string) {
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await page.goto(`${baseUrl}/ui/thinking`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, dark);
			const demo = page.locator("[data-hero-scenario]");
			await demo.getByRole("button", { name: "Replay trace" }).click();
			await demo.getByText("Thinking complete", { exact: true }).waitFor();
			for (const variant of ["reasoning", "search", "coding", "steps"])
				await demo.getByRole("radio", { name: variant, exact: true }).click();
			await demo.locator("button[aria-expanded]").first().click();
			await demo.locator('[data-state="closed"]').first().waitFor();
			await page.goto(`${baseUrl}/ui/approval-card`);
			await page.locator('[data-status="ready"]').waitFor();
			await demo.getByRole("radio", { name: "Three (core line)", exact: true }).click();
			await demo.getByRole("checkbox", { name: "Chocolate chips", exact: true }).waitFor();
			await demo.getByRole("checkbox", { name: "Chocolate chips", exact: true }).click();
			await demo.getByRole("textbox", { name: "Custom answer" }).fill("Waffle cones");
			await demo.getByRole("button", { name: "Continue", exact: true }).click();
			await demo.getByRole("radio", { name: "Food trucks", exact: true }).click();
			await demo.getByRole("button", { name: "Submit", exact: true }).click();
			await demo.getByText("Answers submitted", { exact: true }).waitFor();
			assert.match(
				await demo.getByRole("status", { name: "Submitted answers" }).innerText(),
				/Waffle cones/,
			);
			await page.goto(`${baseUrl}/ui/tool-chips`);
			await page.locator('[data-status="ready"]').waitFor();
			await demo.getByRole("button", { name: /Rebuild and verify npm run freeze/ }).click();
			await demo.locator("p").filter({ hasText: "34 checks passed" }).waitFor();
			await demo.getByRole("button", { name: "flavors.css +13 -0", exact: true }).click();
			await page.getByRole("heading", { name: "flavors.css", exact: true }).waitFor();
			await page.keyboard.press("Escape");
			await page.emulateMedia({ reducedMotion: "reduce" });
			const animations = await demo
				.locator(".basalt-agent-reveal")
				.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).animationName));
			assert.ok(animations.every((name) => name === "none"));
			assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
		}
	return {
		viewports: 2,
		themes: 2,
		traces: true,
		approval: true,
		toolDetails: true,
		reducedMotion: true,
	};
}
