import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLoadingShowcaseViewModel } from "@/viewmodels/useLoadingShowcaseViewModel";

describe("useLoadingShowcaseViewModel", () => {
	it("starts busy and toggles the loaded frame", () => {
		const { result } = renderHook(() => useLoadingShowcaseViewModel());
		expect(result.current.busy).toBe(true);
		act(() => result.current.toggleBusy());
		expect(result.current.busy).toBe(false);
		act(() => result.current.toggleBusy());
		expect(result.current.busy).toBe(true);
	});

	it("accepts an idle initial frame", () => {
		const { result } = renderHook(() => useLoadingShowcaseViewModel(false));
		expect(result.current.busy).toBe(false);
	});
});
