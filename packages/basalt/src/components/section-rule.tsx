import { Info } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export type SectionRuleProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
	/** Section title shown before the dashed rule. */
	title: ReactNode;
	/** Info tooltip beside the title. */
	hint?: ReactNode;
	/** Actions on the right of the dashed rule. */
	actions?: ReactNode;
};

export function SectionRule({
	title,
	hint,
	actions,
	className,
	children,
	...props
}: SectionRuleProps) {
	return (
		<section className={cn("space-y-3", className)} {...props}>
			<div className="flex items-center gap-3">
				<div className="flex min-w-0 items-center gap-1.5">
					<h2 className="text-xs font-medium tracking-wider text-basalt-muted-foreground uppercase">
						{title}
					</h2>
					{hint ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										aria-label="More information"
										className="inline-flex size-4 shrink-0 items-center justify-center text-basalt-muted-foreground hover:text-basalt-foreground"
									>
										<Info className="size-3.5" />
									</button>
								</TooltipTrigger>
								<TooltipContent>{hint}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : null}
				</div>
				<div
					className="h-px min-w-4 flex-1 border-t border-dashed border-basalt-border"
					aria-hidden="true"
				/>
				{actions ? (
					<div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
				) : null}
			</div>
			{children}
		</section>
	);
}
