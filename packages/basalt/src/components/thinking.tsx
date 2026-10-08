import { Check, Circle, CircleAlert, Code, Search, Sparkles } from "lucide-react";
import type { ThinkingStep, ThinkingVariant } from "../models/agent-feedback";
import { cn } from "../utils/cn";
import { useThinkingViewModel } from "../viewmodels/use-thinking";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Loader } from "./loader";

export type { ThinkingStep, ThinkingVariant } from "../models/agent-feedback";
export interface ThinkingProps {
	/** Caller-owned trace steps; the component never executes work. */
	steps: readonly ThinkingStep[];
	/** Trace presentation. @default "steps" */
	variant?: ThinkingVariant;
	/** Override the derived status title. */
	title?: string;
	open?: boolean;
	/** Initially expand the trace. @default true */
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	className?: string;
}

export function Thinking({ steps, variant = "steps", title, className, ...props }: ThinkingProps) {
	const vm = useThinkingViewModel({ steps, ...props });
	const Icon = variant === "search" ? Search : variant === "coding" ? Code : Sparkles;
	const heading =
		title ??
		(vm.status === "error"
			? "Needs attention"
			: vm.status === "complete"
				? "Thinking complete"
				: vm.status === "running"
					? "Thinking"
					: "Waiting");
	return (
		<Collapsible
			open={vm.open}
			onOpenChange={vm.setOpen}
			className={cn(
				"basalt-ui w-full text-basalt-base leading-[var(--basalt-line-body)] text-basalt-foreground",
				className,
			)}
		>
			<CollapsibleTrigger className="rounded-basalt-sm px-basalt-row-x py-basalt-control-y text-basalt-muted-foreground">
				<span className="inline-flex min-w-0 flex-wrap items-center gap-basalt-row-gap">
					<Icon aria-hidden="true" className="size-basalt-icon-lg shrink-0" strokeWidth={1.5} />
					<span role="status" className={cn(vm.status === "running" && "basalt-shimmer-label")}>
						{heading}
					</span>
					<span className="text-basalt-sm tabular-nums text-basalt-muted-foreground">
						{vm.completed}/{vm.total}
					</span>
				</span>
			</CollapsibleTrigger>
			<CollapsibleContent unstyled>
				<ol
					aria-label="Thinking steps"
					className="ml-[calc(var(--basalt-space-row-x)+var(--basalt-size-icon-lg)/2)] space-y-basalt-content-gap border-l border-basalt-border py-basalt-space-lg pl-[calc(var(--basalt-size-icon-lg)/2+var(--basalt-space-row-gap))] pr-basalt-row-x"
				>
					{steps.map((step) => (
						<li
							key={step.id}
							data-step-status={step.status}
							className="basalt-agent-reveal flex items-start gap-basalt-row-gap"
						>
							<span
								className="flex h-[var(--basalt-line-body)] w-basalt-icon-lg shrink-0 items-center justify-center text-basalt-muted-foreground"
								role="img"
								aria-label={step.status}
							>
								{step.status === "running" ? (
									<Loader size={12} showLabel={false} showElapsed={false} aria-hidden="true" />
								) : step.status === "complete" ? (
									<Check size={14} />
								) : step.status === "error" ? (
									<CircleAlert size={14} className="text-basalt-danger" />
								) : (
									<Circle size={12} />
								)}
							</span>
							<div className="min-w-0">
								<p className={cn("text-basalt-code", variant === "coding" && "font-mono")}>
									{step.label}
								</p>
								{step.detail && (
									<p className="mt-basalt-space-sm whitespace-pre-wrap break-words text-basalt-sm leading-[var(--basalt-line-body)] text-basalt-muted-foreground">
										{step.detail}
									</p>
								)}
							</div>
						</li>
					))}
					{steps.length === 0 && (
						<li className="text-basalt-sm text-basalt-muted-foreground">No steps yet</li>
					)}
				</ol>
			</CollapsibleContent>
		</Collapsible>
	);
}
