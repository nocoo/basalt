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
		expect(css).toContain("@keyframes basalt-pulse");
		expect(css).toContain("@keyframes basalt-dialog-in");
		expect(css).toContain("@keyframes basalt-overlay-in");
		expect(css).toContain("@keyframes basalt-collapsible-down");
		expect(css).toContain("@keyframes basalt-shimmer");
		expect(css).toContain("@keyframes basalt-loader-spin");
		expect(css).toContain("@keyframes basalt-tab-in");
		expect(css).toContain("backdrop-filter");
		expect(css).not.toMatch(/@keyframes pulse\s*\{/);
	});
});
