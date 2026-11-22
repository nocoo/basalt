import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useInteractionShowcaseViewModel } from "@/viewmodels/useInteractionShowcaseViewModel";

describe("useInteractionShowcaseViewModel", () => {
	it("returns toast demos with toneLabel", () => {
		const { result } = renderHook(() => useInteractionShowcaseViewModel());
		expect(result.current.toasts.length).toBeGreaterThan(0);
		result.current.toasts.forEach((t) => {
			expect(t).toHaveProperty("id");
			expect(t).toHaveProperty("title");
			expect(t).toHaveProperty("description");
			expect(t).toHaveProperty("tone");
			expect(t).toHaveProperty("toneLabel");
			expect(typeof t.toneLabel).toBe("string");
		});
	});

	it("returns dialog demos with required fields", () => {
		const { result } = renderHook(() => useInteractionShowcaseViewModel());
		expect(result.current.dialogs.length).toBeGreaterThan(0);
		result.current.dialogs.forEach((d) => {
			expect(d).toHaveProperty("id");
			expect(d).toHaveProperty("title");
			expect(d).toHaveProperty("description");
			expect(d).toHaveProperty("style");
		});
	});

	it("manages dialog open/close state", () => {
		const { result } = renderHook(() => useInteractionShowcaseViewModel());
		expect(result.current.activeDialog).toBeNull();

		act(() => result.current.openDialog("d1"));
		expect(result.current.activeDialog).toBe("d1");

		act(() => result.current.closeDialog());
		expect(result.current.activeDialog).toBeNull();
	});

	it("getDialogById returns correct dialog", () => {
		const { result } = renderHook(() => useInteractionShowcaseViewModel());
		const firstDialog = result.current.dialogs[0];
		const found = result.current.getDialogById(firstDialog.id);
		expect(found).toEqual(firstDialog);
	});

	it("getDialogById returns undefined for unknown id", () => {
		const { result } = renderHook(() => useInteractionShowcaseViewModel());
		expect(result.current.getDialogById("nonexistent")).toBeUndefined();
	});

	it("returns tone labels for all tones", () => {
		const { result } = renderHook(() => useInteractionShowcaseViewModel());
		expect(result.current.toneLabels).toHaveLength(5);
		result.current.toneLabels.forEach((tl) => {
			expect(tl).toHaveProperty("tone");
			expect(tl).toHaveProperty("label");
		});
	});
});
