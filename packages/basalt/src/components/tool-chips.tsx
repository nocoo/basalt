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
			className={cn("w-full space-y-basalt-2", className)}
		>
			<CollapsibleTrigger className="rounded-basalt-sm px-basalt-1_5 py-basalt-1">
				<span role="status">{title ?? `${vm.total} tool calls · ${vm.completed} complete`}</span>
			</CollapsibleTrigger>
			<CollapsibleContent
				ref={highlightRef}
				unstyled
				className="basalt-hover-list space-y-basalt-1"
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
								aria-label={[step.label, step.target, step.status].filter(Boolean).join(" ")}
								className="w-full min-h-basalt-control justify-between rounded-basalt-sm px-basalt-2 py-basalt-1_5 [&_svg]:size-basalt-icon-lg"
							>
								<span className="flex min-w-0 flex-wrap items-center gap-basalt-2 text-sm">
									<Icon aria-hidden="true" />
									<span>{step.label}</span>
									{step.target && (
										<span className="truncate rounded-basalt-sm bg-basalt-control px-basalt-2 py-basalt-0_5 font-mono text-[13px] text-basalt-muted-foreground">
											{step.target}
										</span>
									)}
									<span role="img" aria-label={step.status}>
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
							<CollapsibleContent>
								<p className="whitespace-pre-wrap break-words text-[13px] text-basalt-muted-foreground">
									{step.detail || "No output yet"}
								</p>
							</CollapsibleContent>
						</Collapsible>
					);
				})}
				{steps.length === 0 && (
					<p className="px-basalt-2 py-basalt-3 text-xs text-basalt-muted-foreground">
						No tool calls yet
					</p>
				)}
				<div className="flex flex-wrap gap-basalt-2">
					{diffs.map((diff) => (
						<Popover key={diff.file}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									aria-label={`${diff.file} +${diff.added} -${diff.removed}`}
								>
									<span className="font-mono text-xs">{diff.file}</span>
									<span className="text-basalt-primary">+{diff.added}</span>
									<span className="text-basalt-danger">-{diff.removed}</span>
								</Button>
							</PopoverTrigger>
							<PopoverContent arrow={false} className="max-w-[calc(100vw-2rem)]">
								<PopoverTitle>{diff.file}</PopoverTitle>
								<CodeBlock className="mt-basalt-2 max-h-basalt-64 text-xs">
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
