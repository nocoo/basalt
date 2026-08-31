import * as LabelPrimitive from "@radix-ui/react-label";
import { Info } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
	/**
	 * Show gray (optional) after the label.
	 * @default false
	 */
	showOptional?: boolean;
	/** Info icon with hover text. */
	tooltip?: React.ReactNode;
};

export const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
	({ className, children, showOptional = false, tooltip, ...props }, ref) => (
		<LabelPrimitive.Root
			ref={ref}
			className={cn(
				"inline-flex items-center gap-1 text-sm font-medium leading-none text-basalt-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
				className,
			)}
			{...props}
		>
			{children}
			{showOptional ? (
				<span className="font-normal text-basalt-muted-foreground">(optional)</span>
			) : null}
			{tooltip ? (
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
						<TooltipContent>{tooltip}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			) : null}
		</LabelPrimitive.Root>
	),
);
Label.displayName = LabelPrimitive.Root.displayName;
