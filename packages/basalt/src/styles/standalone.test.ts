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
		expect(css).toContain("min-height: var(--basalt-size-touch)");
	});
	it("includes control utilities without preflight", () => {
		expect(css).toContain(".basalt-action");
		expect(css).toContain(".h-basalt-16");
		expect(css).toContain(".w-basalt-16");
		expect(css).toContain(".scale-75");
		expect(css).toContain(".min-h-basalt-textarea-sm");
		expect(css).toContain(".min-h-basalt-textarea-lg");
		expect(css).toContain(".h-basalt-1_5");
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
		expect(css).toContain("@keyframes basalt-pixel-orbit");
		expect(css).toContain("@keyframes basalt-label-shimmer");
		expect(css).toContain("@keyframes basalt-tab-in");
		for (const motion of ["floating", "sheet", "sheet-backdrop"]) {
			expect(css).toContain(`@keyframes basalt-${motion}-in`);
			expect(css).toContain(`@keyframes basalt-${motion}-out`);
		}
		expect(css).toContain("--basalt-sheet-backdrop-blur: 6px");
		expect(css).toContain("--radix-popper-transform-origin");
		expect(css).toContain(".basalt-command-list::before");
		expect(css).toContain("--basalt-command-top");
		expect(css).toContain("data-basalt-command-animated");
		expect(css).toContain(".basalt-hover-list::before");
		expect(css).toContain("--basalt-hover-y");
		expect(css).toContain("transform var(--basalt-motion-normal) var(--basalt-motion-ease)");
		expect(css).toContain("prefers-reduced-motion: reduce");
		expect(css).toContain(".basalt-selection-motion");
		expect(css).toContain(".shadow-sm");
		expect(css).toContain(".sticky");
		expect(css).toContain(".w-\\[4\\.25rem\\]");
		expect(css).toContain(".cursor-col-resize");
		expect(css).toContain(".order-last");
		expect(css).toContain(".max-h-\\[18\\.75rem\\]");
		expect(css).toContain(".overflow-y-hidden {");
		expect(css).toContain(".overflow-x-hidden {");
		expect(css).toContain(".bg-basalt-selected");
		expect(css).toContain("data-\\[selected\\=true\\]\\:text-basalt-accent-foreground");
		expect(css).toContain(".ml-auto");
		expect(css).toContain(".tracking-widest");
		expect(css).toContain("backdrop-filter");
		expect(css).not.toMatch(/@keyframes pulse\s*\{/);
	});

	it("includes scoped base styles under basalt-ui without global leakage", () => {
		expect(css).toContain("@layer theme, base, components, utilities;");
		expect(css).toContain(".basalt-ui");
		expect(css).toContain("box-sizing: border-box;");
		expect(css).not.toMatch(/(?:^|\})\s*\*\s*\{[^}]*box-sizing:\s*border-box/);
		expect(css).not.toMatch(/(?:^|\})\s*button\s*\{[^}]*appearance:\s*button/);
	});
});
