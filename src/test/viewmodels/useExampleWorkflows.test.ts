import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDemoSubmission } from "@/viewmodels/useDemoSubmission";
import { useFormsViewModel } from "@/viewmodels/useFormsViewModel";

describe("local example service lifecycle", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());
	it("keeps the submitted snapshot, rejects duplicate submits, and retries a failure", () => {
		const { result } = renderHook(() => useDemoSubmission<{ name: string }>());
		act(() => result.current.retry());
		expect(result.current.status).toBe("idle");
		act(() => result.current.setFailNext(true));
		act(() => {
			expect(result.current.submit({ name: "Alex" })).toBe(true);
			expect(result.current.submit({ name: "Duplicate" })).toBe(false);
		});
		expect(result.current.status).toBe("pending");
		expect(result.current.failNext).toBe(false);
		act(() => vi.advanceTimersByTime(500));
		expect(result.current.status).toBe("error");
		expect(result.current.result).toBeNull();
		act(() => result.current.retry());
		act(() => vi.advanceTimersByTime(500));
		expect(result.current.result).toEqual({ name: "Alex" });
		expect(result.current.status).toBe("success");
	});
	it("cancels pending work, preserves the last saved result, and clears timers on unmount", () => {
		const { result, unmount } = renderHook(() => useDemoSubmission<string>());
		act(() => result.current.submit("saved"));
		act(() => vi.advanceTimersByTime(500));
		act(() => result.current.submit("cancelled"));
		act(() => result.current.cancel());
		act(() => vi.advanceTimersByTime(500));
		expect(result.current.result).toBe("saved");
		expect(result.current.status).toBe("idle");
		act(() => result.current.cancel());
		act(() => result.current.submit("unmounted"));
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
	it("validates passwords without retaining them in submitted form results", () => {
		const { result } = renderHook(() => useFormsViewModel());
		act(() => result.current.updateSecurity("short", "short", false));
		expect(result.current.passwordError).toBe(true);
		act(() => result.current.updateSecurity("long-enough", "different", false));
		expect(result.current.security.status).toBe("idle");
		act(() => result.current.updateSecurity("long-enough", "long-enough", true));
		act(() => vi.advanceTimersByTime(500));
		expect(result.current.passwordError).toBe(false);
		expect(result.current.security.result).toEqual({ twoFactor: true });
		act(() => {
			result.current.setFiles([{ name: "report.pdf", size: 1024 }]);
			result.current.setDetailsOpen(true);
		});
		expect(result.current.files).toEqual([{ name: "report.pdf", size: 1024 }]);
		expect(result.current.detailsOpen).toBe(true);
	});
});
