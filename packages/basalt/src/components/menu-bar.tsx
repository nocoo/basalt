import * as MenubarPrimitive from "@radix-ui/react-menubar";
import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

export const MenuBar = MenubarPrimitive.Root;
export const MenuBarMenu = MenubarPrimitive.Menu;
export const MenuBarTrigger = MenubarPrimitive.Trigger;
export const MenuBarContent = MenubarPrimitive.Content;
export const MenuBarItem = MenubarPrimitive.Item;

export function MenuBarRoot({ className, ...props }: ComponentProps<typeof MenubarPrimitive.Root>) {
	return (
		<MenubarPrimitive.Root
			className={cn(
				"flex h-9 items-center gap-1 rounded-basalt-md border border-basalt-border bg-basalt-secondary px-1",
				className,
			)}
			{...props}
		/>
	);
}
