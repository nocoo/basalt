import { useEffect, useRef, useState } from "react";
import { type DiffTableRow, selectedDiffRows } from "../models/diff-table";

export function useDiffTableViewModel({
	rows,
	onApply,
	disabled = false,
}: {
	rows: readonly DiffTableRow[];
	onApply: (changes: readonly DiffTableRow[]) => void | Promise<void>;
	disabled?: boolean;
}) {
	const [excluded, setExcluded] = useState<string[]>([]);
	const [status, setStatus] = useState<"editing" | "applying" | "applied">("editing");
	const [error, setError] = useState("");
	const locked = useRef(false);
	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const selected = selectedDiffRows(rows, excluded);
	return {
		excluded,
		selected,
		status,
		error,
		blocked: disabled || status !== "editing",
		additions: selected.filter((row) => row.change === "add").length,
		removals: selected.filter((row) => row.change === "remove").length,
		toggle(id: string) {
			if (
				disabled ||
				locked.current ||
				status === "applied" ||
				!rows.some((row) => row.id === id && row.change !== "unchanged")
			)
				return;
			setExcluded((current) =>
				current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
			);
			setError("");
		},
		async apply() {
			if (disabled || locked.current || status === "applied" || selected.length === 0) return;
			locked.current = true;
			setStatus("applying");
			setError("");
			try {
				await onApply(selected.map((row) => ({ ...row, values: { ...row.values } })));
				if (mounted.current) setStatus("applied");
			} catch (reason) {
				if (mounted.current) {
					setError(
						reason instanceof Error ? reason.message : "Could not apply changes. Try again.",
					);
					setStatus("editing");
				}
			} finally {
				locked.current = false;
			}
		},
	};
}
