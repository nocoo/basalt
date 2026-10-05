import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DiffTableRow } from "../models/diff-table";
import { useDiffTableViewModel } from "./use-diff-table";

const rows: DiffTableRow[] = [
	{ id: "a", label: "A", change: "add", values: { name: "A" } },
	{ id: "b", label: "B", change: "unchanged", values: { name: "B" } },
];
describe("diff viewmodel", () => {
	it("guards empty, disabled and unchanged selections, and snapshots input", async () => {
		const apply = vi.fn();
		const { result, rerender } = renderHook(
			({ disabled }) => useDiffTableViewModel({ rows, onApply: apply, disabled }),
			{ initialProps: { disabled: true } },
		);
		act(() => result.current.toggle("a"));
		await act(async () => result.current.apply());
		expect(apply).not.toHaveBeenCalled();
		rerender({ disabled: false });
		act(() => {
			result.current.toggle("b");
			result.current.toggle("unknown");
			result.current.toggle("a");
		});
		await act(async () => result.current.apply());
		expect(apply).not.toHaveBeenCalled();
		act(() => result.current.toggle("a"));
		await act(async () => result.current.apply());
		expect(apply).toHaveBeenCalledOnce();
		apply.mock.calls[0][0][0].values.name = "changed";
		expect(rows[0].values.name).toBe("A");
		act(() => result.current.toggle("a"));
		await act(async () => result.current.apply());
		expect(apply).toHaveBeenCalledOnce();
	});
	it("locks while applying, handles non-Error failure and supports retry", async () => {
		let reject: (e: unknown) => void = () => {};
		const { result } = renderHook(() =>
			useDiffTableViewModel({
				rows,
				onApply: () =>
					new Promise((_, no) => {
						reject = no;
					}),
			}),
		);
		act(() => {
			void result.current.apply();
		});
		act(() => result.current.toggle("a"));
		expect(result.current.selected).toHaveLength(1);
		await act(async () => reject("bad"));
		expect(result.current.error).toContain("Try again");
		expect(result.current.status).toBe("editing");
	});
	it.each([true, false])("ignores async settlement after unmount success=%s", async (success) => {
		let settle: (e?: unknown) => void = () => {};
		const { result, unmount } = renderHook(() =>
			useDiffTableViewModel({
				rows,
				onApply: () =>
					new Promise<void>((yes, no) => {
						settle = success ? () => yes() : no;
					}),
			}),
		);
		act(() => {
			void result.current.apply();
		});
		unmount();
		await act(async () => settle("late"));
	});
});
