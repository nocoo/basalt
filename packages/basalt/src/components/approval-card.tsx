import { ChevronLeft, X } from "lucide-react";
import { useId } from "react";
import type { ApprovalAnswers, ApprovalQuestion } from "../models/agent-feedback";
import { cn } from "../utils/cn";
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
	const question = vm.question;
	if (!question)
		return (
			<LayerCard className={className}>
				<p className="text-sm text-basalt-muted-foreground">No approval questions</p>
			</LayerCard>
		);
	if (vm.status === "submitted")
		return (
			<LayerCard className={className}>
				<p role="status" className="text-sm">
					Answers submitted
				</p>
			</LayerCard>
		);
	const busy = vm.status === "submitting";
	return (
		<LayerCard className={cn("w-full space-y-4", className)}>
			<div className="flex items-start justify-between gap-3">
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
			<div key={question.id} className="basalt-agent-reveal space-y-3">
				{question.type === "single" ? (
					<Radio.Group
						value={vm.answer?.selected[0] ?? ""}
						onValueChange={vm.choose}
						disabled={busy}
						aria-labelledby={id}
					>
						{question.options.map((option) => (
							<label
								key={option.id}
								htmlFor={`${id}-${option.id}`}
								className="flex cursor-pointer items-center gap-2 rounded-basalt-sm px-2 py-2 text-sm hover:bg-basalt-accent"
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
					<fieldset disabled={busy} aria-labelledby={id} className="space-y-1">
						{question.options.map((option) => (
							<label
								key={option.id}
								htmlFor={`${id}-${option.id}`}
								className="flex cursor-pointer items-center gap-2 rounded-basalt-sm px-2 py-2 text-sm hover:bg-basalt-accent"
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
			<div className="flex items-center justify-between gap-2 border-t border-basalt-border pt-3">
				<div className="flex items-center gap-2">
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
				<div className="flex gap-2">
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
