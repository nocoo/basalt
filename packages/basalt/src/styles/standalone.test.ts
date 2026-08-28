import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");

describe("standalone css", () => {
	it("includes control utilities without preflight", () => {
		expect(css).toContain(".h-9");
		expect(css).toContain(".bg-basalt-primary");
		expect(css).toContain("--basalt-primary");
		expect(css).not.toContain("img, svg, video, canvas");
		expect(css).not.toMatch(/body\s*\{[^}]*margin:\s*0/);
	});
});
