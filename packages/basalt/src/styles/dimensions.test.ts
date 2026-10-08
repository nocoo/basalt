import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tokens = readFileSync("packages/basalt/src/styles/tokens.css", "utf8");
const tailwind = readFileSync("packages/basalt/src/styles/tailwind.css", "utf8");
const standalone = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");

describe("dimension token contract", () => {
	it("sizes default actions and borderless rows to 34px without enlarging body copy", () => {
		for (const css of [tokens, standalone]) {
			expect(css).toContain("--basalt-leading-action: calc(24 / 14)");
			expect(css).toContain("--basalt-line-row: 1.375rem");
			expect(css).toContain("--basalt-line-body: 1.25rem");
			expect(css).toContain("--basalt-size-menu-row: var(--basalt-size-control)");
		}
		expect(tailwind).toContain("--leading-basalt-row: var(--basalt-line-row)");
		for (const file of [
			"utils/navigation.ts",
			"components/overlay.ts",
			"components/approval-card.tsx",
			"components/tool-chips.tsx",
			"components/command-palette.tsx",
		]) {
			expect(readFileSync(`packages/basalt/src/${file}`, "utf8"), file).toContain(
				"leading-basalt-row",
			);
		}
		expect(tokens).toContain("--basalt-leading-action-sm: 1.5");
		expect(tokens).toContain("--basalt-leading-action-lg: 1.375");
	});
	it("ships axis-specific code scroll containment in standalone CSS", () => {
		for (const [axis, value] of [
			["x", "contain"],
			["y", "auto"],
		]) {
			const rule = standalone.match(
				new RegExp(`\\.overscroll-${axis}-${value} \\{([^}]+)\\}`),
			)?.[1];
			expect(rule).toContain(`overscroll-behavior-${axis}: ${value}`);
		}
	});
	it("uses four relative spacing steps and content-driven sizing", () => {
		for (const [name, value] of Object.entries({
			xs: "0.125rem",
			sm: "0.25rem",
			md: "0.375rem",
			lg: "0.5rem",
		})) {
			expect(tokens).toContain(`--basalt-space-${name}: ${value}`);
		}
		for (const role of ["action", "inline", "banner"]) {
			const block = tokens.match(new RegExp(`\\.basalt-${role} \\{([^}]+)\\}`))?.[1] ?? "";
			expect(block).toContain("line-height: var(--basalt-leading-");
			expect(block).not.toMatch(/(?:^|\n)\s*(?:height|max-height):/);
		}
		expect(tokens).not.toContain(".basalt-action-icon::after");
	});
	it("keeps scoped resets below components and caller utilities in both entrypoints", () => {
		for (const css of [tailwind, standalone]) {
			expect(css).toContain("@layer theme, base, components, utilities;");
		}
	});
	it("separates card and layout tiers from compact control spacing", () => {
		for (const role of ["card", "layout"]) {
			for (const [suffix, value] of [
				["-sm", "0.75rem"],
				["", "1rem"],
				["-lg", "1.5rem"],
				["-xl", "2rem"],
			]) {
				const name = `${role}${suffix}`;
				for (const css of [tokens, standalone])
					expect(css).toContain(`--basalt-space-${name}: ${value}`);
				expect(tailwind).toContain(`--spacing-basalt-${name}: var(--basalt-space-${name})`);
				for (const utility of [
					"p",
					"px",
					"py",
					"m",
					"mx",
					"my",
					"gap",
					"gap-x",
					"gap-y",
					"space-x",
					"space-y",
				]) {
					const selector = `.${utility}-basalt-${name}`;
					expect(standalone).toContain(
						utility.startsWith("space-")
							? `:where(${selector} > :not(:last-child)) {`
							: `${selector} {`,
					);
				}
			}
		}
		expect(tokens).toContain("--basalt-space-control-y: var(--basalt-space-sm)");
		expect(tokens).toContain("--basalt-space-row-y: var(--basalt-space-md)");
		expect(tokens).toContain("--basalt-space-nav-inset: var(--basalt-space-lg)");
		expect(tokens).toContain("--basalt-space-panel-x: var(--basalt-space-card)");
		expect(tokens).toContain("--basalt-space-panel-y: var(--basalt-space-card-sm)");
	});
	it("emits zero padding once, before axis overrides", () => {
		expect(standalone.match(/\.p-0 \{/g)).toHaveLength(1);
		expect(standalone.indexOf(".p-0 {")).toBeLessThan(standalone.indexOf(".px-basalt-space-lg {"));
	});
	it("owns the control, icon, surface and touch scales independently of the host", () => {
		for (const [role, value] of Object.entries({
			control: "2.125rem",
			"control-sm": "1.75rem",
			"control-lg": "2.5rem",
			icon: "0.875rem",
			"icon-lg": "1rem",
			touch: "2.75rem",
			"table-row": "2.25rem",
			rail: "4.25rem",
		})) {
			expect(tokens).toContain(`--basalt-size-${role}: ${value}`);
			expect(tailwind).toContain(`--spacing-basalt-${role}: var(--basalt-size-${role})`);
			expect(standalone).toContain(`--basalt-size-${role}: ${value}`);
		}
		expect(tokens).not.toContain("var(--spacing)");
	});
	it("does not reintroduce host-owned nonzero padding, margin or gaps inside components", () => {
		for (const file of readdirSync("packages/basalt/src/components")) {
			if (!file.endsWith(".tsx") || file.includes(".test.")) continue;
			const source = readFileSync(`packages/basalt/src/components/${file}`, "utf8");
			expect(source, file).not.toMatch(/\bleading-[1-9]/);
			expect(source, file).not.toMatch(
				/\b(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy])-(?:[1-9]\d*(?:\.\d+)?|0\.\d+)(?![\w./])/,
			);
		}
	});
	it("defines shared panel and row roles for composite controls", () => {
		for (const role of [
			"panel-x",
			"panel-y",
			"content-gap",
			"row-x",
			"row-y",
			"row-gap",
			"row-content",
			"nav-inset",
			"nav-gap",
		]) {
			expect(tokens).toContain(`--basalt-space-${role}:`);
			expect(tailwind).toContain(`--spacing-basalt-${role}: var(--basalt-space-${role})`);
			expect(standalone).toContain(`--basalt-space-${role}:`);
		}
		for (const file of ["approval-card", "context-cards", "recommendation-card", "diff-table"]) {
			const source = readFileSync(`packages/basalt/src/components/${file}.tsx`, "utf8");
			expect(source, file).toContain("px-basalt-panel-x");
			expect(source, file).toContain("py-basalt-panel-y");
		}
		for (const file of ["thinking", "tool-chips", "approval-card", "chat-message"]) {
			const source = readFileSync(`packages/basalt/src/components/${file}.tsx`, "utf8");
			expect(source, file).toContain("gap-basalt-row-gap");
			expect(source, file).toContain("var(--basalt-line-body)");
		}
	});
	it("resets native group insets at every public form-group boundary", () => {
		for (const file of ["radio", "checkbox", "switch", "segment-control"]) {
			const source = readFileSync(`packages/basalt/src/components/${file}.tsx`, "utf8");
			expect(source, file).toMatch(/<fieldset[\s\S]*?className=[^>]*basalt-ui/);
		}
		expect(standalone).toContain(":where(.basalt-ui:is(fieldset), .basalt-ui fieldset)");
		expect(standalone).toContain(":where(.basalt-ui:is(legend), .basalt-ui legend)");
	});
	it("ships every dimension variable referenced by a class", () => {
		const known = new Set(
			Array.from(
				tokens.matchAll(/--(basalt-(?:space|size|border-width)[\w-]*):/g),
				(match) => match[1],
			),
		);
		for (const match of tailwind.matchAll(/--spacing-basalt-[\w-]+:\s*var\(--(basalt-[\w-]+)\)/g))
			expect(known.has(match[1]), match[1]).toBe(true);
	});
	it("gives native legends their own field gap instead of relying on fieldset flex gap", () => {
		for (const file of ["radio", "checkbox", "switch"]) {
			const source = readFileSync(`packages/basalt/src/components/${file}.tsx`, "utf8");
			expect(source, file).toMatch(/<legend[\s\S]*?className=[^>]*mb-basalt-field-gap/);
		}
		expect(standalone).toContain(".mb-basalt-field-gap");
		const example = readFileSync("src/pages/ui/examples/loader/options.tsx", "utf8");
		expect(example).not.toMatch(/<Switch.Group[^>]*className/);
	});
});
