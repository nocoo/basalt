import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChatViewModel } from "@/viewmodels/useChatViewModel";

describe("chat lifecycle", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());
	it("runs, pauses approval without a timer, resumes and cleans up", () => {
		const { result, unmount } = renderHook(useChatViewModel);
		act(() => result.current.dispatch({ type: "send", text: "Update CSS" }));
		expect(result.current.running).toBe(true);
		act(() => vi.advanceTimersByTime(2000));
		expect(result.current.waiting).toBe(true);
		expect(vi.getTimerCount()).toBe(0);
		act(() => result.current.dispatch({ type: "approve", decision: "apply" }));
		expect(vi.getTimerCount()).toBe(1);
		act(() => vi.advanceTimersByTime(10000));
		expect(result.current.running).toBe(false);
		expect(vi.getTimerCount()).toBe(0);
		act(() => result.current.dispatch({ type: "send", text: "Again" }));
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});
