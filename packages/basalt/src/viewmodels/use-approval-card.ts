import { useEffect, useRef, useState } from "react";
import {
	type ApprovalAnswers,
	type ApprovalQuestion,
	approvalSnapshot,
	validApprovalAnswer,
} from "../models/agent-feedback";

export function useApprovalCardViewModel({
	questions,
	onSubmit,
	autoAdvance = true,
}: {
	questions: readonly ApprovalQuestion[];
	onSubmit: (answers: ApprovalAnswers) => void | Promise<void>;
	autoAdvance?: boolean;
}) {
	const [index, setIndex] = useState(0);
	const [answers, setAnswers] = useState<ApprovalAnswers>({});
	const [status, setStatus] = useState<"editing" | "submitting" | "submitted">("editing");
	const [error, setError] = useState("");
	const locked = useRef(false);
	const mounted = useRef(true);
	const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const cancelAdvance = () => {
		clearTimeout(advanceTimer.current);
		advanceTimer.current = undefined;
	};
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			clearTimeout(advanceTimer.current);
		};
	}, []);
	const position = Math.min(index, Math.max(0, questions.length - 1));
	const question = questions[position];
	const answer = question ? answers[question.id] : undefined;
	const last = position === questions.length - 1;
	const canContinue = Boolean(question && validApprovalAnswer(question, answer));
	const move = (next: number) => {
		if (locked.current || questions.length === 0) return;
		cancelAdvance();
		setIndex(Math.min(Math.max(0, next), questions.length - 1));
		setError("");
	};
	const choose = (id: string) => {
		if (
			!question ||
			locked.current ||
			!question.options.some((option) => option.id === id && !option.disabled)
		)
			return;
		cancelAdvance();
		const selected = answer?.selected ?? [];
		setAnswers({
			...answers,
			[question.id]: {
				...answer,
				skipped: false,
				selected:
					question.type === "single"
						? [id]
						: selected.includes(id)
							? selected.filter((value) => value !== id)
							: [...selected, id],
			},
		});
		setError("");
		if (question.type === "single" && autoAdvance && !last)
			advanceTimer.current = setTimeout(() => setIndex(position + 1), 240);
	};
	const submit = async (nextAnswers: ApprovalAnswers) => {
		if (locked.current || questions.length === 0) return;
		const missing = questions.findIndex((item) => !validApprovalAnswer(item, nextAnswers[item.id]));
		if (missing >= 0) {
			setIndex(missing);
			return;
		}
		locked.current = true;
		setStatus("submitting");
		setError("");
		cancelAdvance();
		try {
			await onSubmit(approvalSnapshot(questions, nextAnswers));
			if (mounted.current) setStatus("submitted");
		} catch (reason) {
			if (mounted.current) {
				setError(reason instanceof Error ? reason.message : "Could not submit answers. Try again.");
				setStatus("editing");
			}
		} finally {
			locked.current = false;
		}
	};
	return {
		position,
		question,
		answer,
		status,
		error,
		canContinue,
		last,
		choose,
		move,
		setCustom(value: string) {
			if (!question?.allowCustom || locked.current) return;
			cancelAdvance();
			setAnswers({
				...answers,
				[question.id]: { selected: answer?.selected ?? [], custom: value },
			});
		},
		continue() {
			if (!canContinue || locked.current) return;
			if (last) void submit(answers);
			else move(position + 1);
		},
		skip() {
			if (question?.required !== false || locked.current) return;
			const next = { ...answers, [question.id]: { selected: [], skipped: true } };
			setAnswers(next);
			if (last) void submit(next);
			else move(position + 1);
		},
	};
}
