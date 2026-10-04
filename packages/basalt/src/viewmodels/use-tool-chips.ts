import { useState } from "react";
import { summarizeSteps, type ToolStep } from "../models/agent-feedback";

export function useToolChipsViewModel(steps: readonly ToolStep[], defaultOpen: boolean) {
	const [open, setOpen] = useState(defaultOpen);
	const [expanded, setExpanded] = useState<string[]>([]);
	return {
		...summarizeSteps(steps),
		open,
		setOpen,
		expanded,
		setExpanded(id: string, next: boolean) {
			setExpanded((current) =>
				next ? [...new Set([...current, id])] : current.filter((value) => value !== id),
			);
		},
	};
}
