import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuContent = ContextMenuPrimitive.Content;
export const ContextMenuItem = ContextMenuPrimitive.Item;

export function ContextMenuPanel({
	className,
	...props
}: ComponentProps<typeof ContextMenuPrimitive.Content>) {
	return (
		<ContextMenuPrimitive.Content
			className={cn(
				"z-50 min-w-[8rem] rounded-basalt-md border border-basalt-border bg-basalt-popover p-1 shadow-md",
				className,
			)}
			{...props}
		/>
	);
}
