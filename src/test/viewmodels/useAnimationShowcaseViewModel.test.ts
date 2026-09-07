import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAnimationShowcaseViewModel } from "@/viewmodels/useAnimationShowcaseViewModel";

describe("useAnimationShowcaseViewModel", () => {
	it("starts running and pauses motion", () => {
		const { result } = renderHook(() => useAnimationShowcaseViewModel());
		expect(result.current.paused).toBe(false);
		act(() => result.current.togglePaused());
		expect(result.current.paused).toBe(true);
		act(() => result.current.togglePaused());
		expect(result.current.paused).toBe(false);
	});
});
