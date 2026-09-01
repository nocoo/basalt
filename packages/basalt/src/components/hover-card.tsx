import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";
import { cn } from "../utils/cn";
import { MENU_GAP, OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export const HoverCardContent = React.forwardRef<
	React.ElementRef<typeof HoverCardPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, sideOffset = MENU_GAP, ...props }, ref) => (
	<HoverCardPrimitive.Portal>
		<HoverCardPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn(
				OVERLAY_LAYER,
				OVERLAY_MOTION,
				"w-64 rounded-basalt-md border border-basalt-border bg-basalt-popover p-4 text-basalt-popover-foreground shadow-md",
				className,
			)}
			{...props}
		/>
	</HoverCardPrimitive.Portal>
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;
