import assert from "node:assert/strict";
import type { Page } from "playwright";

/**
 * Validates DatePicker calendar consumer contract across Standalone and Tailwind setups.
 * Covers:
 * - Table grid semantics (role="grid", column headers count, row & gridcell counts, roving tabindex)
 * - Keyboard navigation (Arrow keys roving, Home/End week boundary according to weekStartsOn)
 * - Month clamping (PageDown, PageUp, Shift+PageDown year jump clamped to month boundaries)
 * - Polite live region for month announcement (aria-live="polite", aria-atomic="true", updates on navigation)
 * - Multi-day range aria-multiselectable="true", cell aria-selected & edge aria-pressed states
 * - Dialog closing on Escape and focus restoration to the trigger button
 */
export async function assertConsumerCalendar(page: Page) {
	await page.waitForFunction(() => Boolean(window.calendarAudit?.mounted));

	// 1. Grid semantics & roving tabindex on appointment picker
	const singleTrigger = page.locator("#single-calendar-container button");
	await singleTrigger.click();

	const grid = page.locator('table[role="grid"]');
	await grid.waitFor({ state: "visible" });
	assert.ok(await grid.isVisible(), "calendar table grid must be visible");

	const headers = grid.locator("th");
	assert.equal(await headers.count(), 7, "calendar grid must have exactly 7 column headers");

	const rows = grid.locator("tr");
	assert.ok(
		(await rows.count()) >= 7,
		"calendar grid must have 1 thead row and at least 6 tbody rows",
	);

	const cells = grid.locator('td[role="gridcell"]');
	assert.ok((await cells.count()) >= 28, "calendar grid must have at least 28 gridcells");

	const roving = grid.locator('button[tabindex="0"]');
	assert.equal(await roving.count(), 1, "exactly one roving button in grid must have tabindex=0");
	assert.equal(await roving.getAttribute("data-date"), "2026-09-09");

	// 2. Month live region announcement
	const liveRegion = page.locator("#appointment-picker-month-live");
	assert.ok(await liveRegion.isVisible(), "month live label must exist");
	assert.equal(await liveRegion.getAttribute("aria-live"), "polite");
	assert.equal(await liveRegion.getAttribute("aria-atomic"), "true");
	const monthText = await liveRegion.textContent();
	assert.ok(monthText?.includes("September 2026"), `expected September 2026, got: ${monthText}`);

	// 3. Arrow keyboard navigation & Home / End week boundary (weekStartsOn=1: Monday 07 Home, Sunday 13 End)
	await roving.focus();
	await page.keyboard.press("ArrowRight");
	await page.waitForFunction(
		() =>
			document.activeElement?.getAttribute("data-date") === "2026-09-10" &&
			document.activeElement?.getAttribute("tabindex") === "0",
	);

	await page.keyboard.press("Home");
	await page.waitForFunction(
		() =>
			document.activeElement?.getAttribute("data-date") === "2026-09-07" &&
			document.activeElement?.getAttribute("tabindex") === "0",
	);

	await page.keyboard.press("End");
	await page.waitForFunction(
		() =>
			document.activeElement?.getAttribute("data-date") === "2026-09-13" &&
			document.activeElement?.getAttribute("tabindex") === "0",
	);

	// 4. Escape closes calendar popup and returns focus to trigger
	await page.keyboard.press("Escape");
	await grid.waitFor({ state: "detached" });
	await page.waitForFunction(() => document.activeElement?.id === "appointment-picker");

	// 5. Clamped month navigation on end-of-month (2024-01-31 + PageDown -> 2024-02-29 leap year clamped)
	const clampedTrigger = page.locator("#clamped-calendar-container button");
	await clampedTrigger.click();
	const clampedGrid = page.locator('table[role="grid"]');
	await clampedGrid.waitFor({ state: "visible" });

	const clampedLiveRegion = page.locator("#clamped-picker-month-live");
	assert.ok((await clampedLiveRegion.textContent())?.includes("January 2024"));

	const clampedRoving = clampedGrid.locator('button[tabindex="0"]');
	assert.equal(await clampedRoving.getAttribute("data-date"), "2024-01-31");
	await clampedRoving.focus();

	await page.keyboard.press("PageDown");
	await page.waitForFunction(
		() =>
			document.activeElement?.getAttribute("data-date") === "2024-02-29" &&
			document.activeElement?.getAttribute("tabindex") === "0",
	);
	const febText = await clampedLiveRegion.textContent();
	assert.ok(febText?.includes("February 2024"), `expected February 2024, got: ${febText}`);

	// PageUp returns to January clamped
	await page.keyboard.press("PageUp");
	await page.waitForFunction(
		() =>
			document.activeElement?.getAttribute("data-date") === "2024-01-29" &&
			document.activeElement?.getAttribute("tabindex") === "0",
	);
	const janText = await clampedLiveRegion.textContent();
	assert.ok(janText?.includes("January 2024"), `expected January 2024, got: ${janText}`);

	// Move back to Feb 29 then Shift+PageDown -> year jump to 2025-02-28 (2025 non-leap clamps to 28)
	await page.keyboard.press("PageDown");
	await page.waitForFunction(
		() => document.activeElement?.getAttribute("data-date") === "2024-02-29",
	);

	await page.keyboard.press("Shift+PageDown");
	await page.waitForFunction(
		() =>
			document.activeElement?.getAttribute("data-date") === "2025-02-28" &&
			document.activeElement?.getAttribute("tabindex") === "0",
	);
	const yearJumpText = await clampedLiveRegion.textContent();
	assert.ok(
		yearJumpText?.includes("February 2025"),
		`expected February 2025, got: ${yearJumpText}`,
	);

	// Shift+PageUp -> year jump back to 2024-02-28
	await page.keyboard.press("Shift+PageUp");
	await page.waitForFunction(
		() =>
			document.activeElement?.getAttribute("data-date") === "2024-02-28" &&
			document.activeElement?.getAttribute("tabindex") === "0",
	);

	await page.keyboard.press("Escape");
	await clampedGrid.waitFor({ state: "detached" });
	await page.waitForFunction(() => document.activeElement?.id === "clamped-picker");

	// 6. Range mode: aria-multiselectable="true", aria-selected on cell & aria-pressed on edges (2026-09-10 to 2026-09-12)
	const rangeTrigger = page.locator("#range-calendar-container button");
	await rangeTrigger.click();
	const rangeGrid = page.locator('table[role="grid"]');
	await rangeGrid.waitFor({ state: "visible" });
	assert.equal(
		await rangeGrid.getAttribute("aria-multiselectable"),
		"true",
		"range calendar grid must set aria-multiselectable='true'",
	);

	const cell10 = rangeGrid.locator('td[role="gridcell"]:has(button[data-date="2026-09-10"])');
	const btn10 = rangeGrid.locator('button[data-date="2026-09-10"]');
	assert.equal(await cell10.getAttribute("aria-selected"), "true");
	assert.equal(await btn10.getAttribute("aria-pressed"), "true");

	const cell11 = rangeGrid.locator('td[role="gridcell"]:has(button[data-date="2026-09-11"])');
	const btn11 = rangeGrid.locator('button[data-date="2026-09-11"]');
	assert.equal(await cell11.getAttribute("aria-selected"), "true");
	assert.equal(await btn11.getAttribute("aria-pressed"), "false");

	const cell12 = rangeGrid.locator('td[role="gridcell"]:has(button[data-date="2026-09-12"])');
	const btn12 = rangeGrid.locator('button[data-date="2026-09-12"]');
	assert.equal(await cell12.getAttribute("aria-selected"), "true");
	assert.equal(await btn12.getAttribute("aria-pressed"), "true");

	await page.keyboard.press("Escape");
	await rangeGrid.waitFor({ state: "detached" });
	await page.waitForFunction(() => document.activeElement?.id === "stay-picker");

	return {
		gridSemantics: { columnHeaders: 7, multiselectable: true },
		keyboardNavigation: { arrowRight: "2026-09-10", home: "2026-09-07", end: "2026-09-13" },
		monthClamping: { leapDay: "2024-02-29", nonLeapNextYear: "2025-02-28" },
		rangeSelection: { from: "2026-09-10", middle: "2026-09-11", to: "2026-09-12" },
	};
}
