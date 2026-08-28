import * as MenubarPrimitive from "@radix-ui/react-menubar";
import * as React from "react";
import { cn } from "../utils/cn";

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
>(({ className, ...props }, ref) => (
	<MenubarPrimitive.Portal>
		<MenubarPrimitive.Content
			ref={ref}
			className={cn(
				"z-50 min-w-40 overflow-hidden rounded-basalt-md border border-basalt-border bg-basalt-popover p-1 text-sm text-basalt-popover-foreground shadow-md",
				className,
			)}
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
		className={cn(
			"relative flex h-8 cursor-default items-center rounded-basalt-sm px-2 text-sm outline-hidden select-none focus:bg-basalt-accent",
			className,
		)}
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
