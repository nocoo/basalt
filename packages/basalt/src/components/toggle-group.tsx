import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import * as React from "react";
import { cn } from "../utils/cn";

export const ToggleGroup = React.forwardRef<
	React.ElementRef<typeof ToggleGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
	<ToggleGroupPrimitive.Root
		ref={ref}
		className={cn("inline-flex items-center gap-1", className)}
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
			"inline-flex h-9 items-center rounded-basalt-md px-3 text-sm data-[state=on]:bg-basalt-accent",
			className,
		)}
		{...props}
	/>
));
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
