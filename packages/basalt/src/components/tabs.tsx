import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { cn } from "../utils/cn";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn("flex flex-wrap items-center gap-1 border-b border-basalt-border", className)}
		{...props}
	/>
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"-mb-px inline-flex items-center justify-center border-b-2 border-transparent px-3 py-2 text-sm font-medium text-basalt-muted-foreground transition-colors hover:text-basalt-foreground data-[state=active]:border-basalt-primary data-[state=active]:text-basalt-primary",
			className,
		)}
		{...props}
	/>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn("mt-3 text-sm text-basalt-foreground", className)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
