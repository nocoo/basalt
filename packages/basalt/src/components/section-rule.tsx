import { Info } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export type SectionRuleProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
	/** Compact label with a rule, or a reading-focused section heading. @default "label" */
	variant?: "label" | "heading";
	/** Section heading; the label variant includes a trailing rule. */
	title: ReactNode;
	/** Info tooltip beside the title. */
	hint?: ReactNode;
	/** Actions aligned to the end of the heading row. */
	actions?: ReactNode;
};

export function SectionRule({
	title,
	hint,
	actions,
	className,
	children,
	variant = "label",
	...props
}: SectionRuleProps) {
	return (
		<section
			className={cn(
				BASALT_UI_CLASS,
				variant === "heading" ? "space-y-basalt-layout" : "space-y-basalt-layout-sm",
				className,
			)}
			{...props}
		>
			<div className="flex flex-wrap items-center gap-basalt-layout-sm">
				<div className="flex min-w-0 max-w-full items-center gap-basalt-space-md">
					<h2
						className={
							variant === "heading"
								? "font-basalt-display text-basalt-2xl font-semibold tracking-tight text-basalt-foreground [overflow-wrap:anywhere]"
								: "text-basalt-sm font-medium tracking-wider text-basalt-muted-foreground uppercase"
						}
					>
						{title}
					</h2>
					{hint ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										aria-label="More information"
										className="inline-flex size-basalt-icon-lg shrink-0 items-center justify-center text-basalt-muted-foreground hover:text-basalt-foreground"
									>
										<Info className="size-basalt-icon" />
									</button>
								</TooltipTrigger>
								<TooltipContent>{hint}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : null}
				</div>
				{variant === "label" ? (
					<div
						className="h-px min-w-basalt-4 flex-1 border-t border-dashed border-basalt-border"
						aria-hidden="true"
					/>
				) : null}
				{actions ? (
					<div className="ml-auto flex min-w-0 max-w-full shrink-0 flex-wrap items-center justify-end gap-basalt-space-lg">
						{actions}
					</div>
				) : null}
			</div>
			{children}
		</section>
	);
}
