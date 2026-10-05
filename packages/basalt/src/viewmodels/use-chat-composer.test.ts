import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useChatComposer } from "./use-chat-composer";

const base = { disabled: false, streaming: false, hasAttachments: false };
describe("composer viewmodel", () => {
	it("guards empty/busy updates and keeps failed drafts", async () => {
		let reject: (e: unknown) => void = () => {};
		const send = vi.fn(
			() =>
				new Promise<void>((_, no) => {
					reject = no;
				}),
		);
		const { result } = renderHook(() => useChatComposer({ ...base, onSend: send }));
		await act(async () => {
			await result.current.send();
		});
		expect(send).not.toHaveBeenCalled();
		act(() => result.current.update("message"));
		act(() => {
			void result.current.send();
		});
		act(() => result.current.update("overwritten"));
		expect(result.current.value).toBe("message");
		await act(async () => reject("bad"));
		expect(result.current.error).toContain("Try again");
	});
	it.each([true, false])("does not update after unmount, success=%s", async (success) => {
		let settle: (e?: unknown) => void = () => {};
		const change = vi.fn();
		const { result, unmount } = renderHook(() =>
			useChatComposer({
				...base,
				defaultValue: "Draft",
				onValueChange: change,
				onSend: () =>
					new Promise<void>((yes, no) => {
						settle = success ? () => yes() : no;
					}),
			}),
		);
		act(() => {
			void result.current.send();
		});
		unmount();
		await act(async () => settle("late"));
		expect(change).not.toHaveBeenCalled();
	});
});
