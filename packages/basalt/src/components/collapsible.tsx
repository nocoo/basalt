import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";
import { cn } from "../utils/cn";

export const Collapsible = CollapsiblePrimitive.Root;

export const CollapsibleTrigger = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
	React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, ...props }, ref) => (
	<CollapsiblePrimitive.CollapsibleTrigger
		ref={ref}
		className={cn("inline-flex items-center", className)}
		{...props}
	/>
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName;

export const CollapsibleContent = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
	React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, ...props }, ref) => (
	<CollapsiblePrimitive.CollapsibleContent
		ref={ref}
		className={cn("pt-2 text-sm leading-6 text-basalt-foreground", className)}
		{...props}
	/>
));
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName;
