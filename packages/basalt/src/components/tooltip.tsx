import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { cn } from "../utils/cn";

export type TooltipProps = Omit<
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>,
	"delayDuration"
> & {
	/**
	 * Delay before the tooltip opens, in milliseconds.
	 * @default 700
	 */
	delayDuration?: number;
};

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip: React.FC<TooltipProps> = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
	React.ElementRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
	<TooltipPrimitive.Content
		ref={ref}
		sideOffset={sideOffset}
		className={cn(
			"z-50 overflow-hidden rounded-basalt-md border border-basalt-border bg-basalt-popover px-3 py-1.5 text-sm text-basalt-popover-foreground shadow-md",
			className,
		)}
		{...props}
	/>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
