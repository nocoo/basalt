import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCopy } from "./use-copy";

describe("useCopy", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it("copies text, sets copied state, and resets after timeout", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", { clipboard: { writeText } });

		const { result } = renderHook(() => useCopy(500));
		expect(result.current.copied).toBe(false);

		let ok = false;
		await act(async () => {
			ok = await result.current.copy("hello");
		});
		expect(ok).toBe(true);
		expect(writeText).toHaveBeenCalledWith("hello");
		expect(result.current.copied).toBe(true);

		act(() => {
			vi.advanceTimersByTime(499);
		});
		expect(result.current.copied).toBe(true);

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(result.current.copied).toBe(false);
	});

	it("resets timer on repeated copies and cleans up on unmount", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", { clipboard: { writeText } });

		const { result, unmount } = renderHook(() => useCopy(1000));

		await act(async () => {
			await result.current.copy("first");
		});
		act(() => {
			vi.advanceTimersByTime(600);
		});
		await act(async () => {
			await result.current.copy("second");
		});
		act(() => {
			vi.advanceTimersByTime(600);
		});
		expect(result.current.copied).toBe(true);

		act(() => {
			vi.advanceTimersByTime(400);
		});
		expect(result.current.copied).toBe(false);

		await act(async () => {
			await result.current.copy("third");
		});
		unmount();
		act(() => {
			vi.runAllTimers();
		});
	});

	it("returns true without updating state when unmounted before clipboard resolves", async () => {
		let resolveWrite: (() => void) | undefined;
		const writeText = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveWrite = resolve;
				}),
		);
		vi.stubGlobal("navigator", { clipboard: { writeText } });

		const { result, unmount } = renderHook(() => useCopy());
		const copyPromise = result.current.copy("late");
		unmount();
		resolveWrite?.();
		expect(await copyPromise).toBe(true);
	});

	it("returns false when clipboard write rejects", async () => {
		const writeText = vi.fn().mockRejectedValue(new Error("denied"));
		vi.stubGlobal("navigator", { clipboard: { writeText } });

		const { result } = renderHook(() => useCopy());
		let ok = true;
		await act(async () => {
			ok = await result.current.copy("secret");
		});
		expect(ok).toBe(false);
		expect(result.current.copied).toBe(false);
	});
});
