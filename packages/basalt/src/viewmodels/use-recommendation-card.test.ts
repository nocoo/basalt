import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RecommendationOption } from "../models/recommendation";
import { useRecommendationCardViewModel } from "./use-recommendation-card";

const options: RecommendationOption[] = [
	{ id: "a", label: "A", description: "A", confidence: "high" },
	{ id: "b", label: "B", description: "B", confidence: "none", disabled: true },
];
describe("recommendation viewmodel", () => {
	it("guards missing, disabled, unknown and pending actions", async () => {
		const accept = vi.fn();
		const { result, rerender } = renderHook(
			({ items, disabled }) =>
				useRecommendationCardViewModel({ options: items, onAccept: accept, disabled }),
			{ initialProps: { items: [] as RecommendationOption[], disabled: false } },
		);
		await act(async () => result.current.accept());
		expect(accept).not.toHaveBeenCalled();
		rerender({ items: options, disabled: true });
		act(() => {
			result.current.select("a");
			result.current.setOpen(true);
		});
		await act(async () => result.current.accept());
		expect(result.current.open).toBe(false);
		rerender({ items: options, disabled: false });
		act(() => result.current.select("b"));
		act(() => result.current.select("missing"));
		expect(result.current.active?.id).toBe("a");
		await act(async () => result.current.accept());
		await act(async () => result.current.accept());
		expect(accept).toHaveBeenCalledTimes(1);
	});
	it("uses a safe error message for non-Error rejections and rejects edits while pending", async () => {
		let reject: (e: unknown) => void = () => {};
		const { result } = renderHook(() =>
			useRecommendationCardViewModel({
				options,
				onAccept: () =>
					new Promise((_, no) => {
						reject = no;
					}),
			}),
		);
		act(() => {
			void result.current.accept();
		});
		act(() => {
			result.current.select("a");
			result.current.setOpen(true);
		});
		expect(result.current.open).toBe(false);
		await act(async () => reject("bad"));
		expect(result.current.error).toContain("Try again");
		expect(result.current.pending).toBe(false);
	});
	it.each([true, false])("ignores settlement after unmount, success=%s", async (success) => {
		let settle: (e?: unknown) => void = () => {};
		const { result, unmount } = renderHook(() =>
			useRecommendationCardViewModel({
				options,
				onAccept: () =>
					new Promise<void>((yes, no) => {
						settle = success ? () => yes() : no;
					}),
			}),
		);
		act(() => {
			void result.current.accept();
		});
		unmount();
		await act(async () => settle("late"));
	});
});
