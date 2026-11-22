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
		expect(result.current.status).toBe("idle");
		expect(result.current.announcementCount).toBe(0);

		let ok = false;
		await act(async () => {
			ok = await result.current.copy("hello");
		});
		expect(ok).toBe(true);
		expect(writeText).toHaveBeenCalledWith("hello");
		expect(result.current.copied).toBe(true);
		expect(result.current.status).toBe("copied");
		expect(result.current.announcementCount).toBe(1);

		act(() => {
			vi.advanceTimersByTime(499);
		});
		expect(result.current.copied).toBe(true);

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(result.current.copied).toBe(false);
		expect(result.current.status).toBe("idle");
		expect(result.current.announcementCount).toBe(1);
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
		expect(result.current.announcementCount).toBe(2);
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

	it("ignores settlement when unmounted before clipboard resolves or rejects", async () => {
		let resolveWrite: (() => void) | undefined;
		let rejectWrite: ((error: unknown) => void) | undefined;
		const writeText = vi
			.fn()
			.mockImplementationOnce(
				() =>
					new Promise<void>((resolve) => {
						resolveWrite = resolve;
					}),
			)
			.mockImplementationOnce(
				() =>
					new Promise<void>((_resolve, reject) => {
						rejectWrite = reject;
					}),
			);
		vi.stubGlobal("navigator", { clipboard: { writeText } });

		const first = renderHook(() => useCopy());
		const copyPromise = first.result.current.copy("late");
		first.unmount();
		resolveWrite?.();
		expect(await copyPromise).toBe(true);

		const second = renderHook(() => useCopy());
		const errorPromise = second.result.current.copy("late-error");
		second.unmount();
		rejectWrite?.(new Error("denied"));
		expect(await errorPromise).toBe(false);
	});

	it("sets error state and resets after timeout when clipboard write rejects", async () => {
		const writeText = vi.fn().mockRejectedValue(new Error("denied"));
		vi.stubGlobal("navigator", { clipboard: { writeText } });

		const { result } = renderHook(() => useCopy(500));
		let ok = true;
		await act(async () => {
			ok = await result.current.copy("secret");
		});
		expect(ok).toBe(false);
		expect(result.current.copied).toBe(false);
		expect(result.current.status).toBe("error");
		expect(result.current.announcementCount).toBe(1);

		act(() => {
			vi.advanceTimersByTime(500);
		});
		expect(result.current.status).toBe("idle");
	});
});
