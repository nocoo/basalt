import * as MenubarPrimitive from "@radix-ui/react-menubar";
import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

export function MenuBar(props: ComponentProps<typeof MenubarPrimitive.Root>) {
	return <MenubarPrimitive.Root {...props} />;
}

export function MenuBarMenu(props: ComponentProps<typeof MenubarPrimitive.Menu>) {
	return <MenubarPrimitive.Menu {...props} />;
}

export function MenuBarTrigger(props: ComponentProps<typeof MenubarPrimitive.Trigger>) {
	return <MenubarPrimitive.Trigger {...props} />;
}

export function MenuBarContent(props: ComponentProps<typeof MenubarPrimitive.Content>) {
	return <MenubarPrimitive.Content {...props} />;
}

export function MenuBarItem(props: ComponentProps<typeof MenubarPrimitive.Item>) {
	return <MenubarPrimitive.Item {...props} />;
}

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
