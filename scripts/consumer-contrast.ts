import assert from "node:assert/strict";
import type { Page } from "playwright";

type SampleMeasurement = {
	surface: string;
	sample: string;
	ratio: number;
	color: string;
	background: number[];
	pass: boolean;
};

type ContrastGateResult = {
	totalPairs: number;
	passedPairs: number;
	focusCases: number;
	passedFocus: number;
};

declare global {
	interface Window {
		measureSamples: (selector?: string) => SampleMeasurement[];
		waitForTransitionsSettled: () => Promise<void>;
	}
}

/**
 * Validates WCAG 4.5:1 text/control contrast across representative surfaces and themes.
 * Uses real computed styles and RGBA alpha-compositing to measure painted contrast.
 */
export async function assertConsumerContrast(page: Page): Promise<ContrastGateResult> {
	await page.waitForSelector("#contrast-status[data-ready='true']", { state: "visible" });

	await page.evaluate(() => {
		window.waitForTransitionsSettled = async () => {
			await new Promise<void>((resolve) => {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => resolve());
				});
			});
			const animations = document.getAnimations();
			if (animations.length > 0) {
				await Promise.allSettled(animations.map((a) => a.finished));
			}
		};

		window.measureSamples = (selector = "[data-sample]") => {
			const canvas = document.createElement("canvas");
			canvas.width = canvas.height = 1;
			const ctx = canvas.getContext("2d", { willReadFrequently: true });
			if (!ctx) throw new Error("canvas context unavailable");

			const rgba = (color: string) => {
				ctx.clearRect(0, 0, 1, 1);
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, 1, 1);
				return [...ctx.getImageData(0, 0, 1, 1).data].map((n, i) => (i === 3 ? n / 255 : n));
			};

			const over = (top: number[], bottom: number[]) =>
				top.slice(0, 3).map((x, i) => x * top[3] + bottom[i] * (1 - top[3]));

			const lum = (rgb: number[]) =>
				rgb
					.map((n) => n / 255)
					.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
					.reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);

			return [...document.querySelectorAll<HTMLElement>(selector)].map((node) => {
				const chain: HTMLElement[] = [];
				for (let n: HTMLElement | null = node; n; n = n.parentElement) chain.unshift(n);
				let background = [255, 255, 255];
				let opacity = 1;
				for (const n of chain) {
					const style = getComputedStyle(n);
					background = over(rgba(style.backgroundColor), background);
					opacity *= Number(style.opacity);
				}
				const style = getComputedStyle(node);
				const foreground = rgba(style.color);
				foreground[3] *= opacity;
				const painted = over(foreground, background);
				const a = lum(painted);
				const b = lum(background);
				const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
				return {
					surface: node.closest<HTMLElement>("[data-surface]")?.dataset.surface ?? "unknown",
					sample: node.dataset.sample ?? "unknown",
					ratio,
					color: style.color,
					background,
					pass: ratio >= 4.5,
				};
			});
		};
	});

	const themes: Array<"light" | "dark"> = ["light", "dark"];
	const accents = await page
		.locator("#select-accent option")
		.evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));
	assert.equal(
		accents.length,
		13,
		"All twelve accents plus the legacy steel migration must be exercised",
	);
	assert.equal(new Set(accents).size, 13);

	let totalPairs = 0;
	let passedPairs = 0;
	let focusCases = 0;
	let passedFocus = 0;

	for (const theme of themes) {
		// Set OS color-scheme to opposite to ensure the controlled theme applies correctly
		const oppositeScheme = theme === "light" ? "dark" : "light";
		await page.emulateMedia({ colorScheme: oppositeScheme });

		await page.selectOption("#select-theme", theme);

		for (const accent of accents) {
			await page.selectOption("#select-accent", accent);

			// Wait for theme class & data-accent on root
			await page.waitForFunction(
				({ t, a }) => {
					const root = document.documentElement;
					return (
						root.classList.contains(t) &&
						root.dataset.mode === t &&
						!root.classList.contains(t === "light" ? "dark" : "light") &&
						root.dataset.accent === a &&
						document.getElementById("contrast-status")?.textContent?.includes(`${t}/${a}`)
					);
				},
				{ t: theme, a: accent === "steel" ? "primary" : accent },
			);

			await page.mouse.move(0, 0);
			await page.evaluate(() => window.waitForTransitionsSettled());
			await page.waitForTimeout(50);

			// Measure default state text pairs (84 samples across 4 surfaces)
			const regularSamples = await page.evaluate((): SampleMeasurement[] =>
				window.measureSamples(),
			);
			assert.equal(
				regularSamples.length,
				84,
				`Expected exactly 84 regular contrast samples for ${theme}/${accent}`,
			);

			for (const s of regularSamples) {
				totalPairs++;
				if (s.pass) {
					passedPairs++;
				} else {
					assert.fail(
						`Contrast failure: theme=${theme} accent=${accent} surface=${s.surface} sample=${s.sample} ratio=${s.ratio.toFixed(2)} (color=${s.color})`,
					);
				}
			}

			// Hover measurements for primary & destructive on background & bright surfaces
			for (const surface of ["background", "bright"]) {
				for (const sample of ["primary", "destructive"]) {
					const selector = `[data-surface="${surface}"] [data-sample="${sample}"]`;
					await page.locator(selector).hover();

					// Wait for transition/state color to settle
					await page.evaluate(() => window.waitForTransitionsSettled());
					await page.waitForTimeout(50);

					const hoverSamples = await page.evaluate(
						(sel): SampleMeasurement[] => window.measureSamples(sel),
						selector,
					);
					assert.equal(
						hoverSamples.length,
						1,
						`Expected exactly 1 hover sample for ${selector} in ${theme}/${accent}`,
					);

					for (const s of hoverSamples) {
						totalPairs++;
						if (s.pass) {
							passedPairs++;
						} else {
							assert.fail(
								`Hover contrast failure: theme=${theme} accent=${accent} surface=${s.surface} sample=${s.sample} ratio=${s.ratio.toFixed(2)} (color=${s.color})`,
							);
						}
					}
				}

				// Keyboard focus visibility check on primary button
				await page.locator(`[data-surface="${surface}"] [data-focus-start="${surface}"]`).focus();
				await page.keyboard.press("Tab");

				const focus = await page
					.locator(`[data-surface="${surface}"] [data-sample="primary"]`)
					.evaluate((node) => ({
						focused: document.activeElement === node,
						visible: node.matches(":focus-visible"),
						shadow: getComputedStyle(node).boxShadow,
						outline: getComputedStyle(node).outlineStyle,
					}));

				focusCases++;
				const isFocusVisible =
					focus.focused &&
					focus.visible &&
					(focus.shadow !== "none" || !["none", "hidden"].includes(focus.outline));

				if (isFocusVisible) {
					passedFocus++;
				} else {
					assert.fail(
						`Focus visibility failure: theme=${theme} accent=${accent} surface=${surface} details=${JSON.stringify(focus)}`,
					);
				}
			}

			await page.mouse.move(0, 0);
		}
	}

	assert.equal(
		totalPairs,
		2288,
		"Must measure exactly 2,288 contrast pairs (88 × 2 themes × 13 accents)",
	);
	assert.equal(passedPairs, 2288, "All 2,288 contrast pairs must meet WCAG 4.5:1");
	assert.equal(
		focusCases,
		52,
		"Must test exactly 52 keyboard focus cases (2 surfaces × 2 themes × 13 accents)",
	);
	assert.equal(passedFocus, 52, "All 52 focus tests must pass");

	return {
		totalPairs,
		passedPairs,
		focusCases,
		passedFocus,
	};
}
