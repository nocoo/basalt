export type AgentStepStatus = "pending" | "running" | "complete" | "error";
export type ThinkingStep = { id: string; label: string; detail?: string; status: AgentStepStatus };
export type ThinkingVariant = "steps" | "reasoning" | "search" | "coding";
export type ToolStep = ThinkingStep & { kind: "think" | "read" | "write" | "run"; target?: string };
export type ToolDiff = { file: string; added: number; removed: number; content?: string };

export function summarizeSteps(steps: readonly ThinkingStep[]) {
	const completed = steps.filter((step) => step.status === "complete").length;
	const status: AgentStepStatus = steps.some((step) => step.status === "error")
		? "error"
		: steps.some((step) => step.status === "running")
			? "running"
			: steps.length > 0 && completed === steps.length
				? "complete"
				: "pending";
	return { completed, total: steps.length, status };
}

export type ApprovalQuestion = {
	id: string;
	label: string;
	type: "single" | "multiple";
	options: readonly { id: string; label: string; disabled?: boolean }[];
	/** Required questions cannot be skipped. @default true */
	required?: boolean;
	allowCustom?: boolean;
};
export type ApprovalAnswer = { selected: string[]; custom?: string; skipped?: boolean };
export type ApprovalAnswers = Record<string, ApprovalAnswer>;

export function validApprovalAnswer(
	question: ApprovalQuestion,
	answer: ApprovalAnswer | undefined,
) {
	const selected =
		answer?.selected.filter((id) =>
			question.options.some((option) => option.id === id && !option.disabled),
		) ?? [];
	const custom = question.allowCustom ? (answer?.custom?.trim() ?? "") : "";
	return (
		(question.type === "multiple" || selected.length <= 1) &&
		(selected.length > 0 ||
			custom.length > 0 ||
			(question.required === false && answer?.skipped === true))
	);
}

export function approvalSnapshot(
	questions: readonly ApprovalQuestion[],
	answers: ApprovalAnswers,
): ApprovalAnswers {
	return Object.fromEntries(
		questions.map((question) => {
			const answer = answers[question.id];
			const selected =
				answer?.selected.filter((id) =>
					question.options.some((option) => option.id === id && !option.disabled),
				) ?? [];
			return [
				question.id,
				{
					selected: question.type === "single" ? selected.slice(0, 1) : selected,
					...(question.allowCustom ? { custom: answer?.custom?.trim() ?? "" } : {}),
					...(answer?.skipped ? { skipped: true } : {}),
				},
			];
		}),
	);
}
