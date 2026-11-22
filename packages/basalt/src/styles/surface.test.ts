import { readFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const tokens = readFileSync(path.join("packages/basalt/src/styles/tokens.css"), "utf8");
const base = readFileSync(path.join("packages/basalt/src/styles/base.css"), "utf8");
const standalone = readFileSync(path.join("packages/basalt/src/styles/standalone.css"), "utf8");
const tailwind = readFileSync(path.join("packages/basalt/src/styles/tailwind.css"), "utf8");
const themeSelectors = ['[data-mode="light"]', '[data-mode="dark"]'];

function tokenValues(selector: string) {
	const values = new Map<string, string>();
	postcss.parse(tokens).walkRules((rule) => {
		if (rule.selectors.map((entry) => entry.replace(/\s+/g, " ")).includes(selector))
			rule.walkDecls((declaration) => {
				values.set(declaration.prop, declaration.value);
			});
	});
	return values;
}

function hslaChannels(values: Map<string, string>, name: string): [number, number, number, number] {
	const value = values.get(`--basalt-${name}`) ?? "";
	const alias = /^var\(--basalt-(.+)\)$/.exec(value);
	if (alias) return hslaChannels(values, alias[1]);
	const [colorPart, alphaPart] = value.split("/").map((part) => part.trim());
	const [hue, saturation, lightness] = colorPart.match(/[\d.]+/g)?.map(Number) ?? [];
	const alpha = alphaPart ? Number(alphaPart) : 1;
	const light = lightness / 100;
	const amplitude = (saturation / 100) * Math.min(light, 1 - light);
	const rgb = [0, 8, 4].map((offset) => {
		const step = (offset + hue / 30) % 12;
		return light - amplitude * Math.max(-1, Math.min(step - 3, 9 - step, 1));
	});
	return [rgb[0], rgb[1], rgb[2], alpha];
}

function rgbLuminance(rgb: readonly [number, number, number]): number {
	return rgb.reduce((sum, channel, index) => {
		const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
		return sum + linear * [0.2126, 0.7152, 0.0722][index];
	}, 0);
}

function luminance(values: Map<string, string>, name: string): number {
	const [r, g, b] = hslaChannels(values, name);
	return rgbLuminance([r, g, b]);
}

function compositeOver(
	values: Map<string, string>,
	fill: string,
	surface: string,
): [number, number, number] {
	const [fr, fg, fb, alpha] = hslaChannels(values, fill);
	const [sr, sg, sb] = hslaChannels(values, surface);
	return [
		fr * alpha + sr * (1 - alpha),
		fg * alpha + sg * (1 - alpha),
		fb * alpha + sb * (1 - alpha),
	];
}

function contrastRgb(
	aRgb: readonly [number, number, number],
	bRgb: readonly [number, number, number],
) {
	const a = rgbLuminance(aRgb);
	const b = rgbLuminance(bRgb);
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function contrast(values: Map<string, string>, fill: string, foreground: string) {
	const [fr, fg, fb] = hslaChannels(values, fill);
	const [tr, tg, tb] = hslaChannels(values, foreground);
	return contrastRgb([fr, fg, fb], [tr, tg, tb]);
}

describe("nested surface CSS", () => {
	it("contrasts neutral selection with every container while keeping readable text", () => {
		for (const selector of themeSelectors) {
			const values = tokenValues(selector);
			const isLight = selector.includes("light");
			for (const surface of ["background", "card", "secondary", "bright", "popover"]) {
				const composite = compositeOver(values, "selected", surface);
				const compositeLum = rgbLuminance(composite);
				const surfaceLum = luminance(values, surface);
				if (isLight) {
					expect(compositeLum, `${selector} on ${surface}`).toBeLessThan(surfaceLum);
				} else {
					expect(compositeLum, `${selector} on ${surface}`).toBeGreaterThan(surfaceLum);
				}
				for (const foreground of ["selected-foreground", "muted-foreground"]) {
					const [tr, tg, tb] = hslaChannels(values, foreground);
					expect(
						contrastRgb(composite, [tr, tg, tb]),
						`${selector} ${foreground} on ${surface}`,
					).toBeGreaterThanOrEqual(4.5);
				}
			}
		}
	});

	it("uses neutral foreground-tinted matte hover in both themes", () => {
		for (const [selector, weight] of [
			['[data-mode="light"]', "4%"],
			['[data-mode="dark"]', "6%"],
		] as const) {
			const values = tokenValues(selector);
			expect(values.get("--basalt-hover-weight")).toBe(weight);
			expect(values.get("--basalt-hover")?.replace(/\s+/g, "")).toBe(
				"hsl(var(--basalt-foreground)/var(--basalt-hover-weight))",
			);
		}
		for (const selector of [".basalt-hover-list::before", ".basalt-command-list::before"]) {
			expect(tokenValues(selector).get("background")).toBe("var(--basalt-hover)");
		}
		expect(tokenValues(".basalt-hover-list::before").get("border-radius")).toBe(
			"var(--basalt-hover-radius, var(--basalt-radius-md))",
		);
		expect(tokenValues(".basalt-command-list::before").get("border-radius")).toBe(
			"var(--basalt-radius-sm)",
		);
		expect(tokens).not.toContain("will-change: transform");
		expect(tokens).not.toContain("--basalt-hover-end");
		expect(tokens).not.toContain("--basalt-surface-elevated");
		expect(tailwind).toContain("--color-basalt-hover: var(--basalt-hover);");
	});

	it("keeps the first eight numbered chart series distinct in both themes", () => {
		for (const selector of themeSelectors) {
			const values = tokenValues(selector);
			const colors = Array.from({ length: 24 }, (_, index) => {
				const value = values.get(`--basalt-chart-${index + 1}`) ?? "";
				const alias = /^var\((--basalt-chart-[\w-]+)\)$/.exec(value);
				return alias ? values.get(alias[1]) : value;
			});
			expect(colors).not.toContain("");
			expect(colors).not.toContain(undefined);
			expect(new Set(colors.slice(0, 8)).size).toBe(8);
			expect(new Set(colors).size).toBe(24);
		}
	});

	it("retains selected paint independently of moving hover and keeps semantic diffs", () => {
		expect(tokens).toContain('.basalt-nav-item:not([data-hover-selected="true"])');
		expect(tokens).toContain("background-color: hsl(var(--basalt-selected));");
		expect(tokens).toContain("box-shadow: var(--basalt-selected-edge);");
		expect(tokens).not.toContain("--basalt-selected-border");
		expect(tokens).not.toContain("--basalt-selected-indicator");
		let selectedEdgeCount = 0;
		let resetShadowCount = 0;
		postcss.parse(tokens).walkRules((rule) => {
			if (rule.selector.includes("selected") || rule.selector.includes(".basalt-choice")) {
				expect(rule.selector).not.toMatch(/::(?:before|after)/);
				rule.walkDecls((declaration) => {
					if (declaration.prop === "box-shadow") {
						if (declaration.value === "var(--basalt-selected-edge)") selectedEdgeCount++;
						else if (declaration.value === "none") resetShadowCount++;
						else expect.fail(`Unexpected box-shadow on ${rule.selector}: ${declaration.value}`);
					} else {
						expect(declaration.prop).not.toMatch(/^(?:border|outline)/);
					}
				});
			}
			if ([".basalt-hover-list::before", ".basalt-command-list::before"].includes(rule.selector)) {
				rule.walkDecls((declaration) => {
					expect(declaration.prop).not.toMatch(/^(?:border(?:-|$)(?!radius)|box-shadow)/);
				});
			}
		});
		expect(selectedEdgeCount).toBe(1);
		expect(resetShadowCount).toBe(1);
		expect(tokens).toContain("background: hsl(var(--basalt-danger-tint));");
		expect(tokens).toContain("background: hsl(var(--basalt-info-tint));");
		expect(tailwind).toContain("--color-basalt-selected: hsl(var(--basalt-selected));");
	});
	it("raises control fills above their parent root and card surfaces", () => {
		for (const selector of [...themeSelectors, "[data-basalt-surface-root]"]) {
			expect(tokenValues(selector).get("--basalt-control-fill")).toBe(
				"hsl(var(--basalt-secondary))",
			);
		}
		for (const selector of [
			"[data-basalt-surface-root] [data-basalt-surface]",
			"[data-basalt-surface]:not([data-basalt-surface-root] *):not([data-basalt-surface] *)",
			"[data-basalt-surface]:not([data-basalt-surface-root] *) [data-basalt-surface]",
		]) {
			expect(tokenValues(selector).get("--basalt-control-fill")).toBe("hsl(var(--basalt-bright))");
		}
		expect(tokenValues("[data-basalt-surface-root]").get("--basalt-surface-current")).toBe(
			"var(--basalt-card)",
		);
		expect(
			tokenValues("[data-basalt-surface-root] [data-basalt-surface]").get(
				"--basalt-surface-current",
			),
		).toBe("var(--basalt-secondary)");
	});

	it("preserves ascending surface luminance and floating/well surface roles in both themes", () => {
		const lightValues = tokenValues('[data-mode="light"]');
		const lightL0 = luminance(lightValues, "background");
		const lightL1 = luminance(lightValues, "card");
		const lightL2 = luminance(lightValues, "secondary");
		const lightBright = luminance(lightValues, "bright");
		const lightPopover = luminance(lightValues, "popover");
		expect(lightL0, '[data-mode="light"] L0 < L1').toBeLessThan(lightL1);
		expect(lightL1, '[data-mode="light"] L1 < L2').toBeLessThan(lightL2);
		expect(lightL2).toBe(lightBright);
		expect(lightL2).toBe(lightPopover);
		expect(lightValues.get("--basalt-secondary")).toBe("0 0% 100%");

		const darkValues = tokenValues('[data-mode="dark"]');
		const darkL0 = luminance(darkValues, "background");
		const darkL1 = luminance(darkValues, "card");
		const darkL2 = luminance(darkValues, "secondary");
		const darkL3 = luminance(darkValues, "bright");
		const darkPopover = luminance(darkValues, "popover");
		expect(darkL0, '[data-mode="dark"] L0 < L1').toBeLessThan(darkL1);
		expect(darkL1, '[data-mode="dark"] L1 < L2').toBeLessThan(darkL2);
		expect(darkL2, '[data-mode="dark"] L2 < L3').toBeLessThan(darkL3);
		expect(darkL3, '[data-mode="dark"] L3 < Popover').toBeLessThan(darkPopover);

		const floatingRoot = tokenValues("[data-basalt-surface-root][data-basalt-floating]");
		expect(floatingRoot.get("background")).toBe("hsl(var(--basalt-popover))");
		expect(floatingRoot.get("--basalt-surface-current")).toBe("var(--basalt-popover)");
		expect(floatingRoot.get("--basalt-control-fill")).toBe("hsl(var(--basalt-bright))");

		for (const selector of [
			'[data-basalt-surface-root] [data-basalt-surface] [data-slot="card-well"][data-basalt-surface]',
			'[data-basalt-surface]:not([data-basalt-surface-root] *) [data-basalt-surface] [data-slot="card-well"][data-basalt-surface]',
		]) {
			const wellRule = tokenValues(selector);
			expect(wellRule.get("background")).toBe("hsl(var(--basalt-card))");
			expect(wellRule.get("--basalt-surface-current")).toBe("var(--basalt-card)");
			expect(wellRule.get("--basalt-control-fill")).toBe("hsl(var(--basalt-bright))");
		}
		expect(lightValues.get("--basalt-well")).toBe("hsl(var(--basalt-foreground) / 0.065)");
		expect(darkValues.get("--basalt-well")).toBe("hsl(var(--basalt-foreground) / 0.1)");
		expect(lightValues.get("--basalt-meter-track-fill")).toBe("var(--basalt-well)");
		expect(darkValues.get("--basalt-meter-track-fill")).toBe("var(--basalt-well)");
		expect(lightValues.get("--basalt-shadow-knob")?.trim().length).toBeGreaterThan(0);
		expect(darkValues.get("--basalt-shadow-knob")?.trim().length).toBeGreaterThan(0);
	});

	it("paints nested surfaces with descendant selectors and no @scope", () => {
		expect(tokens).toContain("[data-basalt-surface-root]");
		expect(tokens).toContain("[data-basalt-surface-root] [data-basalt-surface]");
		expect(tokens).toContain(
			"[data-basalt-surface]:not([data-basalt-surface-root] *):not([data-basalt-surface] *)",
		);
		expect(tokens).not.toContain("@scope");
		const boxShadowRules: string[] = [];
		postcss.parse(tokens).walkRules((rule) => {
			const normalized = rule.selectors.map((selector) => selector.replace(/\s+/g, " "));
			for (const selector of normalized) {
				if (selector.includes(":not([data-outlined])")) {
					let shadow = "";
					rule.walkDecls("box-shadow", (declaration) => {
						shadow = declaration.value;
					});
					if (shadow === "none") boxShadowRules.push(selector);
				}
			}
		});
		expect(boxShadowRules).toContain(
			"[data-basalt-surface-root] [data-basalt-surface] [data-basalt-surface] [data-basalt-surface]:not([data-outlined])",
		);
		expect(boxShadowRules).toContain(
			"[data-basalt-surface]:not([data-basalt-surface-root] *) [data-basalt-surface] [data-basalt-surface] [data-basalt-surface]:not([data-outlined])",
		);
	});

	it("opts into striping without covering hover or selection and adds default cell hairlines", () => {
		expect(
			tokenValues('[data-basalt-table][data-striped="true"] tbody tr:nth-child(even)').get(
				"background-color",
			),
		).toBe("hsl(var(--basalt-surface-current))");
		expect(tokens).not.toContain("[data-basalt-table] tbody tr:nth-child(even)");
		expect(
			tokenValues('[data-basalt-table] tbody tr[aria-selected="true"] td').get("background"),
		).toBe("hsl(var(--basalt-selected))");
		for (const selector of [
			"[data-basalt-table] tbody tr:not(:last-child)",
			"[data-basalt-table] tbody tr:not(:last-child) > td",
		]) {
			expect(tokenValues(selector).get("border-bottom")).toBe(
				"1px solid hsl(var(--basalt-border) / 0.5)",
			);
		}
	});

	it("aligns opted-in attached table edges with card insets", () => {
		for (const [edge, side] of [
			["first", "start"],
			["last", "end"],
		]) {
			expect(
				tokenValues(
					`[data-basalt-table-container][data-edge="attached"] :where(th, td):${edge}-child`,
				).get(`padding-inline-${side}`),
			).toBe("var(--basalt-space-card)");
		}
	});

	it("exposes the control fill and tone tokens to Tailwind", () => {
		expect(tailwind).toContain("--color-basalt-control: var(--basalt-control-fill);");
		expect(tailwind).toContain("--color-basalt-success: hsl(var(--basalt-success));");
		for (const selector of themeSelectors) {
			expect(tokenValues(selector).get("--basalt-success")).toMatch(/^\d+ \d+% \d+%$/);
		}
	});

	it("defines semantic elevation tokens without legacy tail shadows in both themes", () => {
		const elevationKeys = [
			"control",
			"solid",
			"card",
			"card-foot",
			"floating",
			"modal",
			"well",
		] as const;
		for (const selector of themeSelectors) {
			const values = tokenValues(selector);
			for (const key of elevationKeys) {
				expect(
					values.get(`--basalt-shadow-${key}`),
					`${selector} --basalt-shadow-${key}`,
				).toBeTruthy();
			}
			const cardShadow = values.get("--basalt-shadow-card")?.replace(/\s+/g, " ") ?? "";
			if (selector.includes("dark")) {
				expect(cardShadow, `${selector} top rim`).toContain("inset 0 1px 0 0");
			}
			expect(cardShadow).not.toContain("0 12px 30px -13px");
			expect(values.get("--basalt-shadow-card-foot")?.replace(/\s+/g, " ")).toContain(
				"inset 0 -1px 0 0",
			);
		}
		for (const key of ["control", "solid", "card", "floating", "modal", "well"]) {
			expect(tailwind).toContain(`--shadow-basalt-${key}: var(--basalt-shadow-${key});`);
		}
		expect(tokens).not.toContain("--basalt-meter-track-shadow");
		expect(tokens).toContain(
			'[data-basalt-surface] > [data-slot="card-well"]:last-child:not([data-outlined])',
		);
	});

	it("pairs every solid tone fill with a foreground above the 4.5:1 text threshold", () => {
		for (const selector of themeSelectors) {
			const values = tokenValues(selector);
			for (const [fill, foreground] of [
				["primary", "primary-foreground"],
				["success-solid", "success-solid-foreground"],
				["info-solid", "info-solid-foreground"],
				["warning-solid", "warning-solid-foreground"],
				["danger-solid", "danger-solid-foreground"],
			] as const) {
				expect(contrast(values, fill, foreground), `${selector} ${fill}`).toBeGreaterThanOrEqual(
					4.5,
				);
			}
		}
	});

	it("ensures every tone ink achieves 4.5:1 contrast over its tint and all neutral surfaces", () => {
		for (const selector of themeSelectors) {
			const values = tokenValues(selector);
			for (const tone of ["success", "info", "warning", "danger"] as const) {
				expect(
					contrast(values, `${tone}-tint`, tone),
					`${selector} ${tone} on ${tone}-tint`,
				).toBeGreaterThanOrEqual(4.5);
				for (const surface of ["background", "card", "secondary", "bright"] as const) {
					expect(
						contrast(values, surface, tone),
						`${selector} ${tone} on ${surface}`,
					).toBeGreaterThanOrEqual(4.5);
				}
			}
		}
	});

	it("sets native color-scheme, accent-color, accessible themed scrollbars, and disables code ligatures", () => {
		expect(tokenValues('[data-mode="light"]').get("color-scheme")).toBe("light");
		expect(tokenValues('[data-mode="dark"]').get("color-scheme")).toBe("dark");
		expect(tokenValues(":root").get("accent-color")).toBe("hsl(var(--basalt-primary))");
		for (const selector of themeSelectors) {
			const values = tokenValues(selector);
			for (const surface of ["background", "card", "secondary"] as const) {
				expect(
					contrast(values, surface, "scrollbar-thumb"),
					`${selector} scrollbar-thumb on ${surface}`,
				).toBeGreaterThanOrEqual(3);
			}
		}
		for (const sheet of [base, standalone]) {
			expect(sheet).toContain("font-variant-ligatures: none");
			expect(sheet).toContain("scrollbar-color: hsl(var(--basalt-scrollbar-thumb)) transparent");
			expect(sheet).toContain("prefers-contrast: more");
			expect(sheet).toContain("scrollbar-color: hsl(var(--basalt-foreground)) transparent");
			expect(sheet).not.toContain("scrollbar-width: thin");
		}
	});
});
