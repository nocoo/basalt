import { describe, expect, it } from "vitest";
import { MENU_GAP, OVERLAY_GAP, overlayItemClass, overlayPanelClass } from "./overlay";

describe("overlay", () => {
	it("keeps field lists 4px below the trigger and menus 8px", () => {
		expect(OVERLAY_GAP).toBe(4);
		expect(MENU_GAP).toBe(8);
	});

	it("insets the highlight from the panel edge", () => {
		expect(overlayPanelClass()).toContain("py-1.5");
		expect(overlayItemClass()).toContain("mx-1.5");
		expect(overlayItemClass()).toContain("py-1.5");
	});
});
