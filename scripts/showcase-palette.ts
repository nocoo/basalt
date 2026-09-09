import assert from "node:assert/strict";
import type { Page } from "playwright";
import { CATALOG } from "../src/pages/ui/catalog";
import { CATALOG_PAGE_STATUS } from "../src/pages/ui/generated/catalog-page-status";
import { assertGaugeAppearance, measureChartContrast } from "./chart-appearance";
import { assertNoPageFaults, attachPageFaults } from "./consumer-browser";
import { setShowcaseTheme } from "./showcase-theme";

const STORAGE_KEY = "basalt-palette-v1";
const TEXT_SELECTOR = [
	"[data-hero-scenario] svg.recharts-surface text",
	"[data-scenario] svg.recharts-surface text",
	'[data-testid="chart-legend"] span',
	'[data-hero-scenario] ol[aria-label="Timeline"] span',
].join(",");
const SVG_CHARTS = new Set([
	"charts",
	"timeseries",
	"custom-chart",
	"bar",
	"line",
	"area",
	"donut",
	"grouped-bar",
	"stacked-bar",
	"sparkline",
	"gauge",
	"radar",
	"funnel",
	"bullet",
	"sankey",
]);
const KEYBOARD_TOOLTIPS = new Set([
	"charts",
	"timeseries",
	"custom-chart",
	"bar",
	"line",
	"area",
	"grouped-bar",
	"stacked-bar",
	"bullet",
]);
const HOVER_TOOLTIPS: Record<string, string> = {
	donut: ".recharts-pie-sector .recharts-sector",
	funnel: ".recharts-funnel-trapezoid",
	sankey: "svg.recharts-surface g rect",
};
const MARK_SELECTOR = [
	".recharts-line-curve",
	".recharts-area-curve",
	".recharts-area-area",
	".recharts-bar-rectangle .recharts-rectangle",
	".recharts-pie-sector .recharts-sector",
	".recharts-radial-bar-sector",
	".recharts-radar-polygon .recharts-polygon",
	".recharts-funnel-trapezoid .recharts-trapezoid",
	".recharts-sankey-link",
	".recharts-sankey-node rect",
].join(",");

async function assertSolidMarks(page: Page, label: string) {
	const marks = await page.locator(MARK_SELECTOR).evaluateAll((nodes) =>
		nodes.flatMap((node) => {
			const box = node.getBoundingClientRect();
			const style = getComputedStyle(node);
			if (!box.width || !box.height || style.visibility !== "visible" || style.display === "none")
				return [];
			const effects: string[] = [];
			for (let parent: Element | null = node; parent; parent = parent.parentElement) {
				const paint = getComputedStyle(parent);
				if (paint.filter !== "none" || paint.boxShadow !== "none")
					effects.push(`${parent.tagName}: ${paint.filter} / ${paint.boxShadow}`);
				if (parent.classList.contains("basalt-chart")) break;
			}
			return [
				{ shape: node.getAttribute("class"), fill: style.fill, stroke: style.stroke, effects },
			];
		}),
	);
	for (const mark of marks) {
		assert.deepEqual(mark.effects, [], `${label}: chart marks must have no filters or shadows`);
		assert.ok(
			!mark.fill.startsWith("url(") && !mark.stroke.startsWith("url("),
			`${label}: chart marks must use solid colors: ${JSON.stringify(mark)}`,
		);
		assert.ok(
			mark.fill === "none" || mark.stroke === "none" || mark.fill === mark.stroke,
			`${label}: chart marks must have no contrasting outlines: ${JSON.stringify(mark)}`,
		);
		assert.ok(mark.fill !== "none" || mark.stroke !== "none", `${label}: invisible chart mark`);
	}
	return marks.length;
}

async function chartColors(page: Page) {
	return page
		.locator("[data-chart-swatch]")
		.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundColor));
}

async function accentColor(page: Page) {
	return page
		.locator('[data-accent-swatch="primary"]')
		.evaluate((node) => getComputedStyle(node).backgroundColor);
}

async function editPalette(page: Page) {
	const summary = page.locator("summary").filter({ hasText: "Customize all 12 colors" });
	if (!(await summary.evaluate((node) => node.parentElement?.hasAttribute("open"))))
		await summary.click();
}

async function assertPageWidth(page: Page, label: string) {
	assert.equal(
		await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
		false,
		`${label}: document overflow`,
	);
}

async function assertTextContrast(page: Page, selector: string, label: string) {
	const measurements = await measureChartContrast(page, selector);
	const failures = measurements.filter((item) => item.ratio < 4.5);
	assert.deepEqual(failures, [], `${label}: text contrast below 4.5:1`);
	return measurements;
}

/** Preference lifecycle and each ready chart family in both themes and viewports. */
export async function assertPaletteShowcases(page: Page, baseUrl: string) {
	const cases: string[] = [];
	const chartPages = CATALOG.filter(
		(entry) => entry.category === "chart" && CATALOG_PAGE_STATUS[entry.slug] === "ready",
	);
	let textPairs = 0;
	let minimumTextContrast = Number.POSITIVE_INFINITY;
	let minimumMarkContrast = Number.POSITIVE_INFINITY;
	let minimumDarkMarkContrast = Number.POSITIVE_INFINITY;
	let solidMarks = 0;
	let tooltipCases = 0;
	const trackColors: Record<string, string> = {};
	await page.goto(`${baseUrl}/palette`);
	await page.evaluate(() => localStorage.setItem("language", "en"));
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			const theme = dark ? "dark" : "light";
			await page.setViewportSize({ width, height: 1000 });
			await page.emulateMedia({ reducedMotion: "reduce", colorScheme: dark ? "light" : "dark" });
			await setShowcaseTheme(page, dark);
			await page.evaluate((key) => {
				localStorage.removeItem(key);
				localStorage.setItem("basalt-accent", "primary");
			}, STORAGE_KEY);
			await page.goto(`${baseUrl}/palette`);
			await page.locator("[data-chart-swatch]").first().waitFor();
			await setShowcaseTheme(page, dark);
			assert.equal(await page.locator("[data-accent-choice]").count(), 12);
			assert.equal(await page.locator("[data-chart-swatch]").count(), 5);
			const baseline = await chartColors(page);
			assert.equal(new Set(baseline).size, 5, "Chart palette must contain five distinct colors");
			const candyColors = await page
				.locator(
					'[data-accent-swatch="primary"], [data-accent-swatch="rose"], [data-accent-swatch="green"], [data-accent-swatch="amber"]',
				)
				.evaluateAll((nodes) =>
					Object.fromEntries(
						nodes.map((node) => [
							node.getAttribute("data-accent-swatch"),
							getComputedStyle(node).backgroundColor,
						]),
					),
				);
			assert.deepEqual(
				baseline.slice(0, 4),
				[candyColors.primary, candyColors.rose, candyColors.green, candyColors.amber],
				"Charts must use the exact classic candy swatch values",
			);
			const expectedGray = await page.evaluate((dark) => {
				const probe = document.createElement("span");
				probe.style.color = dark ? "hsl(210 20% 86%)" : "hsl(215 12% 48%)";
				document.body.appendChild(probe);
				const color = getComputedStyle(probe).color;
				probe.remove();
				return color;
			}, dark);
			assert.equal(baseline[4], expectedGray, "Preserve the existing chart gray");
			const classic = await accentColor(page);
			for (const choice of await page.locator("[data-accent-choice]").all()) {
				await choice.click();
				assert.equal(await choice.getAttribute("aria-pressed"), "true");
				assert.deepEqual(
					await chartColors(page),
					baseline,
					"Control accents cannot mutate chart colors",
				);
				const measurements = await assertTextContrast(
					page,
					"[data-palette-preview] button, [data-palette-preview] label",
					`${theme} control accent`,
				);
				textPairs += measurements.length;
				for (const item of measurements)
					minimumTextContrast = Math.min(minimumTextContrast, item.ratio);
			}
			await page.locator('[data-accent-choice="primary"]').click();
			await page.getByRole("button", { name: "Preview primary", exact: true }).click();
			assert.equal(
				await page
					.getByRole("button", { name: "Selected", exact: true })
					.getAttribute("aria-pressed"),
				"true",
			);
			await editPalette(page);
			const lightInput = page.getByRole("textbox", { name: "Blue · Light", exact: true });
			const darkInput = page.getByRole("textbox", { name: "Blue · Dark", exact: true });
			await lightInput.fill("#bad");
			assert.equal(await lightInput.getAttribute("aria-invalid"), "true");
			assert.equal(
				await page.getByRole("button", { name: "Save custom palette" }).isDisabled(),
				true,
			);
			await page.getByRole("alert").filter({ hasText: "six-digit hex" }).waitFor();
			assert.equal(
				await accentColor(page),
				classic,
				"Invalid draft must not change the active palette",
			);
			await lightInput.fill("#f37ea8");
			await darkInput.fill("#b799e8");
			await page.getByRole("button", { name: "Save custom palette" }).click();
			await page
				.getByRole("status")
				.filter({ hasText: "Custom palette saved in this browser." })
				.waitFor();
			const expected = dark ? "rgb(183, 153, 232)" : "rgb(243, 126, 168)";
			assert.equal(await accentColor(page), expected);
			assert.deepEqual(
				await chartColors(page),
				baseline,
				"Custom colors cannot mutate chart colors",
			);
			const preference = await page.evaluate(
				(key) => JSON.parse(localStorage.getItem(key) ?? "null"),
				STORAGE_KEY,
			);
			assert.equal(preference.version, 1);
			assert.equal(preference.mode, "custom");
			assert.equal(Object.keys(preference.colors).length, 12);
			await page.reload();
			await page.locator("[data-accent-choice]").first().waitFor();
			assert.equal(await accentColor(page), expected, "Custom palette must survive refresh");
			await page.goto(`${baseUrl}/ui/button`);
			await page.locator('[data-status="ready"]').waitFor();
			const appliedToken = await page.evaluate(() =>
				document.documentElement.style.getPropertyValue("--basalt-accent-1"),
			);
			assert.ok(appliedToken, "Custom accent tokens must follow navigation");
			await page.goto(`${baseUrl}/palette`);
			await page.locator("[data-accent-choice]").first().waitFor();
			assert.equal(await accentColor(page), expected);
			await editPalette(page);
			assert.equal(await lightInput.inputValue(), "#f37ea8");
			assert.equal(await darkInput.inputValue(), "#b799e8");
			await assertPageWidth(page, `${width}/${theme} palette editor`);
			await page.getByRole("button", { name: "Restore classic palette" }).click();
			assert.equal(await accentColor(page), classic);
			assert.equal(
				await lightInput.inputValue(),
				"#f37ea8",
				"Restore classic must retain the saved custom draft",
			);
			assert.deepEqual(await chartColors(page), baseline);
			for (const value of [0, 64, 100]) {
				const graphic = page.getByRole("application", {
					name: `Ring tracks ${value}%`,
					exact: true,
				});
				await graphic.waitFor();
				const container = page.locator("[data-palette-rings] > div").filter({ has: graphic });
				const evidence = await assertGaugeAppearance(container, value);
				trackColors[theme] = evidence.fill;
				assert.ok((await container.textContent())?.includes(`${value}%`));
			}
			// ResponsiveContainer debounces resize by 150ms; its SVG can precede the curves.
			await page.locator(".recharts-line-curve").nth(2).waitFor();
			await page.locator(".recharts-pie-sector .recharts-sector").nth(4).waitFor();
			await assertTextContrast(
				page,
				'[data-testid="chart-legend"] span, .recharts-cartesian-axis-tick-value, [data-palette-rings] .absolute',
				`${theme} palette chart text`,
			);
			const marks = [
				...(await measureChartContrast(page, ".recharts-line-curve", "stroke")),
				...(await measureChartContrast(page, ".recharts-pie-sector .recharts-sector", "fill")),
			];
			assert.ok(marks.length >= 8, "Palette must render all five pie colors and three line colors");
			for (const mark of marks) {
				assert.ok(
					baseline.includes(mark.color),
					`Chart mark escaped the fixed palette: ${mark.color}`,
				);
				// The requested raw candy fills can be below 3:1 on light surfaces.
				// Measure them honestly; do not darken them or add contrasting outlines.
				minimumMarkContrast = Math.min(minimumMarkContrast, mark.ratio);
				if (dark) {
					assert.ok(mark.ratio >= 3, `Dark chart mark contrast below 3:1: ${JSON.stringify(mark)}`);
					minimumDarkMarkContrast = Math.min(minimumDarkMarkContrast, mark.ratio);
				}
			}
			solidMarks += await assertSolidMarks(page, `palette/${width}/${theme}`);
			cases.push(`${width}/${theme}:palette/invalid/save/reload/navigation/restore/rings`);
			for (const entry of chartPages) {
				console.log(`Chart appearance ${width}/${theme} ${entry.slug}`);
				await page.goto(`${baseUrl}/ui/${entry.slug}`);
				await page.locator('[data-status="ready"]').waitFor();
				await setShowcaseTheme(page, dark);
				await page.locator("[data-hero-scenario]").waitFor();
				if (SVG_CHARTS.has(entry.slug)) {
					await page.locator("[data-hero-scenario] svg.recharts-surface").first().waitFor();
					await page
						.locator("[data-hero-scenario]")
						.locator(MARK_SELECTOR)
						.filter({ visible: true })
						.first()
						.waitFor();
				}
				await page.evaluate(
					() =>
						new Promise<void>((resolve) =>
							requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
						),
				);
				const plots = await page.locator("svg.recharts-surface").evaluateAll((nodes) =>
					nodes.map((node) => {
						const box = node.getBoundingClientRect();
						return { width: box.width, height: box.height };
					}),
				);
				for (const plot of plots)
					assert.ok(plot.width > 0 && plot.height > 0, `${entry.slug}: collapsed chart`);
				const markCount = await assertSolidMarks(page, `${entry.slug}/${width}/${theme}`);
				if (SVG_CHARTS.has(entry.slug))
					assert.ok(markCount > 0, `${entry.slug}: chart marks must actually be checked`);
				solidMarks += markCount;
				const measurements = await assertTextContrast(
					page,
					TEXT_SELECTOR,
					`${entry.slug}/${theme}`,
				);
				textPairs += measurements.length;
				for (const item of measurements)
					minimumTextContrast = Math.min(minimumTextContrast, item.ratio);
				await assertPageWidth(page, `${entry.slug}/${width}/${theme}`);
				const interactive = page
					.locator('[data-hero-scenario] svg.recharts-surface[tabindex="0"]')
					.first();
				const hoverSelector = HOVER_TOOLTIPS[entry.slug];
				if (KEYBOARD_TOOLTIPS.has(entry.slug)) {
					await interactive.focus();
					await page.keyboard.press("ArrowRight");
				} else if (hoverSelector) {
					const mark = page.locator(`[data-hero-scenario] ${hoverSelector}`).first();
					await mark.scrollIntoViewIfNeeded();
					if (entry.slug === "donut") {
						const point = await mark.evaluate((node) => {
							const path = node as SVGPathElement;
							const point = path.getPointAtLength(path.getTotalLength() * 0.2);
							const matrix = path.getScreenCTM();
							if (!matrix) throw new Error("Pie sector has no screen geometry");
							return {
								x: point.x * matrix.a + point.y * matrix.c + matrix.e,
								y: point.x * matrix.b + point.y * matrix.d + matrix.f,
							};
						});
						await page.mouse.move(point.x, point.y);
					} else await mark.hover();
				}
				if (KEYBOARD_TOOLTIPS.has(entry.slug) || hoverSelector) {
					await page
						.locator('[data-testid="chart-tooltip"]')
						.filter({ visible: true })
						.first()
						.waitFor();
					const tooltipText = await assertTextContrast(
						page,
						'.recharts-tooltip-wrapper [data-testid="chart-tooltip"] span:not([aria-hidden]), .recharts-tooltip-wrapper [data-testid="chart-tooltip"] p',
						`${entry.slug}/${theme} tooltip`,
					);
					assert.ok(tooltipText.length > 0, `${entry.slug}: tooltip text must be measured`);
					tooltipCases++;
					textPairs += tooltipText.length;
					for (const item of tooltipText)
						minimumTextContrast = Math.min(minimumTextContrast, item.ratio);
					await page.keyboard.press("Escape");
				}
				if (entry.slug === "timeline") {
					const rail = page.locator('[data-hero-scenario] ol[aria-label="Timeline"] li');
					const before = await rail.evaluateAll((nodes) =>
						nodes.map((node) => getComputedStyle(node).borderLeftColor),
					);
					assert.equal(before.length, 24);
					await page.evaluate(() => {
						localStorage.setItem("basalt-accent", "rose");
						window.dispatchEvent(
							new StorageEvent("storage", {
								key: "basalt-accent",
								newValue: "rose",
								storageArea: localStorage,
							}),
						);
					});
					await page.waitForFunction(() => document.documentElement.dataset.accent === "rose");
					assert.deepEqual(
						await rail.evaluateAll((nodes) =>
							nodes.map((node) => getComputedStyle(node).borderLeftColor),
						),
						before,
						"Timeline rails must not follow the control accent",
					);
				}
				cases.push(`${width}/${theme}:chart/${entry.slug}`);
			}
		}
	assert.notEqual(
		trackColors.light,
		trackColors.dark,
		"Gauge track must adapt to the active theme",
	);
	assert.ok(
		textPairs > 100 && Number.isFinite(minimumTextContrast),
		"Chart text must actually be measured",
	);
	assert.equal(tooltipCases, 4 * (KEYBOARD_TOOLTIPS.size + Object.keys(HOVER_TOOLTIPS).length));
	await assertPaletteStorage(page, baseUrl);
	return {
		cases,
		chartPages: chartPages.length,
		textPairs,
		minimumTextContrast,
		minimumMarkContrast,
		minimumDarkMarkContrast,
		solidMarks,
		tooltipCases,
		trackColors,
		storage: "cross-tab, malformed data, denied read/write",
	};
}

async function assertPaletteStorage(page: Page, baseUrl: string) {
	await page.goto(`${baseUrl}/palette`);
	await setShowcaseTheme(page, false);
	await page.locator('[data-accent-choice="primary"]').click();
	const peer = await page.context().newPage();
	const peerFaults = attachPageFaults(peer);
	try {
		await peer.goto(`${baseUrl}/palette`);
		await peer.locator("[data-accent-choice]").first().waitFor();
		await editPalette(page);
		await page.getByRole("textbox", { name: "Blue · Light", exact: true }).fill("#55bb99");
		await page.getByRole("button", { name: "Save custom palette" }).click();
		await peer.waitForFunction(
			() =>
				getComputedStyle(document.querySelector('[data-accent-swatch="primary"]') as Element)
					.backgroundColor === "rgb(85, 187, 153)",
		);
		await peer.getByRole("button", { name: "Restore classic palette" }).click();
		await page.getByRole("button", { name: "Restore classic palette" }).waitFor();
		await page.waitForFunction(
			() =>
				[...document.querySelectorAll("button")].find(
					(button) => button.textContent?.trim() === "Restore classic palette",
				)?.disabled === true,
		);
		assert.equal(
			await page.getByRole("button", { name: "Restore classic palette" }).isDisabled(),
			true,
			"Restore must synchronize to the other tab",
		);
		await peer.evaluate(
			(key) => localStorage.setItem(key, '{"version":1,"mode":"custom","colors":{}}'),
			STORAGE_KEY,
		);
		await page.reload();
		await page.locator("[data-accent-choice]").first().waitFor();
		assert.equal(
			await page.getByRole("button", { name: "Restore classic palette" }).isDisabled(),
			true,
			"Corrupt preferences must fall back to classic",
		);
		assertNoPageFaults(peerFaults);
	} finally {
		await peer.close();
	}
	for (const denial of ["write", "read-write"]) {
		const denied = await page.context().newPage();
		const faults = attachPageFaults(denied);
		try {
			await denied.addInitScript((denial) => {
				if (denial === "read-write")
					Object.defineProperty(window, "localStorage", {
						get() {
							throw new DOMException("Storage unavailable", "SecurityError");
						},
					});
				else {
					const setItem = Storage.prototype.setItem;
					Storage.prototype.setItem = function (key, value) {
						if (key === "basalt-palette-v1")
							throw new DOMException("Storage full", "QuotaExceededError");
						return setItem.call(this, key, value);
					};
				}
			}, denial);
			await denied.goto(`${baseUrl}/palette`);
			await denied.locator("[data-accent-choice]").first().waitFor();
			await editPalette(denied);
			await denied.getByRole("textbox", { name: "Blue · Light", exact: true }).fill("#cc88ee");
			await denied.getByRole("textbox", { name: "Blue · Dark", exact: true }).fill("#cc88ee");
			await denied.getByRole("button", { name: "Save custom palette" }).click();
			await denied
				.getByRole("status")
				.filter({ hasText: "Browser storage is unavailable." })
				.waitFor();
			assert.equal(await accentColor(denied), "rgb(204, 136, 238)");
			assertNoPageFaults(faults);
		} finally {
			await denied.close();
		}
	}
}
