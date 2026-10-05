import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tokens = readFileSync("packages/basalt/src/styles/tokens.css", "utf8");
const tailwind = readFileSync("packages/basalt/src/styles/tailwind.css", "utf8");
const standalone = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");

describe("dimension token contract", () => {
	it("emits zero padding once, before axis overrides", () => {
		expect(standalone.match(/\.p-0 \{/g)).toHaveLength(1);
		expect(standalone.indexOf(".p-0 {")).toBeLessThan(standalone.indexOf(".px-basalt-2 {"));
	});
	it("owns the control, icon, surface and touch scales independently of the host", () => {
		for (const [role, value] of Object.entries({
			control: "2rem",
			"control-sm": "1.75rem",
			"control-lg": "2.5rem",
			icon: "0.875rem",
			"icon-lg": "1rem",
			touch: "2.75rem",
			"table-row": "2.25rem",
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
	it("ships every dimension variable referenced by a class", () => {
		const known = new Set(
			Array.from(
				tokens.matchAll(/--(basalt-(?:space|size)-[\w]+(?:-[\w]+)*):/g),
				(match) => match[1],
			),
		);
		for (const match of tailwind.matchAll(/--spacing-basalt-[\w-]+:\s*var\(--(basalt-[\w-]+)\)/g))
			expect(known.has(match[1]), match[1]).toBe(true);
	});
});
