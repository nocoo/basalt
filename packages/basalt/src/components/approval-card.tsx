import { ChevronLeft, X } from "lucide-react";
import { useId } from "react";
import type { ApprovalAnswers, ApprovalQuestion } from "../models/agent-feedback";
import { cn } from "../utils/cn";
import { useHoverHighlight } from "../utils/use-hover-highlight";
import { useApprovalCardViewModel } from "../viewmodels/use-approval-card";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { LayerCard } from "./layer-card";
import { Radio } from "./radio";

export type { ApprovalAnswer, ApprovalAnswers, ApprovalQuestion } from "../models/agent-feedback";
export interface ApprovalCardProps {
	/** Stable question and option IDs. Remount with a new key for a new request. */
	questions: readonly ApprovalQuestion[];
	/** Submit answers; a rejected promise keeps answers and shows retry feedback. */
	onSubmit: (answers: ApprovalAnswers) => void | Promise<void>;
	/** Enable automatic progression after a single selection. Never auto-submits. @default true */
	autoAdvance?: boolean;
	onDismiss?: () => void;
	className?: string;
}

export function ApprovalCard({ className, onDismiss, ...props }: ApprovalCardProps) {
	const vm = useApprovalCardViewModel(props);
	const id = useId();
	const highlightRef = useHoverHighlight();
	const question = vm.question;
	if (!question)
		return (
			<LayerCard padding="sm" className={className}>
				<p className="text-sm text-basalt-muted-foreground">No approval questions</p>
			</LayerCard>
		);
	if (vm.status === "submitted")
		return (
			<LayerCard padding="sm" className={className}>
				<p role="status" className="text-sm">
					Answers submitted
				</p>
			</LayerCard>
		);
	const busy = vm.status === "submitting";
	return (
		<LayerCard padding="sm" className={cn("w-full space-y-basalt-2", className)}>
			<div className="flex items-start justify-between gap-basalt-3">
				<h3 id={id} className="text-sm font-medium" aria-live="polite">
					{question.label}
				</h3>
				{onDismiss && (
					<Button
						variant="ghost"
						size="icon"
						aria-label="Dismiss approval"
						disabled={busy}
						onClick={onDismiss}
					>
						<X />
					</Button>
				)}
			</div>
			<div
				key={question.id}
				ref={highlightRef}
				className="basalt-agent-reveal basalt-hover-list space-y-basalt-2"
			>
				{question.type === "single" ? (
					<Radio.Group
						value={vm.answer?.selected[0] ?? ""}
						onValueChange={vm.choose}
						disabled={busy}
						aria-labelledby={id}
						className="gap-basalt-0_5"
					>
						{question.options.map((option) => (
							<label
								key={option.id}
								data-basalt-hover-item=""
								data-hover-selected={vm.answer?.selected.includes(option.id)}
								data-disabled={option.disabled || busy ? "" : undefined}
								htmlFor={`${id}-${option.id}`}
								className="flex cursor-pointer items-center gap-basalt-2 rounded-basalt-sm px-basalt-2 py-basalt-1_5 text-[13px]"
							>
								<Radio.Item
									id={`${id}-${option.id}`}
									value={option.id}
									disabled={option.disabled}
								/>
								{option.label}
							</label>
						))}
					</Radio.Group>
				) : (
					<fieldset disabled={busy} aria-labelledby={id} className="space-y-basalt-0_5">
						{question.options.map((option) => (
							<label
								key={option.id}
								data-basalt-hover-item=""
								data-hover-selected={vm.answer?.selected.includes(option.id)}
								data-disabled={option.disabled || busy ? "" : undefined}
								htmlFor={`${id}-${option.id}`}
								className="flex cursor-pointer items-center gap-basalt-2 rounded-basalt-sm px-basalt-2 py-basalt-1_5 text-[13px]"
							>
								<Checkbox
									id={`${id}-${option.id}`}
									checked={vm.answer?.selected.includes(option.id) ?? false}
									onCheckedChange={() => vm.choose(option.id)}
									disabled={option.disabled}
								/>
								{option.label}
							</label>
						))}
					</fieldset>
				)}
				{question.allowCustom && (
					<Input
						aria-label="Custom answer"
						placeholder="Something else..."
						value={vm.answer?.custom ?? ""}
						disabled={busy}
						onChange={(event) => vm.setCustom(event.target.value)}
					/>
				)}
			</div>
			{vm.error && (
				<p role="alert" className="text-xs text-basalt-danger">
					{vm.error}
				</p>
			)}
			<div className="flex items-center justify-between gap-basalt-2 border-t border-basalt-border pt-basalt-2">
				<div className="flex items-center gap-basalt-2">
					<Button
						variant="ghost"
						size="icon"
						aria-label="Previous question"
						disabled={busy || vm.position === 0}
						onClick={() => vm.move(vm.position - 1)}
					>
						<ChevronLeft />
					</Button>
					<span className="text-xs tabular-nums text-basalt-muted-foreground">
						{vm.position + 1} / {props.questions.length}
					</span>
				</div>
				<div className="flex gap-basalt-2">
					{question.required === false && (
						<Button variant="ghost" size="sm" disabled={busy} onClick={vm.skip}>
							Skip
						</Button>
					)}
					<Button size="sm" loading={busy} disabled={!vm.canContinue || busy} onClick={vm.continue}>
						{vm.last ? "Submit" : "Continue"}
					</Button>
				</div>
			</div>
		</LayerCard>
	);
}
