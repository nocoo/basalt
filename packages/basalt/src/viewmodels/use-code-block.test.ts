import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCodeBlock } from "./use-code-block";

describe("code block viewmodel", () => {
	it("copies exact source, locks duplicates, retries errors and scopes feedback to content", async () => {
		const text = "one\r\n\t\r\n";
		const { result, rerender } = renderHook(({ code }) => useCodeBlock(code, true), {
			initialProps: { code: text },
		});
		let resolve: () => void = () => {};
		const write = vi.fn(
			() =>
				new Promise<void>((done) => {
					resolve = done;
				}),
		);
		act(() => {
			void result.current.copy(write);
			void result.current.copy(write);
		});
		expect(result.current.status).toBe("pending");
		expect(write).toHaveBeenCalledExactlyOnceWith(text);
		rerender({ code: "Changed" });
		await act(async () => resolve());
		expect(result.current.status).toBe("idle");
		await act(async () => result.current.copy(vi.fn().mockRejectedValue(new Error("Denied"))));
		expect(result.current.status).toBe("error");
		await act(async () => result.current.copy(vi.fn().mockResolvedValue(undefined)));
		expect(result.current.status).toBe("copied");
	});
	it.each([true, false])(
		"ignores clipboard settlement after unmount, success=%s",
		async (success) => {
			const { result, unmount } = renderHook(() => useCodeBlock("hello", false));
			let settle: () => void = () => {};
			act(
				() =>
					void result.current.copy(
						() =>
							new Promise<void>((yes, no) => {
								settle = success ? yes : () => no(new Error("Denied"));
							}),
					),
			);
			unmount();
			await act(async () => settle());
		},
	);
});
