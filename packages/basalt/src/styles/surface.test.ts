import { readFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const tokens = readFileSync(path.join("packages/basalt/src/styles/tokens.css"), "utf8");
const tailwind = readFileSync(path.join("packages/basalt/src/styles/tailwind.css"), "utf8");
const themeSelectors = ['[data-mode="light"]', '[data-mode="dark"]'];

function tokenValues(selector: string) {
	const values = new Map<string, string>();
	postcss.parse(tokens).walkRules((rule) => {
		if (rule.selectors.includes(selector))
			rule.walkDecls((declaration) => {
				values.set(declaration.prop, declaration.value);
			});
	});
	return values;
}

function luminance(values: Map<string, string>, name: string): number {
	const value = values.get(`--basalt-${name}`) ?? "";
	const alias = /^var\(--basalt-(.+)\)$/.exec(value);
	if (alias) return luminance(values, alias[1]);
	const [hue, saturation, lightness] = value.match(/[\d.]+/g)?.map(Number) ?? [];
	const light = lightness / 100;
	const amplitude = (saturation / 100) * Math.min(light, 1 - light);
	return [0, 8, 4].reduce((sum, offset, index) => {
		const step = (offset + hue / 30) % 12;
		const channel = light - amplitude * Math.max(-1, Math.min(step - 3, 9 - step, 1));
		const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
		return sum + linear * [0.2126, 0.7152, 0.0722][index];
	}, 0);
}

function contrast(values: Map<string, string>, fill: string, foreground: string) {
	const a = luminance(values, fill);
	const b = luminance(values, foreground);
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("nested surface CSS", () => {
	it("raises neutral selection above every surface without sacrificing text contrast", () => {
		for (const selector of themeSelectors) {
			const values = tokenValues(selector);
			const selected = luminance(values, "selected");
			for (const surface of ["background", "card", "secondary", "bright", "popover"]) {
				expect(selected).toBeGreaterThanOrEqual(luminance(values, surface));
			}
			for (const foreground of ["selected-foreground", "muted-foreground"]) {
				expect(contrast(values, "selected", foreground)).toBeGreaterThanOrEqual(4.5);
			}
		}
	});

	it("derives soft uniform matte hover from the configured primary in both themes", () => {
		for (const [selector, weight] of [
			['[data-mode="light"]', 18],
			['[data-mode="dark"]', 18],
		] as const) {
			expect(tokenValues(selector).get("--basalt-hover")?.replace(/\s+/g, "")).toBe(
				`color-mix(insrgb,hsl(var(--basalt-primary))${weight}%,hsl(var(--basalt-surface-elevated)))`,
			);
		}
		for (const selector of [".basalt-hover-list::before", ".basalt-command-list::before"]) {
			expect(tokenValues(selector).get("background")).toBe("var(--basalt-hover)");
		}
		expect(tokens).not.toContain("--basalt-hover-end");
		expect(tailwind).toContain("--color-basalt-hover: var(--basalt-hover);");
	});

	it("keeps the first eight numbered chart series distinct in both themes", () => {
		for (const selector of themeSelectors) {
			const values = tokenValues(selector);
			const colors = Array.from({ length: 8 }, (_, index) => {
				const value = values.get(`--basalt-chart-${index + 1}`) ?? "";
				const alias = /^var\((--basalt-chart-[\w-]+)\)$/.exec(value);
				return alias ? values.get(alias[1]) : value;
			});
			expect(colors).not.toContain("");
			expect(colors).not.toContain(undefined);
			expect(new Set(colors).size).toBe(8);
		}
	});

	it("retains selected paint independently of moving hover and keeps semantic diffs", () => {
		expect(tokens).toContain('.basalt-nav-item:not([data-hover-selected="true"])');
		expect(tokens).toContain("background-color: hsl(var(--basalt-selected));");
		expect(tokens).not.toContain("--basalt-selected-border");
		expect(tokens).not.toContain("--basalt-selected-indicator");
		postcss.parse(tokens).walkRules((rule) => {
			if (rule.selector.includes("selected") || rule.selector.includes(".basalt-choice")) {
				expect(rule.selector).not.toMatch(/::(?:before|after)/);
				rule.walkDecls((declaration) => {
					expect(declaration.prop).not.toMatch(/^(?:border|box-shadow|outline)/);
				});
			}
			if ([".basalt-hover-list::before", ".basalt-command-list::before"].includes(rule.selector)) {
				rule.walkDecls((declaration) => {
					expect(declaration.prop).not.toMatch(/^(?:border(?:-|$)(?!radius)|box-shadow)/);
				});
			}
		});
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

	it("paints nested surfaces with descendant selectors and no @scope", () => {
		expect(tokens).toContain("[data-basalt-surface-root]");
		expect(tokens).toContain("[data-basalt-surface-root] [data-basalt-surface]");
		expect(tokens).toContain(
			"[data-basalt-surface]:not([data-basalt-surface-root] *):not([data-basalt-surface] *)",
		);
		expect(tokens).not.toContain("@scope");
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

	it("exposes the control fill to Tailwind", () => {
		expect(tailwind).toContain("--color-basalt-control: var(--basalt-control-fill);");
		expect(tailwind).toContain("--color-basalt-success: var(--basalt-success);");
		for (const selector of themeSelectors) {
			expect(tokenValues(selector).get("--basalt-success")).toBe(
				"var(--basalt-tag-success-foreground)",
			);
		}
	});

	it("pairs every solid badge fill with a foreground above the 4.5:1 text threshold", () => {
		for (const selector of themeSelectors) {
			const values = tokenValues(selector);
			for (const [fill, foreground] of [
				["primary", "primary-foreground"],
				["destructive", "destructive-foreground"],
				["info", "info-foreground"],
				["warning", "warning-foreground"],
				["danger", "danger-foreground"],
				["badge-green", "badge-green-foreground"],
				["badge-teal", "badge-teal-foreground"],
				["badge-purple", "badge-purple-foreground"],
			] as const) {
				expect(contrast(values, fill, foreground), `${selector} ${fill}`).toBeGreaterThanOrEqual(
					4.5,
				);
			}
		}
	});
});
