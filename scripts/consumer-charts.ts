import assert from "node:assert/strict";
import type { Page } from "playwright";

export type ChartsGateResult = {
	viewportsTested: number;
	themesTested: number;
	totalMatrixCases: number;
	keyboardInteractionsTested: number;
	statCardValidationsChecked: number;
	reducedMotionChecked: number;
	frameGeometryChecked: number;
};

const VIEWPORTS = [
	{ width: 1280, height: 800 },
	{ width: 390, height: 844 },
] as const;
const THEMES = ["light", "dark"] as const;

export async function assertConsumerCharts(page: Page): Promise<ChartsGateResult> {
	let totalMatrixCases = 0;
	let keyboardInteractionsTested = 0;
	let statCardValidationsChecked = 0;
	let reducedMotionChecked = 0;
	let frameGeometryChecked = 0;

	for (const viewport of VIEWPORTS) {
		await page.setViewportSize(viewport);
		for (const theme of THEMES) {
			if (totalMatrixCases > 0) {
				await page.goto(page.url(), { waitUntil: "domcontentloaded" });
			}
			totalMatrixCases++;
			await page.locator("#charts-ready[data-ready='true']").waitFor();
			await page.selectOption("#select-chart-theme", theme);
			await page.locator("#charts-ready").filter({ hasText: theme }).waitFor();
			assert.equal(await page.evaluate(() => document.documentElement.dataset.mode), theme);

			const rechartsCase = page.locator('[data-testid="case-recharts"]');
			const chartSvg = rechartsCase.locator("svg.recharts-surface");
			await chartSvg.waitFor({ state: "visible" });
			await rechartsCase
				.locator('svg.recharts-surface[tabindex="0"]')
				.waitFor({ state: "attached" });
			assert.equal(await chartSvg.getAttribute("role"), "application");
			assert.equal(await chartSvg.getAttribute("aria-label"), "Quarterly revenue chart");
			await rechartsCase.locator("#focus-before-chart").focus();
			await page.keyboard.press("Tab");
			assert.equal(await chartSvg.evaluate((node) => document.activeElement === node), true);
			await page.keyboard.press("ArrowRight");
			const tooltip = rechartsCase.locator(".recharts-tooltip-wrapper");
			await tooltip.waitFor({ state: "visible" });
			const tooltipText = (await tooltip.textContent()) ?? "";
			assert.ok(tooltipText.includes("Q2") && tooltipText.includes("$240k"), tooltipText);
			assert.ok(tooltipText.toLowerCase().includes("revenue"), tooltipText);
			keyboardInteractionsTested++;

			const initialBox = await chartSvg.boundingBox();
			assert.ok(initialBox && initialBox.width > 50 && initialBox.height > 50);
			await rechartsCase.locator("#details-recharts-data summary").click();
			await rechartsCase.getByRole("table", { name: "Quarterly revenue data" }).waitFor();
			const expandedBox = await chartSvg.boundingBox();
			assert.ok(expandedBox);
			assert.ok(Math.abs(initialBox.width - expandedBox.width) < 2);
			assert.ok(Math.abs(initialBox.height - expandedBox.height) < 2);
			assert.equal(await rechartsCase.getByTestId("chart-legend").isVisible(), true);

			const customCase = page.locator('[data-testid="case-custom-svg"]');
			const shell = customCase.getByTestId("chart-shell");
			const plot = shell.locator(".basalt-chart");
			await customCase.getByRole("img", { name: "Custom SVG plot" }).waitFor({ state: "visible" });
			const shellClass = (await shell.getAttribute("class")) ?? "";
			const plotClass = (await plot.getAttribute("class")) ?? "";
			assert.ok(shellClass.includes("w-1/2"));
			assert.ok(shellClass.includes("h-basalt-36"));
			assert.ok(shellClass.includes("p-basalt-card"));
			assert.ok(plotClass.includes("w-full"));
			assert.equal(plotClass.includes("w-1/2"), false);
			assert.equal(plotClass.includes("h-basalt-36"), false);
			assert.equal(plotClass.includes("p-basalt-card"), false);
			const shellBox = await shell.boundingBox();
			const plotBox = await plot.boundingBox();
			assert.ok(shellBox && shellBox.width > 0 && shellBox.height > 0);
			assert.ok(plotBox && plotBox.width > 0 && plotBox.width <= shellBox.width);
			frameGeometryChecked++;

			const statCase = page.locator('[data-testid="case-stat-card"]');
			const statGroup = statCase.getByRole("group", { name: /Active subscriptions/ });
			await statGroup.waitFor();
			assert.equal(await statCase.locator("svg.lucide-activity").count(), 1);
			await statCase.getByRole("button", { name: "Refresh", exact: true }).click();
			await statCase.getByText("1,421", { exact: true }).waitFor();
			assert.equal(
				await statCase.getByRole("img", { name: "Subscription trend" }).isVisible(),
				true,
			);
			statCardValidationsChecked++;

			await page.emulateMedia({ reducedMotion: "reduce" });
			const loadingButton = page.locator("#loading-button");
			const spinner = loadingButton.locator("svg");
			await spinner.waitFor({ state: "visible" });
			const animation = await spinner.evaluate((node) => getComputedStyle(node).animationName);
			assert.equal(animation, "none");
			assert.equal(await loadingButton.isDisabled(), true);
			reducedMotionChecked++;
		}
	}

	return {
		viewportsTested: VIEWPORTS.length,
		themesTested: THEMES.length,
		totalMatrixCases,
		keyboardInteractionsTested,
		statCardValidationsChecked,
		reducedMotionChecked,
		frameGeometryChecked,
	};
}
