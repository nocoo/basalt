import * as MenubarPrimitive from "@radix-ui/react-menubar";
import * as React from "react";
import { cn } from "../utils/cn";
import { MENU_GAP, overlayItemClass, overlayPanelClass } from "./overlay";

export function MenuBar(props: React.ComponentProps<typeof MenubarPrimitive.Root>) {
	return <MenuBarRoot {...props} />;
}

export function MenuBarMenu(props: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
	return <MenubarPrimitive.Menu {...props} />;
}

export const MenuBarTrigger = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<MenubarPrimitive.Trigger
		ref={ref}
		className={cn(
			"inline-flex h-8 items-center rounded-basalt-sm px-3 text-sm font-medium outline-hidden hover:bg-basalt-accent data-[state=open]:bg-basalt-accent",
			className,
		)}
		{...props}
	/>
));
MenuBarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

export const MenuBarContent = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, sideOffset = MENU_GAP, ...props }, ref) => (
	<MenubarPrimitive.Portal>
		<MenubarPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={overlayPanelClass(cn("min-w-40", className))}
			{...props}
		/>
	</MenubarPrimitive.Portal>
));
MenuBarContent.displayName = MenubarPrimitive.Content.displayName;

export const MenuBarItem = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item>
>(({ className, ...props }, ref) => (
	<MenubarPrimitive.Item
		ref={ref}
		className={overlayItemClass(cn("relative outline-hidden focus:bg-basalt-accent", className))}
		{...props}
	/>
));
MenuBarItem.displayName = MenubarPrimitive.Item.displayName;

export function MenuBarRoot({
	className,
	...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
	return (
		<MenubarPrimitive.Root
			className={cn(
				"flex h-9 items-center gap-0.5 rounded-basalt-md border border-basalt-border bg-basalt-popover px-1",
				className,
			)}
			{...props}
		/>
	);
}
