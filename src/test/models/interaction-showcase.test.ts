import { describe, expect, it } from "vitest";
import { ALL_TOAST_TONES, toastToneLabel } from "@/models/interaction-showcase";

describe("toastToneLabel", () => {
	it("returns human-readable label for each tone", () => {
		expect(toastToneLabel("neutral")).toBe("Neutral");
		expect(toastToneLabel("success")).toBe("Success");
		expect(toastToneLabel("danger")).toBe("Danger");
		expect(toastToneLabel("warning")).toBe("Warning");
		expect(toastToneLabel("info")).toBe("Info");
	});
});

describe("ALL_TOAST_TONES", () => {
	it("contains exactly 5 tones", () => {
		expect(ALL_TOAST_TONES).toHaveLength(5);
	});

	it("includes all expected tones", () => {
		expect(ALL_TOAST_TONES).toContain("neutral");
		expect(ALL_TOAST_TONES).toContain("success");
		expect(ALL_TOAST_TONES).toContain("danger");
		expect(ALL_TOAST_TONES).toContain("warning");
		expect(ALL_TOAST_TONES).toContain("info");
	});
});
