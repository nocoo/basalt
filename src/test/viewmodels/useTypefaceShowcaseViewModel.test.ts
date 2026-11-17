import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	DEFAULT_CUSTOM_SPECIMEN,
	isSpecimenMode,
	resolveTierSpecimen,
	TYPE_SCALE_TIERS,
} from "@/models/typeface";
import { useTypefaceShowcaseViewModel } from "@/viewmodels/useTypefaceShowcaseViewModel";

describe("typeface model", () => {
	it("validates specimen modes and resolves mode-specific specimens", () => {
		expect(isSpecimenMode("roles")).toBe(true);
		expect(isSpecimenMode("bilingual")).toBe(true);
		expect(isSpecimenMode("custom")).toBe(true);
		expect(isSpecimenMode("unknown")).toBe(false);

		const tier = TYPE_SCALE_TIERS[0];
		expect(resolveTierSpecimen(tier, "roles", "ignored")).toBe(tier.roleSpecimen);
		expect(resolveTierSpecimen(tier, "bilingual", "ignored")).toBe(tier.bilingualSpecimen);
		expect(resolveTierSpecimen(tier, "custom", "  Basalt 123  ")).toBe("Basalt 123");
		expect(resolveTierSpecimen(tier, "custom", "   ")).toBe(DEFAULT_CUSTOM_SPECIMEN);
	});
});

describe("useTypefaceShowcaseViewModel", () => {
	it("defaults to roles mode and switches specimens across all seven tiers", () => {
		const { result } = renderHook(() => useTypefaceShowcaseViewModel());
		expect(result.current.specimenMode).toBe("roles");
		expect(result.current.customText).toBe(DEFAULT_CUSTOM_SPECIMEN);
		expect(result.current.scaleRows).toHaveLength(7);
		expect(result.current.scaleRows.map((row) => row.id)).toEqual([
			"3xl",
			"xl",
			"lg",
			"base",
			"md",
			"sm",
			"xs",
		]);
		expect(result.current.scaleRows[0].specimen).toBe(TYPE_SCALE_TIERS[0].roleSpecimen);

		act(() => result.current.selectSpecimenMode("bilingual"));
		expect(result.current.specimenMode).toBe("bilingual");
		expect(result.current.scaleRows[0].specimen).toBe(TYPE_SCALE_TIERS[0].bilingualSpecimen);

		act(() => result.current.selectSpecimenMode("invalid-mode"));
		expect(result.current.specimenMode).toBe("bilingual");

		act(() => result.current.selectSpecimenMode("custom"));
		act(() => result.current.setCustomText("Live preview specimen"));
		for (const row of result.current.scaleRows) {
			expect(row.specimen).toBe("Live preview specimen");
		}

		act(() => result.current.setCustomText("   "));
		for (const row of result.current.scaleRows) {
			expect(row.specimen).toBe(DEFAULT_CUSTOM_SPECIMEN);
		}

		act(() => result.current.resetCustomText());
		expect(result.current.customText).toBe(DEFAULT_CUSTOM_SPECIMEN);
	});
});
