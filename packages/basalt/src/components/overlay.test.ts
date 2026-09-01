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

describe("overlay", () => {
	it("keeps field lists 4px below the trigger and menus 8px", () => {
		expect(OVERLAY_GAP).toBe(4);
		expect(MENU_GAP).toBe(8);
	});

	it("insets the highlight from the panel edge", () => {
		expect(overlayPanelClass()).toContain("py-1.5");
		expect(overlayItemClass()).toContain("mx-1.5");
		expect(overlayItemClass()).toContain("py-1.5");
		expect(overlayPanelClass()).toContain(OVERLAY_LAYER);
		expect(overlayPanelClass()).toContain(OVERLAY_MOTION);
	});

	it("shares a stacking layer and reduced-motion kill switch", () => {
		expect(OVERLAY_LAYER).toBe("z-50");
		expect(OVERLAY_MOTION).toContain("motion-reduce:animate-none");
		expect(OVERLAY_MOTION).toContain("motion-reduce:transition-none");
	});

	it("focuses by recoloring the border instead of growing a ring", () => {
		expect(FOCUS_BORDER).toContain("focus-visible:border-basalt-ring");
		expect(FOCUS_BORDER).not.toContain("ring-offset");
		expect(FOCUS_INSET).toContain("ring-inset");
		expect(FOCUS_INSET).not.toContain("ring-offset");
	});

	it("offsets the ring so it stays visible on primary fills", () => {
		expect(FOCUS_RING).toContain("ring-offset-2");
		expect(FOCUS_RING).toContain("ring-basalt-ring");
		expect(FOCUS_RING).not.toContain("ring-inset");
	});
});
