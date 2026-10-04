import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ApprovalQuestion } from "../models/agent-feedback";
import { useApprovalCardViewModel } from "./use-approval-card";
import { useThinkingViewModel } from "./use-thinking";
import { useToolChipsViewModel } from "./use-tool-chips";

const q: ApprovalQuestion = {
	id: "q",
	label: "Choice",
	type: "single",
	allowCustom: true,
	options: [{ id: "a", label: "A" }],
};
afterEach(() => vi.useRealTimers());
describe("approval viewmodel", () => {
	it("guards empty state, unknown options and missing required answers", () => {
		const submit = vi.fn();
		const { result, rerender } = renderHook(
			({ questions }) =>
				useApprovalCardViewModel({ questions, onSubmit: submit, autoAdvance: false }),
			{ initialProps: { questions: [] as ApprovalQuestion[] } },
		);
		act(() => {
			result.current.choose("missing");
			result.current.setCustom("ignored");
			result.current.continue();
			result.current.skip();
		});
		expect(submit).not.toHaveBeenCalled();
		rerender({ questions: [q, { ...q, id: "next", allowCustom: false }] });
		act(() => result.current.choose("missing"));
		expect(result.current.canContinue).toBe(false);
		act(() => result.current.move(1));
		act(() => result.current.setCustom("ignored"));
		act(() => result.current.choose("a"));
		act(() => result.current.continue());
		expect(result.current.position).toBe(0);
		expect(submit).not.toHaveBeenCalled();
	});
	it("locks all edits while submitting and handles non-Error failures", async () => {
		let reject: (error: unknown) => void = () => {};
		const submit = vi.fn(
			() =>
				new Promise<void>((_, no) => {
					reject = no;
				}),
		);
		const { result } = renderHook(() =>
			useApprovalCardViewModel({ questions: [q], onSubmit: submit }),
		);
		act(() => result.current.setCustom("custom"));
		act(() => result.current.continue());
		expect(result.current.status).toBe("submitting");
		act(() => {
			result.current.choose("a");
			result.current.move(1);
			result.current.setCustom("overwrite");
			result.current.continue();
			result.current.skip();
		});
		expect(submit).toHaveBeenCalledTimes(1);
		await act(async () => reject("failed"));
		expect(result.current.error).toContain("Try again");
		expect(result.current.answer?.custom).toBe("custom");
	});
	it("skips optional intermediate questions and cancels auto advance on manual navigation", () => {
		vi.useFakeTimers();
		const { result, unmount } = renderHook(() =>
			useApprovalCardViewModel({
				questions: [
					{ ...q, required: false },
					{ ...q, id: "next" },
				],
				onSubmit: vi.fn(),
			}),
		);
		act(() => result.current.skip());
		expect(result.current.position).toBe(1);
		act(() => result.current.move(0));
		act(() => result.current.choose("a"));
		act(() => result.current.move(0));
		act(() => vi.advanceTimersByTime(300));
		expect(result.current.position).toBe(0);
		act(() => result.current.choose("a"));
		act(() => result.current.setCustom("custom"));
		act(() => vi.advanceTimersByTime(300));
		expect(result.current.position).toBe(0);
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
	it.each([true, false])("ignores async settlement after unmount: success=%s", async (success) => {
		let settle: (value?: unknown) => void = () => {};
		const { result, unmount } = renderHook(() =>
			useApprovalCardViewModel({
				questions: [q],
				onSubmit: () =>
					new Promise<void>((yes, no) => {
						settle = success ? () => yes() : no;
					}),
			}),
		);
		act(() => result.current.choose("a"));
		act(() => result.current.continue());
		unmount();
		await act(async () => settle("late"));
	});
});
describe("trace viewmodels", () => {
	it("keeps controlled expansion host-owned", () => {
		const change = vi.fn();
		const { result } = renderHook(() =>
			useThinkingViewModel({ steps: [], open: false, onOpenChange: change }),
		);
		act(() => result.current.setOpen(true));
		expect(change).toHaveBeenCalledWith(true);
		expect(result.current.open).toBe(false);
	});
	it("toggles tools without duplicate expanded IDs", () => {
		const { result } = renderHook(() => useToolChipsViewModel([], true));
		act(() => result.current.setExpanded("a", true));
		act(() => result.current.setExpanded("a", true));
		expect(result.current.expanded).toEqual(["a"]);
		act(() => result.current.setExpanded("a", false));
		expect(result.current.expanded).toEqual([]);
		act(() => result.current.setOpen(false));
		expect(result.current.open).toBe(false);
	});
});
