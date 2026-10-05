import { describe, expect, it } from "vitest";
import { codeLines } from "./code";

describe("code lines", () => {
	it("keeps empty lines, indentation and terminal newlines", () => {
		for (const highlighted of [false, true]) {
			expect(codeLines("", highlighted)).toEqual([[]]);
			const lines = codeLines("  first\r\n\r\n\tlast\r", highlighted);
			expect(lines.map((line) => line.map((token) => token.text).join(""))).toEqual([
				"  first",
				"",
				"\tlast",
				"",
			]);
		}
	});
	it("retains multiline token color without interpreting markup", () => {
		const lines = codeLines(
			"const n = 12; // note\nconst text = `one\ntwo`;\n<div>plain</div>",
			true,
		);
		expect(lines[0].find((token) => token.text === "const")?.className).toBe("text-basalt-primary");
		expect(lines[0].find((token) => token.text === "12")?.className).toBe("text-basalt-chart-4");
		expect(lines[0].find((token) => token.text === "// note")?.className).toBe(
			"text-basalt-muted-foreground",
		);
		expect(lines[2][0]).toEqual({ text: "two`", className: "text-basalt-chart-5" });
		expect(lines[3].map((token) => token.text).join("")).toBe("<div>plain</div>");
	});
});
