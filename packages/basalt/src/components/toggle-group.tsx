import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import * as React from "react";
import { cn } from "../utils/cn";

export const ToggleGroup = React.forwardRef<
	React.ElementRef<typeof ToggleGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
	<ToggleGroupPrimitive.Root
		ref={ref}
		className={cn(
			"inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full bg-basalt-muted p-0.5 ring-1 ring-basalt-border/70",
			className,
		)}
		{...props}
	/>
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

export const ToggleGroupItem = React.forwardRef<
	React.ElementRef<typeof ToggleGroupPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
	<ToggleGroupPrimitive.Item
		ref={ref}
		className={cn(
			"inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-semibold tracking-wide text-basalt-muted-foreground transition-colors",
			"hover:text-basalt-foreground outline-hidden focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-basalt-ring",
			"data-[state=on]:bg-basalt-primary data-[state=on]:text-basalt-primary-foreground data-[state=on]:shadow-sm",
			"disabled:pointer-events-none disabled:opacity-50",
			className,
		)}
		{...props}
	/>
));
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
