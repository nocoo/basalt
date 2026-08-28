import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import * as React from "react";
import { cn } from "../utils/cn";

export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuContent = ContextMenuPrimitive.Content;

export const ContextMenuItem = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
	<ContextMenuPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex h-8 cursor-default items-center rounded-basalt-sm px-2 text-sm outline-hidden select-none focus:bg-basalt-accent data-disabled:pointer-events-none data-disabled:opacity-50",
			className,
		)}
		{...props}
	/>
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

export function ContextMenuPanel({
	className,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
	return (
		<ContextMenuPrimitive.Content
			className={cn(
				"z-50 min-w-40 rounded-basalt-md border border-basalt-border bg-basalt-popover p-1 text-sm text-basalt-popover-foreground shadow-md",
				className,
			)}
			{...props}
		/>
	);
}
