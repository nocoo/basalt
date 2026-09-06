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
	await page.clock.setFixedTime(new Date("2026-09-09T12:00:00Z"));
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

	// 7. Controlled month: rejection, rerender retention, deferred acceptance, and external month changes
	const controlledTrigger = page.locator(
		"#controlled-month-container button#controlled-month-picker",
	);
	await controlledTrigger.click();
	const controlledGrid = page.locator('table[role="grid"]');
	await controlledGrid.waitFor({ state: "visible" });

	const controlledLive = page.locator("#controlled-month-picker-month-live");
	assert.ok((await controlledLive.textContent())?.includes("September 2026"));

	// Clear initial requests
	await page.evaluate(() => window.calendarAudit?.clearRequestedMonths?.());

	// 7a. User clicks next month button while parent rejects (mode:reject)
	const nextMonthBtn = page.locator('div[role="dialog"] button[aria-label="Next"]');
	await nextMonthBtn.click();
	let requested = await page.evaluate(() => window.calendarAudit?.getRequestedMonths?.() ?? []);
	assert.equal(requested.length, 1);
	assert.equal(requested[0], "2026-10", "onMonthChange must receive 2026-10 on next click");
	// View remains in September because parent rejected update
	assert.ok((await controlledLive.textContent())?.includes("September 2026"));

	// 7b. Keyboard PageDown navigation while parent rejects
	const sep15 = controlledGrid.locator('button[data-date="2026-09-15"]');
	assert.equal(await sep15.getAttribute("tabindex"), "0");
	await sep15.focus();
	await page.keyboard.press("PageDown");
	requested = await page.evaluate(() => window.calendarAudit?.getRequestedMonths?.() ?? []);
	assert.equal(requested.length, 2);
	assert.equal(requested[1], "2026-10", "onMonthChange must receive 2026-10 on PageDown");
	// After rejection, focus must remain on the original date (2026-09-15)
	await page.waitForFunction(
		() => document.activeElement?.getAttribute("data-date") === "2026-09-15",
	);

	// 7c. Parent re-renders via calendarAudit without pointer/click event outside popover
	await page.evaluate(() => window.calendarAudit?.rerenderControlledParent?.());
	// Still in September 2026, focus is not lost or jumped to day 1, popover stays open
	assert.ok((await controlledLive.textContent())?.includes("September 2026"));
	await page.waitForFunction(
		() => document.activeElement?.getAttribute("data-date") === "2026-09-15",
	);

	// 7d. Parent now accepts "2026-10": deferred pendingFocus should target 2026-10-15
	await page.evaluate(() => window.calendarAudit?.acceptPendingControlledMonth?.("2026-10"));
	await page.waitForFunction(() =>
		document
			.querySelector("#controlled-month-picker-month-live")
			?.textContent?.includes("October 2026"),
	);
	await page.waitForFunction(
		() =>
			document.activeElement?.getAttribute("data-date") === "2026-10-15" &&
			document.activeElement?.getAttribute("tabindex") === "0",
	);

	// 7e. External month change to December 2026 does NOT invoke onMonthChange and does NOT alter selected ISO value
	const prevReqCount = (
		await page.evaluate(() => window.calendarAudit?.getRequestedMonths?.() ?? [])
	).length;
	await page.evaluate(() => window.calendarAudit?.setExternalControlledMonth?.("2026-12"));
	await page.waitForFunction(() =>
		document
			.querySelector("#controlled-month-picker-month-live")
			?.textContent?.includes("December 2026"),
	);
	const postReqCount = (
		await page.evaluate(() => window.calendarAudit?.getRequestedMonths?.() ?? [])
	).length;
	assert.equal(postReqCount, prevReqCount, "external month change must NOT trigger onMonthChange");

	// Trigger label must still display original selected date (Sep 15, 2026)
	const controlledTriggerText = await controlledTrigger.textContent();
	assert.ok(
		controlledTriggerText?.includes("Sep 15, 2026"),
		`trigger label must keep original ISO date, got: ${controlledTriggerText}`,
	);

	await page.keyboard.press("Escape");
	await controlledGrid.waitFor({ state: "detached" });

	// 8. Regression: Empty date with defaultMonth=2026-11, ArrowRight to 11-02, parent rerenders changing defaultMonth, subsequent ArrowRight advances to 11-03
	const emptyDefTrigger = page.locator(
		"#empty-default-month-container button#empty-default-month-picker",
	);
	await emptyDefTrigger.click();
	const emptyDefGrid = page.locator('table[role="grid"]');
	await emptyDefGrid.waitFor({ state: "visible" });

	// Wait for autofocus on day 1
	await page.waitForFunction(
		() => document.activeElement?.getAttribute("data-date") === "2026-11-01",
	);
	// ArrowRight to 2026-11-02
	await page.keyboard.press("ArrowRight");
	await page.waitForFunction(
		() => document.activeElement?.getAttribute("data-date") === "2026-11-02",
	);

	// Parent rerenders defaultMonth prop to 2027-05 (should only act as initial default)
	await page.evaluate(() => window.calendarAudit?.changeDefaultMonthProp?.("2027-05"));

	// Subsequent ArrowRight advances to 2026-11-03 (must NOT jump back to 2026-11-01)
	await page.keyboard.press("ArrowRight");
	await page.waitForFunction(
		() => document.activeElement?.getAttribute("data-date") === "2026-11-03",
	);

	await page.keyboard.press("Escape");
	await emptyDefGrid.waitFor({ state: "detached" });

	// 9. Regression: Empty controlled month=2026-11, ArrowRight to 11-02, PageDown, parent accepts 12月 -> lands on 12-02, subsequent ArrowRight to 12-03
	const emptyCtrlTrigger = page.locator(
		"#empty-controlled-month-container button#empty-controlled-month-picker",
	);
	await emptyCtrlTrigger.click();
	const emptyCtrlGrid = page.locator('table[role="grid"]');
	await emptyCtrlGrid.waitFor({ state: "visible" });

	await page.waitForFunction(
		() => document.activeElement?.getAttribute("data-date") === "2026-11-01",
	);
	await page.keyboard.press("ArrowRight");
	await page.waitForFunction(
		() => document.activeElement?.getAttribute("data-date") === "2026-11-02",
	);

	await page.keyboard.press("PageDown");
	const emptyReq = await page.evaluate(
		() => window.calendarAudit?.getEmptyRequestedMonths?.() ?? [],
	);
	assert.ok(
		emptyReq.includes("2026-12"),
		"PageDown must request 2026-12 in empty controlled picker",
	);

	// Parent accepts 2026-12
	await page.evaluate(() => window.calendarAudit?.setEmptyControlledMonth?.("2026-12"));
	// Focus must land on 2026-12-02 (not jump to 2026-12-01)
	await page.waitForFunction(
		() => document.activeElement?.getAttribute("data-date") === "2026-12-02",
	);

	// Subsequent ArrowRight advances to 2026-12-03
	await page.keyboard.press("ArrowRight");
	await page.waitForFunction(
		() => document.activeElement?.getAttribute("data-date") === "2026-12-03",
	);

	await page.keyboard.press("Escape");
	await emptyCtrlGrid.waitFor({ state: "detached" });

	// 10. Localized Chinese Form: required validation message, custom validation alert & keyboard instructions
	const localizedTrigger = page.locator(
		"#localized-form-container button#localized-booking-picker",
	);
	assert.equal(await localizedTrigger.textContent(), "请选择服务日期");

	// Open popover to check keyboard instructions
	await localizedTrigger.click();
	const localizedDialog = page.locator('div[role="dialog"]');
	await localizedDialog.waitFor({ state: "visible" });
	const instructions = localizedDialog.locator("p.sr-only");
	assert.ok(await instructions.isVisible(), "sr-only instructions element should exist in DOM");
	const instructionsText = await instructions.textContent();
	assert.equal(instructionsText, "使用方向键在日期中移动，PageUp/PageDown切换月份，回车确认选择");
	assert.equal(
		await localizedDialog.getAttribute("aria-describedby"),
		await instructions.getAttribute("id"),
		"dialog aria-describedby must reference keyboard instructions id",
	);

	await page.keyboard.press("Escape");
	await localizedDialog.waitFor({ state: "detached" });

	// Submit empty form -> triggers native required validation, displays custom validationMessage in alert role
	await page.locator("#submit-booking-btn").click();
	const alert = page.locator("#localized-form-container [role='alert']");
	await alert.waitFor({ state: "visible" });
	assert.equal(await alert.textContent(), "请先选择有效的预约日期再提交");
	// Focus must be directed to visible trigger button
	await page.waitForFunction(() => document.activeElement?.id === "localized-booking-picker");

	return {
		gridSemantics: { columnHeaders: 7, multiselectable: true },
		keyboardNavigation: { arrowRight: "2026-09-10", home: "2026-09-07", end: "2026-09-13" },
		monthClamping: { leapDay: "2024-02-29", nonLeapNextYear: "2025-02-28" },
		rangeSelection: { from: "2026-09-10", middle: "2026-09-11", to: "2026-09-12" },
		controlledMonth: {
			rejectedMonth: "2026-09",
			acceptedTarget: "2026-10-15",
			externalMonth: "2026-12",
		},
		emptyRegressions: {
			defaultMonthRoving: "2026-11-03",
			emptyControlledRoving: "2026-12-03",
		},
		localizedLabels: {
			placeholder: "请选择服务日期",
			customValidation: "请先选择有效的预约日期再提交",
		},
	};
}
