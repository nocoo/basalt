import { Info } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
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
		<section className={cn(BASALT_UI_CLASS, "space-y-basalt-layout-sm", className)} {...props}>
			<div className="flex flex-wrap items-center gap-basalt-layout-sm">
				<div className="flex min-w-0 items-center gap-basalt-space-md">
					<h2 className="text-basalt-sm font-medium tracking-wider text-basalt-muted-foreground uppercase">
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
				<div
					className="h-px min-w-basalt-4 flex-1 border-t border-dashed border-basalt-border"
					aria-hidden="true"
				/>
				{actions ? (
					<div className="flex min-w-0 max-w-full shrink-0 flex-wrap items-center justify-end gap-basalt-space-lg">
						{actions}
					</div>
				) : null}
			</div>
			{children}
		</section>
	);
}
