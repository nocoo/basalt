import { Check, ChevronDown } from "lucide-react";
import { useId, useRef } from "react";
import {
	RECOMMENDATION_CONFIDENCE,
	type RecommendationConfidence,
	type RecommendationOption,
} from "../models/recommendation";
import { cn } from "../utils/cn";
import { useHoverHighlight } from "../utils/use-hover-highlight";
import { useRecommendationCardViewModel } from "../viewmodels/use-recommendation-card";
import { Button } from "./button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { LayerCard } from "./layer-card";

export type { RecommendationConfidence, RecommendationOption } from "../models/recommendation";

export interface RecommendationCardProps {
	/** Caller-owned options with stable IDs. Remount with a new key for a new request. */
	options: readonly RecommendationOption[];
	/** Card heading. @default "Recommended action" */
	title?: string;
	/** Explicit acceptance; rejected promises keep the choice and allow retry. */
	onAccept: (option: RecommendationOption) => void | Promise<void>;
	disabled?: boolean;
	className?: string;
}

function Confidence({ value }: { value: RecommendationConfidence }) {
	const confidence = RECOMMENDATION_CONFIDENCE[value];
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center gap-basalt-1_5 text-xs",
				confidence.className,
			)}
		>
			<span aria-hidden="true" className="inline-flex items-center gap-basalt-0_5">
				{[0, 1, 2].map((bar) => (
					<span
						key={bar}
						className={cn(
							"h-basalt-2_5 w-basalt-1 rounded-full",
							bar < confidence.bars ? "bg-current" : "bg-basalt-border",
						)}
					/>
				))}
			</span>
			{confidence.label}
		</span>
	);
}

export function RecommendationCard({
	title = "Recommended action",
	className,
	...props
}: RecommendationCardProps) {
	const vm = useRecommendationCardViewModel(props);
	const id = useId();
	const highlightRef = useHoverHighlight();
	const alternativesRef = useRef<HTMLButtonElement>(null);
	return (
		<LayerCard
			padding="none"
			aria-labelledby={id}
			className={cn("w-full min-w-0 overflow-hidden", className)}
		>
			<div className="space-y-basalt-1_5 p-basalt-card-sm">
				<h3 id={id} className="text-sm font-medium">
					{title}
				</h3>
				{vm.active ? (
					<p
						key={vm.active.id}
						className="basalt-agent-reveal min-h-basalt-12 whitespace-pre-wrap break-words text-[13px] leading-[var(--basalt-line-relaxed)] text-basalt-muted-foreground"
					>
						{vm.active.description}
					</p>
				) : (
					<p className="text-sm text-basalt-muted-foreground" role="status">
						No recommendations yet
					</p>
				)}
			</div>
			{vm.active && (
				<Collapsible open={vm.open} onOpenChange={vm.setOpen}>
					<CollapsibleContent unstyled>
						<div className="border-t border-basalt-border p-basalt-menu-inset">
							<p className="px-basalt-menu-x py-basalt-1 text-xs text-basalt-muted-foreground">
								Other options
							</p>
							<div
								ref={highlightRef}
								className="basalt-hover-list"
								role="group"
								aria-label="Alternative recommendations"
							>
								{vm.others.map((option) => (
									<Button
										key={option.id}
										variant="ghost"
										disabled={vm.blocked || option.disabled}
										data-basalt-hover-item=""
										data-disabled={vm.blocked || option.disabled ? "" : undefined}
										onClick={() => {
											vm.select(option.id);
											alternativesRef.current?.focus();
										}}
										className="h-auto min-h-basalt-menu-row w-full justify-start whitespace-normal px-basalt-menu-x py-basalt-menu-y text-left hover:bg-transparent"
									>
										<span className="min-w-0 flex-1 break-words text-[13px]">{option.label}</span>
										<Confidence value={option.confidence} />
									</Button>
								))}
							</div>
						</div>
					</CollapsibleContent>
					{vm.error && (
						<p role="alert" className="px-basalt-card-sm pb-basalt-2 text-xs text-basalt-danger">
							{vm.error}
						</p>
					)}
					<div className="flex flex-wrap items-center justify-between gap-basalt-2 border-t border-basalt-border p-basalt-card-sm">
						<Confidence value={vm.active.confidence} />
						<div className="flex items-center gap-basalt-2">
							{vm.others.length > 0 && (
								<CollapsibleTrigger asChild>
									<Button ref={alternativesRef} size="sm" variant="secondary" disabled={vm.blocked}>
										Alternatives
										<ChevronDown
											aria-hidden="true"
											className={cn(
												"transition-transform motion-reduce:transition-none",
												vm.open && "rotate-180",
											)}
										/>
									</Button>
								</CollapsibleTrigger>
							)}
							<Button
								size="sm"
								disabled={vm.blocked || vm.active.disabled || vm.accepted}
								loading={vm.pending}
								onClick={() => void vm.accept()}
							>
								{vm.accepted ? (
									<>
										<Check aria-hidden="true" />
										Accepted
									</>
								) : (
									(vm.active.actionLabel ?? "Accept")
								)}
							</Button>
						</div>
					</div>
					<span role="status" className="sr-only">
						{vm.accepted ? "Recommendation accepted" : vm.pending ? "Accepting recommendation" : ""}
					</span>
				</Collapsible>
			)}
		</LayerCard>
	);
}
