import { Check, CircleAlert, FileText, Pencil, Sparkles, Terminal } from "lucide-react";
import type { ToolDiff, ToolStep } from "../models/agent-feedback";
import { cn } from "../utils/cn";
import { useHoverHighlight } from "../utils/use-hover-highlight";
import { useToolChipsViewModel } from "../viewmodels/use-tool-chips";
import { Button } from "./button";
import { CodeBlock } from "./code";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Loader } from "./loader";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "./popover";

export type { ToolDiff, ToolStep } from "../models/agent-feedback";
export interface ToolChipsProps {
	/** Caller-owned tool activity; statuses never advance automatically. */
	steps: readonly ToolStep[];
	diffs?: readonly ToolDiff[];
	title?: string;
	/** Start with the tool list expanded. @default true */
	defaultOpen?: boolean;
	className?: string;
}
const ICONS = { think: Sparkles, read: FileText, write: Pencil, run: Terminal };

export function ToolChips({
	steps,
	diffs = [],
	title,
	defaultOpen = true,
	className,
}: ToolChipsProps) {
	const vm = useToolChipsViewModel(steps, defaultOpen);
	const highlightRef = useHoverHighlight();
	return (
		<Collapsible
			open={vm.open}
			onOpenChange={vm.setOpen}
			className={cn(
				"basalt-ui w-full space-y-basalt-content-gap leading-[var(--basalt-line-body)]",
				className,
			)}
		>
			<CollapsibleTrigger className="rounded-basalt-sm px-basalt-row-x py-basalt-control-y text-basalt-muted-foreground">
				<span role="status">{title ?? `${vm.total} tool calls · ${vm.completed} complete`}</span>
			</CollapsibleTrigger>
			<CollapsibleContent
				ref={highlightRef}
				unstyled
				className="basalt-hover-list space-y-basalt-space-sm"
			>
				{steps.map((step) => {
					const Icon = ICONS[step.kind];
					return (
						<Collapsible
							key={step.id}
							open={vm.expanded.includes(step.id)}
							onOpenChange={(next) => vm.setExpanded(step.id, next)}
							className="basalt-agent-reveal"
						>
							<CollapsibleTrigger
								data-basalt-hover-item=""
								data-hover-selected={vm.expanded.includes(step.id)}
								aria-label={[step.label, step.target, step.status].filter(Boolean).join(" ")}
								className="w-full min-h-basalt-control items-start justify-between rounded-basalt-sm px-basalt-row-x py-basalt-row-y leading-basalt-row [&>svg]:mt-[calc((var(--basalt-line-row)-var(--basalt-size-icon-sm))/2)]"
							>
								<span className="flex min-w-0 items-start gap-basalt-row-gap text-basalt-base leading-basalt-row">
									<span className="flex h-[var(--basalt-line-row)] w-basalt-icon-lg shrink-0 items-center justify-center">
										<Icon aria-hidden="true" className="size-basalt-icon-lg" strokeWidth={1.5} />
									</span>
									<span className="flex min-w-0 flex-wrap items-center gap-x-basalt-row-gap">
										<span>{step.label}</span>
										{step.target && (
											<span className="max-w-full truncate font-mono text-basalt-code text-basalt-muted-foreground">
												{step.target}
											</span>
										)}
									</span>
									<span
										role="img"
										aria-label={step.status}
										className="flex h-[var(--basalt-line-row)] w-basalt-icon-sm shrink-0 items-center justify-center"
									>
										{step.status === "running" ? (
											<Loader size={12} showLabel={false} showElapsed={false} aria-hidden="true" />
										) : step.status === "complete" ? (
											<Check size={12} />
										) : step.status === "error" ? (
											<CircleAlert size={12} className="text-basalt-danger" />
										) : null}
									</span>
								</span>
							</CollapsibleTrigger>
							<CollapsibleContent
								unstyled
								className="pl-basalt-row-content pr-basalt-row-x pb-basalt-row-y"
							>
								<p className="whitespace-pre-wrap break-words text-basalt-code text-basalt-muted-foreground">
									{step.detail || "No output yet"}
								</p>
							</CollapsibleContent>
						</Collapsible>
					);
				})}
				{steps.length === 0 && (
					<p className="px-basalt-row-x py-basalt-space-lg text-basalt-sm text-basalt-muted-foreground">
						No tool calls yet
					</p>
				)}
				<div className="flex flex-wrap gap-basalt-content-gap px-basalt-row-x">
					{diffs.map((diff) => (
						<Popover key={diff.file}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									aria-label={`${diff.file} +${diff.added} -${diff.removed}`}
								>
									<span className="font-mono text-basalt-sm">{diff.file}</span>
									<span className="text-basalt-primary">+{diff.added}</span>
									<span className="text-basalt-danger">-{diff.removed}</span>
								</Button>
							</PopoverTrigger>
							<PopoverContent arrow={false} className="max-w-[calc(100vw-2rem)]">
								<PopoverTitle>{diff.file}</PopoverTitle>
								<CodeBlock className="mt-basalt-space-lg max-h-basalt-64 text-basalt-sm">
									{diff.content || "No diff preview available"}
								</CodeBlock>
							</PopoverContent>
						</Popover>
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
