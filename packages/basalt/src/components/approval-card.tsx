import { ChevronLeft, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
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
	const options = useRef<HTMLDivElement | null>(null);
	const submitted = useRef<HTMLParagraphElement | null>(null);
	const highlightRef = useHoverHighlight(options);
	useEffect(() => {
		if (!vm.focusToken) return;
		const active = document.activeElement;
		// A control the user is still holding stays put; a removed or disabled one hands off to the question.
		if (
			active instanceof HTMLElement &&
			active !== document.body &&
			active.isConnected &&
			!active.matches(":disabled, [aria-disabled='true']")
		)
			return;
		options.current
			?.querySelector<HTMLElement>(
				'[role="radio"]:not([disabled]), [role="checkbox"]:not([disabled])',
			)
			?.focus();
	}, [vm.focusToken]);
	useEffect(() => {
		if (vm.status === "submitted") submitted.current?.focus();
	}, [vm.status]);
	const question = vm.question;
	if (!question)
		return (
			<LayerCard padding="sm" className={className}>
				<p className="text-basalt-base text-basalt-muted-foreground">No approval questions</p>
			</LayerCard>
		);
	if (vm.status === "submitted")
		return (
			<LayerCard padding="sm" className={className}>
				<p ref={submitted} tabIndex={-1} role="status" className="text-basalt-base">
					Answers submitted
				</p>
			</LayerCard>
		);
	const busy = vm.status === "submitting";
	return (
		<LayerCard
			padding="sm"
			className={cn(
				"w-full space-y-basalt-content-gap px-basalt-panel-x py-basalt-panel-y leading-[var(--basalt-line-body)]",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-basalt-content-gap">
				<h3 id={id} className="text-basalt-base font-medium" aria-live="polite">
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
				className="basalt-agent-reveal basalt-hover-list -mx-basalt-row-x space-y-basalt-content-gap"
			>
				{question.type === "single" ? (
					<Radio.Group
						value={vm.answer?.selected[0] ?? ""}
						onValueChange={vm.choose}
						disabled={busy}
						aria-labelledby={id}
						className="gap-basalt-space-xs"
					>
						{question.options.map((option) => (
							<label
								key={option.id}
								data-basalt-hover-item=""
								data-hover-selected={vm.answer?.selected.includes(option.id)}
								data-disabled={option.disabled || busy ? "" : undefined}
								htmlFor={`${id}-${option.id}`}
								className="flex cursor-pointer items-center gap-basalt-row-gap rounded-basalt-sm px-basalt-row-x py-basalt-row-y text-basalt-code leading-basalt-row"
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
					<fieldset disabled={busy} aria-labelledby={id} className="space-y-basalt-space-xs">
						{question.options.map((option) => (
							<label
								key={option.id}
								data-basalt-hover-item=""
								data-hover-selected={vm.answer?.selected.includes(option.id)}
								data-disabled={option.disabled || busy ? "" : undefined}
								htmlFor={`${id}-${option.id}`}
								className="flex cursor-pointer items-center gap-basalt-row-gap rounded-basalt-sm px-basalt-row-x py-basalt-row-y text-basalt-code leading-basalt-row"
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
						className="ml-basalt-row-x w-[calc(100%-2*var(--basalt-space-row-x))]"
						value={vm.answer?.custom ?? ""}
						disabled={busy}
						onChange={(event) => vm.setCustom(event.target.value)}
					/>
				)}
			</div>
			{vm.error && (
				<p role="alert" className="text-basalt-sm text-basalt-danger">
					{vm.error}
				</p>
			)}
			<div className="flex items-center justify-between gap-basalt-content-gap border-t border-basalt-border pt-basalt-space-lg">
				<div className="flex items-center gap-basalt-content-gap">
					<Button
						variant="ghost"
						size="icon"
						className="-ml-[calc((var(--basalt-size-action)-var(--basalt-size-icon))/2)]"
						aria-label="Previous question"
						disabled={busy || vm.position === 0}
						onClick={() => vm.move(vm.position - 1)}
					>
						<ChevronLeft />
					</Button>
					<span className="text-basalt-sm tabular-nums text-basalt-muted-foreground">
						{vm.position + 1} / {props.questions.length}
					</span>
				</div>
				<div className="flex gap-basalt-content-gap">
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
