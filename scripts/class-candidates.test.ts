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
