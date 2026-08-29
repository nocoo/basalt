import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { FOCUS_INSET } from "./overlay";

export const Collapsible = CollapsiblePrimitive.Root;

export const CollapsibleTrigger = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
	React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, children, asChild = false, ...props }, ref) => {
	if (asChild) {
		return (
			<CollapsiblePrimitive.CollapsibleTrigger ref={ref} asChild className={className} {...props}>
				{children}
			</CollapsiblePrimitive.CollapsibleTrigger>
		);
	}
	return (
		<CollapsiblePrimitive.CollapsibleTrigger
			ref={ref}
			className={cn(
				"m-0 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-base font-medium text-basalt-foreground shadow-none select-none",
				FOCUS_INSET,
				"[&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:origin-center [&_svg]:transition-transform [&_svg]:duration-100 [&_svg]:ease-out",
				"data-[state=open]:[&_svg]:rotate-180",
				className,
			)}
			{...props}
		>
			<span>{children}</span>
			<ChevronDown aria-hidden="true" />
		</CollapsiblePrimitive.CollapsibleTrigger>
	);
});
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName;

export const CollapsibleContent = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
	React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, children, ...props }, ref) => (
	<CollapsiblePrimitive.CollapsibleContent
		ref={ref}
		className={cn(
			"overflow-hidden data-[state=closed]:animate-basalt-collapsible-up data-[state=open]:animate-basalt-collapsible-down",
			className,
		)}
		{...props}
	>
		<div className="my-2 border-l-2 border-basalt-border py-1 pr-1 pl-4 text-base text-basalt-foreground">
			{children}
		</div>
	</CollapsiblePrimitive.CollapsibleContent>
));
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName;
