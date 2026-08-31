import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { cn } from "../utils/cn";
import { useSelectionIndicator } from "../utils/selection-indicator";

function measureTabUnderline(item: HTMLElement): {
	left: number;
	width: number;
	top: number;
	height: number;
} {
	return {
		left: item.offsetLeft,
		width: item.offsetWidth,
		top: item.offsetTop + item.offsetHeight,
		height: 0,
	};
}

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { showIndicator?: boolean }
>(({ className, children, showIndicator = true, ...props }, ref) => {
	const {
		ref: listRef,
		state,
		motionClassName,
	} = useSelectionIndicator({
		itemSelector: '[role="tab"][data-state="active"]',
		enabled: showIndicator,
		mapGeometry: measureTabUnderline,
		ref,
	});

	return (
		<TabsPrimitive.List
			ref={listRef}
			className={cn(
				"relative flex flex-wrap items-center gap-1 border-b border-basalt-border",
				className,
			)}
			{...props}
		>
			{children}
			{showIndicator ? (
				<span
					aria-hidden="true"
					data-slot="selection-indicator"
					className={cn("pointer-events-none absolute h-0.5 bg-basalt-primary", motionClassName)}
					style={{
						left: state.left,
						width: state.visible ? state.width : 0,
						top: state.top,
					}}
				/>
			) : null}
		</TabsPrimitive.List>
	);
});
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-basalt-muted-foreground transition-colors hover:text-basalt-foreground data-[state=active]:text-basalt-primary",
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
		className={cn(
			"mt-3 text-sm text-basalt-foreground data-[state=active]:animate-basalt-tab-in",
			className,
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
