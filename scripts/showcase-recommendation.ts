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
				const originalAction = demo.getByRole("button", {
					name: "Accept full care plan update",
					exact: true,
				});
				await originalAction.waitFor();
				await originalAction.evaluate((node) => node.setAttribute("data-zoom-action", ""));
				const action = demo.locator("[data-zoom-action]");
				for (const label of [
					"Accept full care plan update",
					"Synchronisationskonfigurations\u00e4nderungen \u00fcbernehmen",
					"Acceptthisrecommendationandapplythechangeswithoutspaces0123456789",
				]) {
					const zoom = await action.evaluate((node, label) => {
						node.textContent = label;
						const card = node.closest(".overflow-hidden") as HTMLElement;
						const box = node.getBoundingClientRect();
						const bounds = card.getBoundingClientRect();
						const style = getComputedStyle(node);
						const content = {
							left:
								box.left +
								Number.parseFloat(style.paddingLeft) +
								Number.parseFloat(style.borderLeftWidth),
							right:
								box.right -
								Number.parseFloat(style.paddingRight) -
								Number.parseFloat(style.borderRightWidth),
							top:
								box.top +
								Number.parseFloat(style.paddingTop) +
								Number.parseFloat(style.borderTopWidth),
							bottom:
								box.bottom -
								Number.parseFloat(style.paddingBottom) -
								Number.parseFloat(style.borderBottomWidth),
						};
						const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
						const textRects = [];
						while (walker.nextNode()) {
							const range = document.createRange();
							range.selectNodeContents(walker.currentNode);
							textRects.push(...range.getClientRects());
						}
						return {
							label,
							cardOverflow: card.scrollWidth - card.clientWidth,
							actionOverflow: node.scrollWidth - (node as HTMLElement).offsetWidth,
							textOverhang: Math.max(
								...textRects.flatMap((rect) => [
									content.left - rect.left,
									rect.right - content.right,
									content.top - rect.top,
									rect.bottom - content.bottom,
								]),
							),
							actionOverhang: Math.max(
								bounds.left - box.left,
								box.right - bounds.right,
								bounds.top - box.top,
								box.bottom - bounds.bottom,
							),
							textLines: textRects.length,
							actionLines: box.height / Number.parseFloat(style.lineHeight),
						};
					}, label);
					assert.ok(zoom.cardOverflow <= 1, `clipped at 200% text: ${JSON.stringify(zoom)}`);
					assert.ok(zoom.actionOverflow <= 1, `action overflow: ${JSON.stringify(zoom)}`);
					assert.ok(zoom.textOverhang <= 1, `action label clipped: ${JSON.stringify(zoom)}`);
					assert.ok(zoom.actionOverhang <= 1, `action escaped the card: ${JSON.stringify(zoom)}`);
					assert.ok(zoom.textLines > 0, `action text missing: ${JSON.stringify(zoom)}`);
					assert.ok(zoom.actionLines >= 1, `action height collapsed: ${JSON.stringify(zoom)}`);
				}
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
