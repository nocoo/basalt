import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");

describe("standalone css", () => {
	it("ships responsive scroll ownership and safe sticky geometry", () => {
		for (const selector of [
			"[data-basalt-shell]",
			"[data-basalt-main]",
			"[data-basalt-island]",
			"[data-basalt-sidebar]",
			"[data-basalt-sheet]",
		]) {
			expect(css).toContain(selector);
		}
		expect(css).toContain("min-height: 100dvh");
		expect(css).toContain("--basalt-main-overflow: visible");
		expect(css).toContain("--basalt-island-overflow: visible");
		expect(css).toContain("top: var(--basalt-sticky-top, 0px)");
		expect(css).toContain("height: var(--basalt-sticky-top, 0px)");
		expect(css).toContain("min-height: 44px");
	});
	it("includes control utilities without preflight", () => {
		expect(css).toContain(".h-9");
		expect(css).toContain(".h-16");
		expect(css).toContain(".w-16");
		expect(css).toContain(".scale-75");
		expect(css).toContain(".min-h-\\[64px\\]");
		expect(css).toContain(".min-h-\\[96px\\]");
		expect(css).toContain(".h-1\\.5");
		expect(css).toContain("aria-invalid\\:border-basalt-destructive");
		expect(css).toContain(".bg-basalt-primary");
		expect(css).toContain("--basalt-primary");
		expect(css).not.toContain("img, svg, video, canvas");
		expect(css).not.toMatch(/body\s*\{[^}]*margin:\s*0/);
		expect(css).toContain("@keyframes basalt-pulse");
		expect(css).toContain("@keyframes basalt-dialog-in");
		expect(css).toContain("scale: 0.92");
		expect(css).toContain("@keyframes basalt-overlay-in");
		expect(css).toContain("@keyframes basalt-collapsible-down");
		expect(css).toContain("@keyframes basalt-shimmer");
		expect(css).toContain("@keyframes basalt-loader-spin");
		expect(css).toContain("@keyframes basalt-tab-in");
		for (const motion of ["floating", "sheet", "sheet-backdrop"]) {
			expect(css).toContain(`@keyframes basalt-${motion}-in`);
			expect(css).toContain(`@keyframes basalt-${motion}-out`);
		}
		expect(css).toContain("--basalt-sheet-backdrop-blur: 6px");
		expect(css).toContain("--radix-popper-transform-origin");
		expect(css).toContain("prefers-reduced-motion: reduce");
		expect(css).toContain("transition-property: left,width,top,height");
		expect(css).toContain(".shadow-sm");
		expect(css).toContain(".sticky");
		expect(css).toContain(".w-\\[68px\\]");
		expect(css).toContain(".cursor-col-resize");
		expect(css).toContain(".order-last");
		expect(css).toContain(".max-h-\\[300px\\]");
		expect(css).toContain(".overflow-y-hidden {");
		expect(css).toContain(".overflow-x-hidden {");
		expect(css).toContain("data-\\[selected\\=true\\]\\:bg-basalt-accent");
		expect(css).toContain(".ml-auto");
		expect(css).toContain(".tracking-widest");
		expect(css).toContain("backdrop-filter");
		expect(css).not.toMatch(/@keyframes pulse\s*\{/);
	});

	it("includes scoped base styles under basalt-ui without global leakage", () => {
		expect(css).toContain("@layer theme, base, utilities;");
		expect(css).toContain(".basalt-ui");
		expect(css).toContain("box-sizing: border-box;");
		expect(css).not.toMatch(/(?:^|\})\s*\*\s*\{[^}]*box-sizing:\s*border-box/);
		expect(css).not.toMatch(/(?:^|\})\s*button\s*\{[^}]*appearance:\s*button/);
	});
});
