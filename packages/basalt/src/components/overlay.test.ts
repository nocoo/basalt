import { readFileSync } from "node:fs";
import postcss from "postcss";
import { describe, expect, it } from "vitest";
import {
	FOCUS_BORDER,
	FOCUS_INSET,
	FOCUS_RING,
	MENU_GAP,
	OVERLAY_GAP,
	OVERLAY_LAYER,
	OVERLAY_MOTION,
	overlayItemClass,
	overlayPanelClass,
} from "./overlay";

const focusStyles = postcss.parse(readFileSync("packages/basalt/src/styles/base.css", "utf8"));

function normalizedSelector(selector: string) {
	return selector
		.replace(/\s+/g, " ")
		.replace(/([(,]) /g, "$1")
		.replace(/ \)/g, ")")
		.trim();
}

function focusDeclarations(selector: string) {
	const declarations: Record<string, string> = {};
	focusStyles.walkRules((rule) => {
		if (
			rule.selectors.some(
				(candidate) => normalizedSelector(candidate) === normalizedSelector(selector),
			) &&
			(rule.parent?.type === "root" ||
				(rule.parent?.type === "atrule" && rule.parent.name === "layer"))
		) {
			rule.walkDecls((declaration) => {
				declarations[declaration.prop] = declaration.value;
			});
		}
	});
	return declarations;
}

describe("overlay", () => {
	it("keeps field lists 4px below the trigger and menus 8px", () => {
		expect(OVERLAY_GAP).toBe(4);
		expect(MENU_GAP).toBe(8);
	});

	it("insets the highlight from the panel edge", () => {
		expect(overlayPanelClass()).toContain("py-basalt-menu-inset");
		expect(overlayItemClass()).toContain("mx-basalt-menu-inset");
		expect(overlayItemClass()).toContain("py-basalt-menu-y");
		expect(overlayPanelClass()).toContain(OVERLAY_LAYER);
		expect(overlayPanelClass()).toContain(OVERLAY_MOTION);
		expect(overlayPanelClass()).toContain("basalt-floating");
	});

	it("shares a stacking layer and reduced-motion kill switch", () => {
		expect(OVERLAY_LAYER).toBe("z-50");
		expect(OVERLAY_MOTION).toContain("motion-reduce:animate-none");
		expect(OVERLAY_MOTION).toContain("motion-reduce:transition-none");
	});

	it("shares one native theme outline without replacing error borders", () => {
		expect(FOCUS_BORDER).toBe(FOCUS_RING);
		expect(FOCUS_RING).toBe("basalt-focus");
		expect(focusDeclarations(":is(.basalt-focus, .basalt-action):focus-visible")).toEqual({
			outline: "var(--basalt-focus-width) solid hsl(var(--basalt-ring))",
			"outline-offset": "var(--basalt-focus-offset)",
			transition: "none",
		});
	});

	it("bounds flush targets with the same stroke and negative offset", () => {
		expect(FOCUS_INSET).toBe("basalt-focus basalt-focus-inset");
		expect(focusDeclarations(".basalt-focus-inset:focus-visible")).toEqual({
			"outline-offset": "calc(-1 * var(--basalt-focus-offset))",
		});
		expect(overlayItemClass()).toContain(FOCUS_INSET);
	});

	it("puts composite text focus on the nearest group only", () => {
		expect(
			focusDeclarations(
				".basalt-focus-group:has(:is(input, textarea):focus-visible):not(:has(.basalt-focus-group :focus-visible))",
			),
		).toEqual(focusDeclarations(":is(.basalt-focus, .basalt-action):focus-visible"));
		expect(focusDeclarations(".basalt-focus-group :is(input, textarea):focus-visible")).toEqual({
			outline: "none",
		});
	});

	it("does not force primary group actions into same-color inset focus", () => {
		expect(focusDeclarations(".basalt-focus-group :is(button, a):focus-visible")).toEqual({});
		expect(focusDeclarations(".basalt-focus-group .basalt-choice:focus-visible")).toEqual({
			"outline-offset": "calc(-1 * var(--basalt-focus-offset))",
		});
	});

	it("paints a viewport-only focus frame above isolated sticky content", () => {
		expect(
			focusDeclarations(".basalt-focus-frame:has(> .basalt-focus:focus-visible)::after"),
		).toEqual({
			outline: "var(--basalt-focus-width) solid hsl(var(--basalt-ring))",
			"outline-offset": "calc(-1 * var(--basalt-focus-offset))",
			content: '""',
			position: "absolute",
			inset: "0",
			"z-index": "1",
			"border-radius": "inherit",
			"pointer-events": "none",
		});
		expect(focusDeclarations(".basalt-focus-frame > .basalt-focus:focus-visible")).toEqual({
			outline: "none",
		});
	});

	it("uses the compact spacing scale for focus clearance and navigation rhythm", () => {
		const tokens = readFileSync("packages/basalt/src/styles/tokens.css", "utf8");
		expect(tokens).toContain("--basalt-focus-width: 0.0625rem;");
		expect(tokens).toContain("--basalt-focus-offset: 0.125rem;");
		expect(tokens).toContain("--basalt-focus-clearance: var(--basalt-space-sm);");
		expect(tokens).toContain("--basalt-space-nav-gap: var(--basalt-space-sm);");
	});

	it("separates a bounded swatch stroke from its fill using the focus tokens", () => {
		expect(focusDeclarations(".basalt-focus-swatch:focus-visible")["box-shadow"]).toMatch(
			/inset 0 0 0 calc\(var\(--basalt-focus-offset\) \+ var\(--basalt-focus-width\)\)\s+hsl\(var\(--basalt-background\)\)/,
		);
	});
});
