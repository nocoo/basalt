import { useState } from "react";
import { summarizeSteps, type ThinkingStep } from "../models/agent-feedback";

export function useThinkingViewModel({
	steps,
	open,
	defaultOpen = true,
	onOpenChange,
}: {
	steps: readonly ThinkingStep[];
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const [localOpen, setLocalOpen] = useState(defaultOpen);
	return {
		...summarizeSteps(steps),
		open: open ?? localOpen,
		setOpen(next: boolean) {
			setLocalOpen(next);
			onOpenChange?.(next);
		},
	};
}
