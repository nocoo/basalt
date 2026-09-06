import assert from "node:assert/strict";
import type { Page } from "playwright";

export type ChartsGateResult = {
	viewportsTested: number;
	themesTested: number;
	totalMatrixCases: number;
	keyboardInteractionsTested: number;
	staticNoLayerChecked: number;
	frameChildFalseChecked: number;
	shellLegendChecked: number;
	gaugeValidationsChecked: number;
	heatmapNavigationsChecked: number;
	valuesValidationsChecked: number;
	statCardValidationsChecked: number;
	reducedMotionChecked: number;
	dynamicSeriesChecked: number;
};

const VIEWPORTS = [
	{ name: "desktop", width: 1280, height: 800 },
	{ name: "mobile", width: 390, height: 844 },
] as const;

const THEMES = ["light", "dark"] as const;

/**
 * Validates charts accessibility, keyboard exploration, text alternatives, and layout in a real browser
 * across a full matrix: (1280x800, 390x844) x (light, dark).
 */
export async function assertConsumerCharts(page: Page): Promise<ChartsGateResult> {
	let totalMatrixCases = 0;
	let keyboardInteractionsTested = 0;
	let staticNoLayerChecked = 0;
	let frameChildFalseChecked = 0;
	let shellLegendChecked = 0;
	let gaugeValidationsChecked = 0;
	let heatmapNavigationsChecked = 0;
	let valuesValidationsChecked = 0;
	let statCardValidationsChecked = 0;
	let reducedMotionChecked = 0;
	let dynamicSeriesChecked = 0;

	for (const vp of VIEWPORTS) {
		await page.setViewportSize({ width: vp.width, height: vp.height });

		for (const theme of THEMES) {
			totalMatrixCases++;

			// Reset state for each viewport/theme combination
			if (totalMatrixCases > 1) {
				await page.goto(page.url(), { waitUntil: "domcontentloaded" });
			}
			await page.waitForSelector("#charts-ready[data-ready='true']", { state: "visible" });

			// Switch theme and verify ThemeProvider dataset.mode
			await page.selectOption("#select-chart-theme", theme);
			await page.waitForSelector(`#charts-ready:has-text('${theme}')`);
			const mode = await page.evaluate(() => document.documentElement.dataset.mode);
			assert.equal(mode, theme, `Document dataset.mode must be '${theme}'`);

			// -------------------------------------------------------------
			// 1. BarChart: Wait for SVG mount, Tab in from before button, focus outline, ArrowRight tooltip
			// -------------------------------------------------------------
			const barCase = page.locator('[data-testid="case-bar-accessible"]');
			const barSvg = barCase.locator("svg.recharts-surface");
			await barSvg.waitFor({ state: "visible" });
			await barCase.locator('svg.recharts-surface[tabindex="0"]').waitFor({ state: "attached" });

			const beforeBar = barCase.locator("#focus-before-bar");
			await beforeBar.focus();
			assert.equal(
				await page.evaluate(() => document.activeElement?.id),
				"focus-before-bar",
				"Before-bar button must be focused before Tab",
			);

			// Tab from before-button into BarChart SVG
			await page.keyboard.press("Tab");

			const isBarFocused = await barSvg.evaluate((el) => document.activeElement === el);
			assert.equal(isBarFocused, true, "Active element after Tab must be the BarChart SVG");

			const barRole = await barSvg.getAttribute("role");
			const barTabIndex = await barSvg.getAttribute("tabindex");
			const barAriaLabel = await barSvg.getAttribute("aria-label");
			assert.equal(barRole, "application", "Interactive BarChart SVG must have role=application");
			assert.equal(barTabIndex, "0", "Interactive BarChart SVG must have tabindex=0");
			assert.equal(
				barAriaLabel,
				"Quarterly revenue bar chart",
				"BarChart SVG must have descriptive accessible name",
			);

			// Assert visible focus outline style and :focus-visible match on the SVG
			const barFocusState = await barSvg.evaluate((el) => {
				const style = window.getComputedStyle(el);
				const widthNum = Number.parseFloat(style.outlineWidth) || 0;
				return {
					matchesFocusVisible: el.matches(":focus-visible"),
					outlineStyle: style.outlineStyle,
					outlineWidth: widthNum,
				};
			});
			assert.equal(barFocusState.matchesFocusVisible, true, "Bar SVG must match :focus-visible");
			assert.notEqual(
				barFocusState.outlineStyle,
				"none",
				"Bar SVG must have a visible focus outline",
			);
			assert.ok(barFocusState.outlineWidth > 0, "Bar SVG outline width must be greater than 0");

			// Recharts selects point 0 on focus. First ArrowRight navigates to Q2 (240).
			await page.keyboard.press("ArrowRight");
			const barTooltip = barCase.locator(".recharts-tooltip-wrapper");
			await barTooltip.waitFor({ state: "visible" });
			const tooltipText1 = (await barTooltip.textContent()) ?? "";
			assert.ok(
				tooltipText1.includes("Q2") && tooltipText1.includes("240"),
				`Tooltip 1 must contain Q2 and 240 (received: "${tooltipText1}")`,
			);

			// Second ArrowRight navigates to Q3 (180).
			await page.keyboard.press("ArrowRight");
			await page.waitForFunction(
				(prev) => {
					const el = document.querySelector(
						'[data-testid="case-bar-accessible"] .recharts-tooltip-wrapper',
					);
					return el?.textContent ? el.textContent !== prev : false;
				},
				tooltipText1,
				{ timeout: 5000 },
			);
			const tooltipText2 = (await barTooltip.textContent()) ?? "";
			assert.notEqual(
				tooltipText1,
				tooltipText2,
				`Tooltip text must change across keyboard points (step1: ${tooltipText1}, step2: ${tooltipText2})`,
			);
			assert.ok(
				tooltipText2.includes("Q3") && tooltipText2.includes("180"),
				`Tooltip 2 must contain Q3 and 180 (received: "${tooltipText2}")`,
			);
			keyboardInteractionsTested++;

			// Verify details table expansion and plot area dimension preservation
			const initialBarBox = await barSvg.boundingBox();
			assert.ok(
				initialBarBox && initialBarBox.height > 50 && initialBarBox.width > 50,
				"Bar plot must have positive dimensions",
			);

			const barDetails = barCase.locator("#details-bar-data");
			await barDetails.locator("summary").click();
			const barTable = barCase.locator('table[aria-label="Quarterly revenue breakdown"]');
			await barTable.waitFor({ state: "visible" });

			const postBarBox = await barSvg.boundingBox();
			assert.ok(postBarBox, "Bar plot must still exist after table expansion");
			assert.ok(
				Math.abs((initialBarBox?.height ?? 0) - postBarBox.height) < 2,
				`Bar plot height must not collapse upon expanding details (before: ${initialBarBox?.height}, after: ${postBarBox.height})`,
			);
			assert.ok(
				Math.abs((initialBarBox?.width ?? 0) - postBarBox.width) < 2,
				`Bar plot width must not collapse upon expanding details (before: ${initialBarBox?.width}, after: ${postBarBox.width})`,
			);

			// -------------------------------------------------------------
			// 2. LineChart: Tab in from before button, focus, Arrow navigation
			// -------------------------------------------------------------
			const lineCase = page.locator('[data-testid="case-line-accessible"]');
			const lineSvg = lineCase.locator("svg.recharts-surface");
			await lineSvg.waitFor({ state: "visible" });
			await lineCase.locator('svg.recharts-surface[tabindex="0"]').waitFor({ state: "attached" });

			const beforeLine = lineCase.locator("#focus-before-line");
			await beforeLine.focus();
			await page.keyboard.press("Tab");

			const isLineFocused = await lineSvg.evaluate((el) => document.activeElement === el);
			assert.equal(isLineFocused, true, "Active element after Tab must be the Line SVG");
			assert.equal(await lineSvg.getAttribute("role"), "application");
			assert.equal(await lineSvg.getAttribute("tabindex"), "0");
			assert.equal(await lineSvg.getAttribute("aria-label"), "Monthly retention line chart");

			const lineFocusState = await lineSvg.evaluate((el) => {
				const style = window.getComputedStyle(el);
				const widthNum = Number.parseFloat(style.outlineWidth) || 0;
				return {
					matchesFocusVisible: el.matches(":focus-visible"),
					outlineStyle: style.outlineStyle,
					outlineWidth: widthNum,
				};
			});
			assert.equal(lineFocusState.matchesFocusVisible, true, "Line SVG must match :focus-visible");
			assert.notEqual(
				lineFocusState.outlineStyle,
				"none",
				"Line SVG must have a visible focus outline",
			);
			assert.ok(lineFocusState.outlineWidth > 0, "Line SVG outline width must be greater than 0");

			const initialLineBox = await lineSvg.boundingBox();
			assert.ok(
				initialLineBox && initialLineBox.height > 50 && initialLineBox.width > 50,
				"Line plot must have positive dimensions",
			);

			// Recharts selects point 0 on focus. First ArrowRight navigates to Feb (52).
			await page.keyboard.press("ArrowRight");
			const lineTooltip = lineCase.locator(".recharts-tooltip-wrapper");
			await lineTooltip.waitFor({ state: "visible" });
			const lineTooltip1 = (await lineTooltip.textContent()) ?? "";
			assert.ok(
				lineTooltip1.includes("Feb") && lineTooltip1.includes("52"),
				`Line tooltip 1 must contain Feb and 52 (received: "${lineTooltip1}")`,
			);

			// Second ArrowRight navigates to Mar (58).
			await page.keyboard.press("ArrowRight");
			await page.waitForFunction(
				(prev) => {
					const el = document.querySelector(
						'[data-testid="case-line-accessible"] .recharts-tooltip-wrapper',
					);
					return el?.textContent ? el.textContent !== prev : false;
				},
				lineTooltip1,
				{ timeout: 5000 },
			);
			const lineTooltip2 = (await lineTooltip.textContent()) ?? "";
			assert.notEqual(lineTooltip1, lineTooltip2, "Line tooltip must update upon arrow navigation");
			assert.ok(
				lineTooltip2.includes("Mar") && lineTooltip2.includes("58"),
				`Line tooltip 2 must contain Mar and 58 (received: "${lineTooltip2}")`,
			);
			keyboardInteractionsTested++;

			const lineDetails = lineCase.locator("#details-line-data");
			await lineDetails.locator("summary").click();
			const lineTable = lineCase.locator('table[aria-label="Monthly retention data"]');
			await lineTable.waitFor({ state: "visible" });

			const postLineBox = await lineSvg.boundingBox();
			assert.ok(postLineBox, "Line plot must still exist after table expansion");
			assert.ok(
				Math.abs((initialLineBox?.height ?? 0) - postLineBox.height) < 2,
				`Line plot height must not collapse upon expanding details (before: ${initialLineBox?.height}, after: ${postLineBox.height})`,
			);
			assert.ok(
				Math.abs((initialLineBox?.width ?? 0) - postLineBox.width) < 2,
				`Line plot width must not collapse upon expanding details (before: ${initialLineBox?.width}, after: ${postLineBox.width})`,
			);

			// -------------------------------------------------------------
			// 3. Wrapper accessibilityLayer={false}: SVG remains rendered but no application / tabindex
			// -------------------------------------------------------------
			const staticBarCase = page.locator('[data-testid="case-bar-disabled-layer"]');
			const staticBarSvg = staticBarCase.locator("svg.recharts-surface");
			await staticBarSvg.waitFor({ state: "visible" });
			const staticBarBox = await staticBarSvg.boundingBox();
			assert.ok(
				staticBarBox && staticBarBox.height > 20,
				"Static BarChart SVG must be rendered with positive height",
			);
			assert.equal(
				await staticBarSvg.getAttribute("role"),
				null,
				"Disabled layer must not have role=application",
			);
			assert.equal(
				await staticBarSvg.getAttribute("tabindex"),
				null,
				"Disabled layer must not have tabindex",
			);
			assert.equal(
				await staticBarCase.locator("#static-bar-alt").isVisible(),
				true,
				"Static data alternative must be visible",
			);
			staticNoLayerChecked++;

			// -------------------------------------------------------------
			// 4. ChartFrame child accessibilityLayer={false}: SVG rendered but no application / tabindex
			// -------------------------------------------------------------
			const frameChildCase = page.locator('[data-testid="case-frame-child-false"]');
			const frameChildSvg = frameChildCase.locator("svg.recharts-surface");
			await frameChildSvg.waitFor({ state: "visible" });
			const frameChildBox = await frameChildSvg.boundingBox();
			assert.ok(
				frameChildBox && frameChildBox.height > 20,
				"Frame child false SVG must be rendered with positive height",
			);
			assert.equal(
				await frameChildSvg.getAttribute("role"),
				null,
				"Frame child false must not have application role",
			);
			assert.equal(await frameChildSvg.getAttribute("tabindex"), null);
			frameChildFalseChecked++;

			// -------------------------------------------------------------
			// 5. ChartShell: Legend visible, table alternative accessible and plot dimensions preserved
			// -------------------------------------------------------------
			const shellCase = page.locator('[data-testid="case-shell-legend"]');
			const shellSvg = shellCase.locator("svg.recharts-surface");
			await shellSvg.waitFor({ state: "visible" });
			const initialShellBox = await shellSvg.boundingBox();
			assert.ok(
				initialShellBox && initialShellBox.height > 50 && initialShellBox.width > 50,
				"Shell SVG must have positive dimensions",
			);

			assert.equal(
				await shellCase.locator("#shell-legend-node").isVisible(),
				true,
				"Legend node must be visible in ChartShell",
			);
			const shellDetails = shellCase.locator("#details-shell-data");
			await shellDetails.locator("summary").click();
			const shellTable = shellCase.locator('table[aria-label="Shell alternative table"]');
			await shellTable.waitFor({ state: "visible" });

			const postShellBox = await shellSvg.boundingBox();
			assert.ok(postShellBox, "Shell plot must exist after details expansion");
			assert.ok(
				Math.abs((initialShellBox?.height ?? 0) - postShellBox.height) < 2,
				`Shell plot height must not collapse upon expanding details (before: ${initialShellBox?.height}, after: ${postShellBox.height})`,
			);
			assert.ok(
				Math.abs((initialShellBox?.width ?? 0) - postShellBox.width) < 2,
				`Shell plot width must not collapse upon expanding details (before: ${initialShellBox?.width}, after: ${postShellBox.width})`,
			);
			shellLegendChecked++;

			// -------------------------------------------------------------
			// 6. Gauge: Center text reading, alternative, positive size
			// -------------------------------------------------------------
			const gaugeCase = page.locator('[data-testid="case-gauge-accessible"]');
			const gaugeSpan = gaugeCase.locator("span");
			const gaugeText = (await gaugeSpan.textContent())?.trim();
			assert.equal(gaugeText, "72", "Gauge must display center text reading 72");
			assert.equal(
				await gaugeCase.locator("#gauge-alt").isVisible(),
				true,
				"Gauge alternative text must be visible",
			);
			const gaugeBox = await gaugeCase.locator(".recharts-surface").boundingBox();
			assert.ok(
				gaugeBox && gaugeBox.width > 50 && gaugeBox.height > 50,
				"Gauge SVG must have positive dimensions",
			);
			gaugeValidationsChecked++;

			// -------------------------------------------------------------
			// 7. HeatmapCalendar: Year grid with keyboard traversal, single Tab, Escape
			// -------------------------------------------------------------
			const heatmapCase = page.locator('[data-testid="case-heatmap-year"]');
			const beforeHeatmap = heatmapCase.locator("#focus-before-heatmap");
			await beforeHeatmap.focus();

			const jan1Cell = heatmapCase.locator('button[tabindex="0"]');

			// Tab from before button -> enters the single roving tab stop on the active cell
			await page.keyboard.press("Tab");
			const isJan1Active = await jan1Cell.evaluate((el) => document.activeElement === el);
			assert.equal(isJan1Active, true, "Active element after Tab must be the Jan 1 cell button");

			// Initial Tab should open and keep visible the Jan 1 tooltip even if scroll occurs
			await page.waitForSelector('[role="tooltip"]', { state: "visible" });
			const jan1TooltipText = (await page.locator('[role="tooltip"]').textContent()) ?? "";
			assert.ok(
				jan1TooltipText.includes("2026-01-01") && jan1TooltipText.includes("5 commits"),
				`Tooltip on initial Tab must display Jan 1 data (received: "${jan1TooltipText}")`,
			);

			const jan1Label = (await jan1Cell.getAttribute("aria-label")) ?? "";
			assert.ok(
				jan1Label.includes("2026-01-01") && jan1Label.includes("5 commits"),
				`Initial cell must have Jan 1 date and 5 commits reading (received: "${jan1Label}")`,
			);

			// Focus outline on gridcell
			const cellOutline = await jan1Cell.evaluate((el) => {
				const style = window.getComputedStyle(el);
				return {
					matchesFocusVisible: el.matches(":focus-visible"),
					outlineStyle: style.outlineStyle,
					outlineWidth: Number.parseFloat(style.outlineWidth) || 0,
				};
			});
			assert.equal(cellOutline.matchesFocusVisible, true, "Cell must match :focus-visible");
			assert.notEqual(cellOutline.outlineStyle, "none", "Cell must have visible outline");
			assert.ok(cellOutline.outlineWidth > 0, "Cell outline width must be > 0");

			// ArrowDown visually moves down in column to next day (Jan 2)
			await page.keyboard.press("ArrowDown");
			const activeDay2Label = await page.evaluate(
				() => document.activeElement?.getAttribute("aria-label") ?? "",
			);
			assert.ok(
				activeDay2Label.includes("2026-01-02") && activeDay2Label.includes("12 commits"),
				`ArrowDown must move to Jan 2 (received: "${activeDay2Label}")`,
			);

			// Tooltip should be visible for Jan 2
			await page.waitForSelector('[role="tooltip"]', { state: "visible" });
			const tooltipText = (await page.locator('[role="tooltip"]').textContent()) ?? "";
			assert.ok(
				tooltipText.includes("2026-01-02") && tooltipText.includes("12 commits"),
				`Tooltip must display Jan 2 data (received: "${tooltipText}")`,
			);

			// Escape closes tooltip while maintaining active focus on the exact same cell
			await page.keyboard.press("Escape");
			await page.waitForSelector('[role="tooltip"]', { state: "hidden" });
			const activeAfterEscape = await page.evaluate(
				() => document.activeElement?.getAttribute("aria-label") ?? "",
			);
			assert.equal(
				activeAfterEscape,
				activeDay2Label,
				"Active element after Escape must remain on the exact same Jan 2 cell",
			);

			// End key jumps to last date of year (Dec 31) - causes horizontal scroll
			await page.keyboard.press("End");
			const dec31Label = await page.evaluate(
				() => document.activeElement?.getAttribute("aria-label") ?? "",
			);
			assert.ok(
				dec31Label.includes("2026-12-31") && dec31Label.includes("9 commits"),
				`End key must jump to Dec 31 (received: "${dec31Label}")`,
			);

			// After End key and automatic scroll, tooltip for Dec 31 must remain visible and readable
			await page.waitForSelector('[role="tooltip"]', { state: "visible" });
			const dec31TooltipText = (await page.locator('[role="tooltip"]').textContent()) ?? "";
			assert.ok(
				dec31TooltipText.includes("2026-12-31") && dec31TooltipText.includes("9 commits"),
				`Tooltip after End horizontal scroll must remain visible with Dec 31 data (received: "${dec31TooltipText}")`,
			);

			// Escape closes tooltip for Dec 31
			await page.keyboard.press("Escape");
			await page.waitForSelector('[role="tooltip"]', { state: "hidden" });
			const activeAfterDecEscape = await page.evaluate(
				() => document.activeElement?.getAttribute("aria-label") ?? "",
			);
			assert.equal(
				activeAfterDecEscape,
				dec31Label,
				"Active element after Escape on Dec 31 must remain on Dec 31 cell",
			);

			// Tab to leave the entire heatmap -> must land on focus-after-heatmap (single tab stop principle)
			await page.keyboard.press("Tab");
			assert.equal(
				await page.evaluate(() => document.activeElement?.id),
				"focus-after-heatmap",
				"Single Tab from gridcell must exit to the next interactive element outside heatmap",
			);
			heatmapNavigationsChecked++;

			// -------------------------------------------------------------
			// 8. HeatmapCalendar: Values matrix (zero-value tab/focus, tooltip, shrink 10->2->empty, tab exit, no steal)
			// -------------------------------------------------------------
			const valuesCase = page.locator('[data-testid="case-heatmap-values"]');
			const beforeValues = valuesCase.locator("#focus-before-values");
			await beforeValues.focus();

			// Tab from beforeValues button into the values matrix -> lands on first cell (Position 1: 0)
			await page.keyboard.press("Tab");
			const firstCell = valuesCase.locator('button[tabindex="0"]');
			const isFirstCellFocused = await firstCell.evaluate((el) => document.activeElement === el);
			assert.equal(isFirstCellFocused, true, "First Tab must focus the initial values button");

			const zeroCellLabel = await firstCell.getAttribute("aria-label");
			assert.equal(
				zeroCellLabel,
				"Position 1: 0",
				"Zero-value cell must have accessible label 'Position 1: 0'",
			);

			// Verify zero-value cell outline is visible and not faded
			const zeroOutline = await firstCell.evaluate((el) => {
				const style = window.getComputedStyle(el);
				return {
					matchesFocusVisible: el.matches(":focus-visible"),
					outlineStyle: style.outlineStyle,
					outlineWidth: Number.parseFloat(style.outlineWidth) || 0,
				};
			});
			assert.equal(
				zeroOutline.matchesFocusVisible,
				true,
				"Zero-value cell must match :focus-visible",
			);
			assert.notEqual(
				zeroOutline.outlineStyle,
				"none",
				"Zero-value cell must have visible outline",
			);
			assert.ok(zeroOutline.outlineWidth > 0, "Zero-value cell outline width must be > 0");

			// Visible tooltip check on focus
			await page.waitForSelector('[role="tooltip"]', { state: "visible" });
			const valuesTooltip = await page.locator('[role="tooltip"]').textContent();
			assert.ok(
				valuesTooltip?.includes("Position 1: 0"),
				`Tooltip must show zero value (got: "${valuesTooltip}")`,
			);

			// Navigate to last item (index 9) with End key
			await page.keyboard.press("End");
			const lastCellLabel = await page.evaluate(
				() => document.activeElement?.getAttribute("aria-label") ?? "",
			);
			assert.equal(lastCellLabel, "Position 10: 4", "End key must navigate to Position 10");

			// Trigger shrink 10 -> 2
			await page.evaluate(() => {
				const btn = document.getElementById("values-shrink-btn");
				btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
			});
			// Focus was in matrix, so after shrink it restores to index 1 (Position 2: 3)
			const activeAfterShrink = await page.evaluate(
				() => document.activeElement?.getAttribute("aria-label") ?? "",
			);
			assert.equal(
				activeAfterShrink,
				"Position 2: 3",
				"Focus must be restored to clamped active item on shrink",
			);

			// Trigger empty while activeElement is in the matrix
			await page.evaluate(() => {
				const btn = document.getElementById("values-empty-btn");
				btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
			});
			const activeAfterEmpty = await page.evaluate(
				() => document.activeElement?.getAttribute("role") ?? "",
			);
			assert.equal(
				activeAfterEmpty,
				"region",
				"Focus must be restored to empty region when values empty",
			);

			// Tab to exit empty values matrix -> lands on focus-after-values
			await page.keyboard.press("Tab");
			assert.equal(
				await page.evaluate(() => document.activeElement?.id),
				"focus-after-values",
				"Single Tab from empty region must exit to focus-after-values button",
			);

			// Test that outside focus is NOT stolen when values change
			const outsideBtn = valuesCase.locator("#outside-focus-btn");
			await outsideBtn.focus();
			assert.equal(
				await page.evaluate(() => document.activeElement?.id),
				"outside-focus-btn",
				"Outside button must be focused",
			);

			// Restore values while focus is outside
			await valuesCase.locator("#values-restore-btn").click();
			await outsideBtn.focus();
			// Trigger another shrink while focus is outside
			await valuesCase.locator("#values-shrink-btn").click();
			assert.equal(
				await page.evaluate(() => document.activeElement?.id),
				"values-shrink-btn",
				"Focus must not be stolen back to the heatmap when focus was outside",
			);

			// Restore back to original 10 values for next loop iteration
			await valuesCase.locator("#values-restore-btn").click();
			valuesValidationsChecked++;

			// -------------------------------------------------------------
			// 9. StatCard: Error state -> Retry via Enter -> ready state with Tooltip & Escape
			// -------------------------------------------------------------
			const statCardCase = page.locator('[data-testid="case-statcard-interactive"]');
			const statCardRoot = statCardCase.locator('div[role="group"]');
			const beforeStatCard = statCardCase.locator("#focus-before-statcard");

			// In error state: old value "1,420" and old trend "+8.5%" must NOT be in DOM or accessible label
			await beforeStatCard.focus();
			const errorCardLabel = await statCardRoot.getAttribute("aria-label");
			assert.ok(
				!errorCardLabel?.includes("1,420") && !errorCardLabel?.includes("8.5%"),
				`Error card label must not report overridden value or stale trend (got: "${errorCardLabel}")`,
			);
			assert.equal(
				await statCardCase.locator("#statcard-error-status").isVisible(),
				true,
				"Error status message must be visible",
			);
			assert.equal(
				await statCardCase.locator("text='1,420'").count(),
				0,
				"Old value must not be in DOM during error state",
			);

			// Tab from before-button lands on the Retry button
			await page.keyboard.press("Tab");
			assert.equal(
				await page.evaluate(() => document.activeElement?.id),
				"statcard-retry-btn",
				"Tab must focus the Retry button in error state",
			);

			// Press Enter on the focused Retry button to trigger transition to ready
			await page.keyboard.press("Enter");
			await page.waitForSelector("#statcard-action-btn", { state: "visible" });

			// In ready state: formatted value 1,420 and trend are rendered and restored to accessible name
			const readyCardLabel = await statCardRoot.getAttribute("aria-label");
			assert.ok(
				readyCardLabel?.includes("1,420") && readyCardLabel?.includes("8.5%"),
				`Ready card label must include formatted value 1,420 and trend (got: "${readyCardLabel}")`,
			);
			const statCardRole = await statCardRoot.getAttribute("role");
			assert.equal(statCardRole, "group", "Interactive StatCard with action must have role=group");

			// Focus the help action button inside StatCard
			const helpBtn = statCardCase.locator("#statcard-action-btn");
			await helpBtn.focus();
			assert.equal(
				await page.evaluate(() => document.activeElement?.id),
				"statcard-action-btn",
				"Help action button must be focused",
			);

			// Tooltip must become visible on focus (renders via Portal at body root)
			await page.waitForSelector("#statcard-tooltip-text", { state: "visible" });
			const statcardTooltip = await page.locator("#statcard-tooltip-text").textContent();
			assert.ok(
				statcardTooltip?.includes("Accounts with at least one active seat"),
				"StatCard action tooltip must display methodology explanation",
			);

			// Escape closes tooltip while maintaining active focus on the help button
			await page.keyboard.press("Escape");
			await page.waitForSelector("#statcard-tooltip-text", { state: "hidden" });
			assert.equal(
				await page.evaluate(() => document.activeElement?.id),
				"statcard-action-btn",
				"Focus must remain on the help button after Escape",
			);

			// Tab out of StatCard -> lands on focus-after-statcard
			await page.keyboard.press("Tab");
			assert.equal(
				await page.evaluate(() => document.activeElement?.id),
				"focus-after-statcard",
				"Tab from StatCard action must land on following button",
			);

			// Reset to error state for next loop iteration
			await statCardCase.locator("#statcard-set-error").click();
			statCardValidationsChecked++;

			// -------------------------------------------------------------
			// 10. Reduced Motion verification across normal and reduced preferences
			// -------------------------------------------------------------
			const rmCase = page.locator('[data-testid="case-reduced-motion"]');
			const rmButton = rmCase.locator("#rm-button-loading");
			const rmButtonSvg = rmButton.locator("svg");
			const rmChatCaret = rmCase.locator("#rm-chat-bubble [aria-hidden]");

			// Accessible state & visibility assertions
			assert.equal(
				await rmButton.getAttribute("aria-busy"),
				"true",
				"Loading button must have aria-busy=true",
			);
			assert.equal(await rmButton.isDisabled(), true, "Loading button must be disabled");
			assert.equal(
				await rmChatCaret.getAttribute("aria-hidden"),
				"true",
				"Streaming caret must have aria-hidden=true",
			);
			assert.equal(await rmButtonSvg.isVisible(), true, "Spinner SVG must be visible");
			assert.equal(await rmChatCaret.isVisible(), true, "Streaming caret must be visible");

			// Verify text is clearly visible in normal mode
			assert.ok(
				(await rmButton.textContent())?.includes("Saving Telemetry"),
				"Button loading text must be visible in normal mode",
			);
			assert.ok(
				(await rmCase.locator("#rm-chat-bubble").textContent())?.includes(
					"Processing query results",
				),
				"ChatBubble streaming text must be visible in normal mode",
			);

			// Under normal motion (no-preference): animationName should be active for both spinner and caret
			await page.emulateMedia({ reducedMotion: "no-preference" });
			const normalButtonAnim = await rmButtonSvg.evaluate((el) => {
				return window.getComputedStyle(el).animationName;
			});
			assert.notEqual(
				normalButtonAnim,
				"none",
				"Spinner animation must be active under normal motion",
			);

			const normalCaretAnim = await rmChatCaret.evaluate((el) => {
				return window.getComputedStyle(el).animationName;
			});
			assert.notEqual(
				normalCaretAnim,
				"none",
				"Chat streaming caret animation must be active under normal motion",
			);

			// Switch to reduced motion preference: animationName must become none and no running animations
			await page.emulateMedia({ reducedMotion: "reduce" });
			const reducedButtonState = await rmButtonSvg.evaluate((el) => {
				return {
					animName: window.getComputedStyle(el).animationName,
					runningCount: el.getAnimations().filter((a) => a.playState === "running").length,
				};
			});
			assert.equal(
				reducedButtonState.animName,
				"none",
				"Spinner animation must be disabled under reduced motion",
			);
			assert.equal(
				reducedButtonState.runningCount,
				0,
				"Spinner must have zero running animations under reduced motion",
			);

			const reducedCaretState = await rmChatCaret.evaluate((el) => {
				return {
					animName: window.getComputedStyle(el).animationName,
					runningCount: el.getAnimations().filter((a) => a.playState === "running").length,
				};
			});
			assert.equal(
				reducedCaretState.animName,
				"none",
				"Chat streaming caret animation must be disabled under reduced motion",
			);
			assert.equal(
				reducedCaretState.runningCount,
				0,
				"Streaming caret must have zero running animations under reduced motion",
			);

			// Under reduced motion: verify all text and layout remain intact and elements visible
			assert.equal(
				await rmButtonSvg.isVisible(),
				true,
				"Spinner SVG must remain visible in reduced motion",
			);
			assert.equal(
				await rmChatCaret.isVisible(),
				true,
				"Streaming caret must remain visible in reduced motion",
			);
			assert.ok(
				(await rmButton.textContent())?.includes("Saving Telemetry"),
				"Button loading text must remain visible in reduced motion",
			);
			assert.ok(
				(await rmCase.locator("#rm-chat-bubble").textContent())?.includes(
					"Processing query results",
				),
				"ChatBubble streaming text must remain visible in reduced motion",
			);

			// Restore media back to no-preference and assert animations resume (not permanently disabled)
			await page.emulateMedia({ reducedMotion: "no-preference" });
			const restoredButtonAnim = await rmButtonSvg.evaluate((el) => {
				return window.getComputedStyle(el).animationName;
			});
			assert.notEqual(
				restoredButtonAnim,
				"none",
				"Spinner animation must resume when returning to normal motion",
			);

			const restoredCaretAnim = await rmChatCaret.evaluate((el) => {
				return window.getComputedStyle(el).animationName;
			});
			assert.notEqual(
				restoredCaretAnim,
				"none",
				"Chat streaming caret animation must resume when returning to normal motion",
			);

			reducedMotionChecked++;

			// -------------------------------------------------------------
			// 11. Dynamic Series (>3 keys, legend interactive buttons, customTooltip, stack expand)
			// -------------------------------------------------------------
			const dynamicCase = page.locator('[data-testid="case-dynamic-series"]');
			const dynamicLineSvg = dynamicCase.locator(
				'svg.recharts-surface[aria-label="Multi-region latency dynamic line"]',
			);
			await dynamicLineSvg.waitFor({ state: "visible" });

			// Verify actual SVG visible ticks for formatter and yDomain
			const lineAxisLabels = await dynamicLineSvg.locator("text").evaluateAll((nodes) =>
				nodes.map((node) => {
					const spans = Array.from(node.querySelectorAll("tspan"));
					return spans.length ? spans.map((span) => span.textContent).join(" ") : node.textContent;
				}),
			);
			const xTicks = lineAxisLabels.filter((text) => text?.endsWith(" CST"));
			const yTicks = lineAxisLabels.filter((text) => text?.endsWith("ms"));
			assert.ok(
				xTicks.length >= 2 && xTicks.every((text) => text.endsWith(" CST")),
				`X-axis must format ticks with CST: ${JSON.stringify(xTicks)}`,
			);
			assert.ok(
				yTicks.includes("-20ms") && yTicks.includes("160ms"),
				`Y-axis must render explicit domain [-20, 160] with ms units: ${JSON.stringify(yTicks)}`,
			);

			// Check custom interactive legend slot has all 5 series buttons initially
			const legendSlot = dynamicCase.locator("#dynamic-legend-slot");
			await legendSlot.waitFor({ state: "visible" });
			const legendBtns = legendSlot.locator("button");
			assert.equal(
				await legendBtns.count(),
				5,
				"Dynamic legend slot must render 5 series controls",
			);

			// Initial line count: exactly 5 .recharts-line elements
			const lineElements = dynamicCase.locator(".recharts-line");
			assert.equal(await lineElements.count(), 5, "Must render exactly 5 .recharts-line initially");

			// Keyboard activation on legend button via Space: 5 -> 4
			const usBtn = legendSlot.locator("#dynamic-legend-btn-p95US");
			await usBtn.focus();
			assert.equal(
				await page.evaluate(() => document.activeElement?.id),
				"dynamic-legend-btn-p95US",
				"Dynamic legend button must be keyboard focusable",
			);
			await page.keyboard.press("Space");
			await page.waitForFunction(
				() =>
					document.querySelectorAll(
						'[data-testid="case-dynamic-series"] svg.recharts-surface[aria-label="Multi-region latency dynamic line"] .recharts-line',
					).length === 4,
			);
			assert.equal(await usBtn.getAttribute("aria-pressed"), "false");
			assert.equal(
				await lineElements.count(),
				4,
				"Deactivating series via Space must reduce .recharts-line to 4",
			);

			// Keyboard activation on legend button via Enter: 4 -> 5
			await page.keyboard.press("Enter");
			await page.waitForFunction(
				() =>
					document.querySelectorAll(
						'[data-testid="case-dynamic-series"] svg.recharts-surface[aria-label="Multi-region latency dynamic line"] .recharts-line',
					).length === 5,
			);
			assert.equal(await usBtn.getAttribute("aria-pressed"), "true");
			assert.equal(
				await lineElements.count(),
				5,
				"Reactivating series via Enter must restore .recharts-line to 5",
			);

			// Keyboard exploration: two ArrowRight presses verify distinct label and value changes with units
			const focusBeforeDynamic = dynamicCase.locator("#focus-before-dynamic-line");
			await focusBeforeDynamic.focus();
			await page.keyboard.press("Tab");
			assert.equal(
				await page.evaluate(() => document.activeElement?.getAttribute("aria-label")),
				"Multi-region latency dynamic line",
				"Tab must focus dynamic line chart graphic",
			);

			// First ArrowRight
			await page.keyboard.press("ArrowRight");
			const customTooltipEl = dynamicCase.locator('[data-testid="dynamic-custom-tooltip"]');
			await customTooltipEl.waitFor({ state: "visible" });
			const tooltipTitleFirst = await dynamicCase.locator("#dynamic-tooltip-title").textContent();
			const tooltipTextFirst = await customTooltipEl.textContent();
			assert.equal(
				tooltipTitleFirst,
				"11:00",
				"First ArrowRight must navigate to the 11:00 coordinate",
			);
			const usMetricFirst = (
				await dynamicCase.locator("#dynamic-tooltip-items [data-key='p95US']").innerText()
			)
				.replace(/\s+/g, " ")
				.trim();
			assert.equal(
				usMetricFirst,
				"US Region 48ms",
				"First ArrowRight must render exact formatted text 'US Region 48ms'",
			);
			assert.ok(
				tooltipTextFirst?.includes("ms"),
				"Custom dynamic tooltip must include ms unit on first step",
			);

			// Second ArrowRight
			await page.keyboard.press("ArrowRight");
			await page.waitForFunction(
				(prev) => document.querySelector("#dynamic-tooltip-title")?.textContent !== prev,
				tooltipTitleFirst,
			);
			const tooltipTitleSecond = await dynamicCase.locator("#dynamic-tooltip-title").textContent();
			const tooltipTextSecond = await customTooltipEl.textContent();
			assert.equal(
				tooltipTitleSecond,
				"12:00",
				"Second ArrowRight must navigate to the 12:00 coordinate",
			);
			const usMetricSecond = (
				await dynamicCase.locator("#dynamic-tooltip-items [data-key='p95US']").innerText()
			)
				.replace(/\s+/g, " ")
				.trim();
			assert.equal(
				usMetricSecond,
				"US Region 52ms",
				"Second ArrowRight must render exact updated text 'US Region 52ms'",
			);
			assert.notEqual(
				tooltipTitleFirst,
				tooltipTitleSecond,
				"Second ArrowRight must navigate to a different coordinate label",
			);
			assert.notEqual(
				tooltipTextFirst,
				tooltipTextSecond,
				"Second ArrowRight must update tooltip content and values",
			);
			assert.ok(
				tooltipTextSecond?.includes("ms"),
				"Custom dynamic tooltip must include ms unit on second step",
			);

			// Verify composable tooltip items: exactly 5 rows, divider, and exact summary total (52+64+142+32+100 = 390ms)
			const tooltipRows = dynamicCase.locator('[data-testid="chart-tooltip-row"]');
			assert.equal(
				await tooltipRows.count(),
				5,
				"Dynamic tooltip must render exactly 5 ChartTooltipRow elements",
			);
			const tooltipDivider = dynamicCase.locator('[data-testid="chart-tooltip-divider"]');
			assert.equal(
				await tooltipDivider.count(),
				1,
				"Dynamic tooltip must render ChartTooltipDivider",
			);
			const tooltipSummary = dynamicCase.locator('[data-testid="chart-tooltip-summary"]');
			assert.equal(
				await tooltipSummary.count(),
				1,
				"Dynamic tooltip must render ChartTooltipSummary",
			);
			const summaryText = (await tooltipSummary.innerText()).replace(/\s+/g, " ").trim();
			assert.equal(
				summaryText,
				"Aggregated Latency 390ms",
				`Tooltip summary must display exact aggregated total and unit: '${summaryText}'`,
			);

			// Stack area geometry verification with ratio dataset (Start: 10/20, End: 100/200)
			const areaSvg = dynamicCase.locator(
				'svg.recharts-surface[aria-label="Multi-region latency dynamic area"]',
			);
			await areaSvg.waitFor({ state: "visible" });

			async function getAreaTopCurveYDiff() {
				return areaSvg
					.locator(".recharts-area-curve")
					.last()
					.evaluate((node: SVGPathElement) => {
						const length = node.getTotalLength();
						const startPoint = node.getPointAtLength(0);
						const endPoint = node.getPointAtLength(length);
						return Math.abs(startPoint.y - endPoint.y);
					});
			}

			// In default non-expand (absolute) mode: End total (300) >> Start total (30), top curve has large slope
			const absoluteSlope = await getAreaTopCurveYDiff();
			assert.ok(
				absoluteSlope > 40,
				`Absolute stack area must show significant vertical height difference between Start and End (got ${absoluteSlope})`,
			);

			// Toggle stack expand mode on area chart -> 100% normalized
			const toggleExpandBtn = dynamicCase.locator("#btn-toggle-stack-expand");
			await toggleExpandBtn.click();
			await page.waitForFunction(() =>
				Array.from(
					document.querySelectorAll(
						'[data-testid="case-dynamic-series"] svg.recharts-surface[aria-label="Multi-region latency dynamic area"] text',
					),
				).some((node) => node.textContent?.endsWith("%")),
			);

			// In expand mode: both Start (10/(10+20) = 33%) and End (100/(100+200) = 33%) total 100%, top curve is horizontal
			const expandSlope = await getAreaTopCurveYDiff();
			assert.ok(
				expandSlope < 2,
				`Normalized (expand) stack area top curve must be near-horizontal (y-diff < 2, got ${expandSlope})`,
			);

			// Toggle back to absolute to ensure restoration
			await toggleExpandBtn.click();
			await page.waitForFunction(
				() =>
					!Array.from(
						document.querySelectorAll(
							'[data-testid="case-dynamic-series"] svg.recharts-surface[aria-label="Multi-region latency dynamic area"] text',
						),
					).some((node) => node.textContent?.endsWith("%")),
			);
			const restoredAbsoluteSlope = await getAreaTopCurveYDiff();
			assert.ok(
				restoredAbsoluteSlope > 40,
				`Restored absolute stack area must show significant vertical slope again (got ${restoredAbsoluteSlope})`,
			);

			dynamicSeriesChecked++;
		}
	}

	return {
		viewportsTested: VIEWPORTS.length,
		themesTested: THEMES.length,
		totalMatrixCases,
		keyboardInteractionsTested,
		staticNoLayerChecked,
		frameChildFalseChecked,
		shellLegendChecked,
		gaugeValidationsChecked,
		heatmapNavigationsChecked,
		valuesValidationsChecked,
		statCardValidationsChecked,
		reducedMotionChecked,
		dynamicSeriesChecked,
	};
}
