import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";
import { cn } from "../utils/cn";

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export const HoverCardContent = React.forwardRef<
	React.ElementRef<typeof HoverCardPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, ...props }, ref) => (
	<HoverCardPrimitive.Content
		ref={ref}
		className={cn(
			"z-50 w-64 rounded-basalt-md border border-basalt-border bg-basalt-popover p-4 text-basalt-popover-foreground shadow-md",
			className,
		)}
		{...props}
	/>
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;
