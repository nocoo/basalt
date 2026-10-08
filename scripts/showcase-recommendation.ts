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
			const option = demo.getByRole("button", { name: /Review sleep routine/ });
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
			if (width === 390) {
				// 200% text size on a narrow viewport must not clip content inside the card.
				await page.evaluate(() => {
					document.documentElement.style.fontSize = "32px";
				});
				await demo.getByRole("button", { name: "Alternatives", exact: true }).click();
				await demo.getByRole("button", { name: /Review all care plan items/ }).click();
				const action = demo.getByRole("button", {
					name: "Accept full care plan update",
					exact: true,
				});
				await action.waitFor();
				const zoom = await action.evaluate((node) => {
					const card = node.closest(".overflow-hidden") as HTMLElement;
					const box = node.getBoundingClientRect();
					const bounds = card.getBoundingClientRect();
					return {
						cardOverflow: card.scrollWidth - card.clientWidth,
						actionOverflow: node.scrollWidth - node.clientWidth,
						actionRight: Math.round(box.right - bounds.right),
						actionLines: box.height / Number.parseFloat(getComputedStyle(node).lineHeight),
					};
				});
				assert.ok(zoom.cardOverflow <= 1, `clipped at 200% text: ${JSON.stringify(zoom)}`);
				assert.ok(zoom.actionOverflow <= 1, `action label clipped: ${JSON.stringify(zoom)}`);
				assert.ok(zoom.actionRight <= 1, `action escaped the card: ${JSON.stringify(zoom)}`);
				assert.ok(zoom.actionLines >= 1, `action height collapsed: ${JSON.stringify(zoom)}`);
				await page.evaluate(() => {
					document.documentElement.style.fontSize = "";
				});
			}
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
		zoom200: true,
		keyboard: true,
		reducedMotion: true,
	};
}
