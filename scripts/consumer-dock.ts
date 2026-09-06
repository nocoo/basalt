import assert from "node:assert/strict";
import type { Page } from "playwright";

export async function assertConsumerDock(page: Page) {
	await page.setViewportSize({ width: 390, height: 740 });

	// Case 1: regional overlay permits Tab and Shift+Tab beyond panel, background clickable, Escape restores focus
	await page.evaluate(() => {
		window.renderDock?.({ mode: "overlay", nested: "none" });
	});
	await page.locator("#opener").click();
	await page.waitForFunction(() => document.activeElement?.id === "first");
	await page.waitForTimeout(350);

	const panel = page.locator('[aria-label="Details"]');
	assert.notEqual(
		await panel.getAttribute("aria-modal"),
		"true",
		"regional overlay must not claim whole-document modality",
	);

	// Tab from #last should exit dock to #after
	await page.locator("#last").focus();
	await page.keyboard.press("Tab");
	assert.equal(
		await page.evaluate(() => document.activeElement?.id),
		"after",
		"Tab should navigate past regional dock panel",
	);

	// Shift+Tab from #after should enter back to #last
	await page.keyboard.press("Shift+Tab");
	assert.equal(
		await page.evaluate(() => document.activeElement?.id),
		"last",
		"Shift+Tab should navigate back into dock panel",
	);

	// Background button outside dock remains interactive
	await page.locator("#background").click();
	const bgCount = await page.evaluate(
		() => (window.auditState?.background as number | undefined) ?? 0,
	);
	assert.ok(bgCount >= 1, "background button outside dock should receive click");

	// Escape closes dock and restores focus to opener
	await page.locator("#last").focus();
	await page.keyboard.press("Escape");
	await page.waitForFunction(() => document.activeElement?.id === "opener");
	assert.equal(await page.locator("#dock-state").textContent(), "false");
	assert.equal(await panel.getAttribute("inert"), "");

	// Case 2: Escape closes nested popover / dialog before dock
	for (const nested of ["popover", "dialog"]) {
		await page.evaluate((n) => {
			window.renderDock?.({ mode: "overlay", nested: n });
		}, nested);
		await page.locator("#opener").click();
		await page.waitForFunction(() => document.activeElement?.id === "first");
		await page.waitForTimeout(350);

		await page.locator("#nested-opener").click();
		await page.locator("#nested-focus").waitFor({ state: "visible" });
		await page.locator("#nested-focus").focus();

		// First Escape closes nested element, Dock remains open
		await page.keyboard.press("Escape");
		await page.locator("#nested-focus").waitFor({ state: "hidden" });
		assert.equal(
			await page.locator("#dock-state").textContent(),
			"true",
			`first Escape must close nested ${nested} while dock stays open`,
		);

		// Second Escape closes the Dock
		await page.keyboard.press("Escape");
		await page.waitForFunction(() => document.activeElement?.id === "opener");
		assert.equal(await page.locator("#dock-state").textContent(), "false");
	}

	return {
		passed: true,
		modal: await panel.getAttribute("aria-modal"),
		backgroundInteractive: true,
	};
}
