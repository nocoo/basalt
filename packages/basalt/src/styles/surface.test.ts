import { readFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const tokens = readFileSync(path.join("packages/basalt/src/styles/tokens.css"), "utf8");
const tailwind = readFileSync(path.join("packages/basalt/src/styles/tailwind.css"), "utf8");

describe("nested surface CSS", () => {
	it("raises neutral selection above every surface without sacrificing text contrast", () => {
		const css = postcss.parse(tokens);
		for (const selector of ['[data-mode="light"]', '[data-mode="dark"]']) {
			const values = new Map<string, string>();
			css.walkRules((rule) => {
				if (rule.selectors.includes(selector))
					rule.walkDecls((declaration) => {
						values.set(declaration.prop, declaration.value);
					});
			});
			const luminance = (name: string): number => {
				const value = values.get(`--basalt-${name}`) ?? "";
				const alias = /^var\(--basalt-(.+)\)$/.exec(value);
				if (alias) return luminance(alias[1]);
				const [hue, saturation, lightness] = value.match(/[\d.]+/g)?.map(Number) ?? [];
				const light = lightness / 100;
				const amplitude = (saturation / 100) * Math.min(light, 1 - light);
				return [0, 8, 4].reduce((sum, offset, index) => {
					const step = (offset + hue / 30) % 12;
					const channel = light - amplitude * Math.max(-1, Math.min(step - 3, 9 - step, 1));
					const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
					return sum + linear * [0.2126, 0.7152, 0.0722][index];
				}, 0);
			};
			const selected = luminance("selected");
			for (const surface of ["background", "card", "secondary", "bright", "popover"]) {
				expect(selected).toBeGreaterThanOrEqual(luminance(surface));
				expect(luminance("hover")).toBeGreaterThanOrEqual(luminance(surface));
			}
			for (const foreground of ["selected-foreground", "muted-foreground"]) {
				const text = luminance(foreground);
				expect(
					(Math.max(text, selected) + 0.05) / (Math.min(text, selected) + 0.05),
				).toBeGreaterThanOrEqual(4.5);
			}
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
	it("defaults control and zebra fills on the document", () => {
		expect(tokens).toContain("--basalt-control-fill: hsl(var(--basalt-secondary));");
		expect(tokens).toContain("--basalt-zebra-fill: hsl(var(--basalt-bright));");
	});

	it("paints nested surfaces with descendant selectors and no @scope", () => {
		expect(tokens).toContain("[data-basalt-surface-root]");
		expect(tokens).toContain("[data-basalt-surface-root] [data-basalt-surface]");
		expect(tokens).toContain(
			"[data-basalt-surface]:not([data-basalt-surface-root] *):not([data-basalt-surface] *)",
		);
		expect(tokens).not.toContain("@scope");
	});

	it("stripes tables from the inherited zebra fill", () => {
		expect(tokens).toContain("[data-basalt-table] tbody tr:nth-child(even)");
		expect(tokens).toContain(":not(:hover)");
		expect(tokens).toContain('tr[aria-selected="true"] td');
	});

	it("exposes the control fill to Tailwind", () => {
		expect(tailwind).toContain("--color-basalt-control: var(--basalt-control-fill);");
	});

	it("keeps solid color badge foreground tokens white", () => {
		expect(tokens.match(/--basalt-badge-green-foreground: 0 0% 100%;/g)).toHaveLength(2);
		expect(tokens.match(/--basalt-badge-teal-foreground: 0 0% 100%;/g)).toHaveLength(2);
		expect(tokens.match(/--basalt-badge-purple-foreground: 0 0% 100%;/g)).toHaveLength(2);
		expect(tokens).not.toContain("--basalt-badge-green-foreground: 0 0% 10%");
	});
});
