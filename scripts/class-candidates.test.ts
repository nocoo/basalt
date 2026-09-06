import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { classCandidates } from "./class-candidates";

describe("classCandidates", () => {
	it("keeps class tokens after empty jsx attributes", () => {
		expect(
			classCandidates(`data-basalt-table=""
className="border-separate border-spacing-0 caption-bottom"`),
		).toEqual(expect.arrayContaining(["border-separate", "border-spacing-0", "caption-bottom"]));
	});

	it("extracts tokens despite quotes in comments and handles template literals", () => {
		const snippet = `
			// Comment with 'single' and "double" and \`backticks\`
			/* Multiline comment saying "don't break" or \`stuff\` */
			<div className="after-comment-token" />
			const tpl = \`static-head \${condition ? "inner-interpolated" : 'alt-interpolated'} static-tail\`;
		`;
		const candidates = classCandidates(snippet);
		expect(candidates).toContain("after-comment-token");
		expect(candidates).toContain("static-head");
		expect(candidates).toContain("static-tail");
		expect(candidates).toContain("inner-interpolated");
		expect(candidates).toContain("alt-interpolated");
	});

	it("collects table and overlay utilities from source", () => {
		const table = classCandidates(
			readFileSync(path.join(process.cwd(), "packages/basalt/src/components/table.tsx"), "utf8"),
		);
		expect(table).toEqual(
			expect.arrayContaining(["border-separate", "border-spacing-0", "caption-bottom"]),
		);

		const dialog = classCandidates(
			readFileSync(path.join(process.cwd(), "packages/basalt/src/components/dialog.tsx"), "utf8"),
		);
		expect(dialog).toContain("space-y-1.5");

		const commandPalette = classCandidates(
			readFileSync(
				path.join(process.cwd(), "packages/basalt/src/components/command-palette.tsx"),
				"utf8",
			),
		);
		expect(commandPalette).toContain("ml-auto");
		expect(commandPalette).toContain("tracking-widest");

		const inputGroup = classCandidates(
			readFileSync(
				path.join(process.cwd(), "packages/basalt/src/components/input-group.tsx"),
				"utf8",
			),
		);
		expect(inputGroup).toContain("pr-3");
	});

	it("emits those utilities in standalone css", () => {
		const css = readFileSync(
			path.join(process.cwd(), "packages/basalt/src/styles/standalone.css"),
			"utf8",
		);
		expect(css).toContain("border-separate");
		expect(css).toContain("border-spacing-0");
		expect(css).toContain("caption-bottom");
		expect(css).toContain("space-y-1\\.5");
		expect(css).toContain(".pr-3");
	});
});
