import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";
export async function assertDiffReview(page: Page, baseUrl: string) {
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.goto(`${baseUrl}/ui/diff-table`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, dark);
			const demo = page.locator("[data-hero-scenario]");
			assert.ok(
				await page
					.locator("[data-doc-scroll]")
					.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
				"Hidden column labels must stay inside the table scroll boundary",
			);
			const change = demo.getByRole("checkbox", { name: "Include removal Blood pressure" });
			await change.focus();
			await page.keyboard.press("Space");
			assert.equal(await change.isChecked(), false);
			await demo.getByRole("switch", { name: "Simulate failure" }).check();
			await demo.getByRole("button", { name: "Apply 2 changes", exact: true }).click();
			await demo.getByRole("alert").waitFor();
			await demo.getByRole("switch", { name: "Simulate failure" }).uncheck();
			await demo.getByRole("button", { name: "Apply 2 changes", exact: true }).click();
			await demo.getByText("2 changes applied", { exact: true }).waitFor();
			assert.equal(await change.isDisabled(), true);
			await page.emulateMedia({ reducedMotion: "reduce" });
			await demo.getByRole("button", { name: "Reset changes" }).click();
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
		viewports: 2,
		themes: 2,
		keyboard: true,
		explicitApply: true,
		retry: true,
		reducedMotion: true,
	};
}
