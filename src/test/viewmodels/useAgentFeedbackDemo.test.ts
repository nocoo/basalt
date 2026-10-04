import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useAgentFeedbackDemo } from "@/viewmodels/useAgentFeedbackDemo";

afterEach(() => vi.useRealTimers());
it("advances demo progress, replays, changes variants and releases timers", () => {
	vi.useFakeTimers();
	const { result, rerender, unmount } = renderHook(({ variant }) => useAgentFeedbackDemo(variant), {
		initialProps: { variant: "steps" as "steps" | "search" },
	});
	expect(result.current.steps[0].status).toBe("running");
	expect(result.current.tools[1].status).toBe("pending");
	for (let i = 0; i < 4; i++) act(() => vi.advanceTimersByTime(900));
	expect(result.current.tools.every((step) => step.status === "complete")).toBe(true);
	expect(vi.getTimerCount()).toBe(0);
	act(() => result.current.restart());
	expect(result.current.steps[0].status).toBe("running");
	rerender({ variant: "search" });
	expect(result.current.steps).toHaveLength(3);
	unmount();
	expect(vi.getTimerCount()).toBe(0);
});
