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
	};
}
