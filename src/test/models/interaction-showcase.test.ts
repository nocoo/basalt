import { describe, expect, it } from "vitest";
import { ALL_TOAST_VARIANTS, toastVariantLabel } from "@/models/interaction-showcase";

describe("toastVariantLabel", () => {
	it("returns human-readable label for each variant", () => {
		expect(toastVariantLabel("default")).toBe("Default");
		expect(toastVariantLabel("success")).toBe("Success");
		expect(toastVariantLabel("error")).toBe("Error");
		expect(toastVariantLabel("warning")).toBe("Warning");
		expect(toastVariantLabel("info")).toBe("Info");
	});
});

describe("ALL_TOAST_VARIANTS", () => {
	it("contains exactly 5 variants", () => {
		expect(ALL_TOAST_VARIANTS).toHaveLength(5);
	});

	it("includes all expected variants", () => {
		expect(ALL_TOAST_VARIANTS).toContain("default");
		expect(ALL_TOAST_VARIANTS).toContain("success");
		expect(ALL_TOAST_VARIANTS).toContain("error");
		expect(ALL_TOAST_VARIANTS).toContain("warning");
		expect(ALL_TOAST_VARIANTS).toContain("info");
	});
});
