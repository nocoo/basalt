import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

export const NavigationMenu = NavigationMenuPrimitive.Root;
export const NavigationMenuList = NavigationMenuPrimitive.List;
export const NavigationMenuItem = NavigationMenuPrimitive.Item;

export function NavigationMenuLink({
	className,
	...props
}: ComponentProps<typeof NavigationMenuPrimitive.Link>) {
	return (
		<NavigationMenuPrimitive.Link
			className={cn("rounded-basalt-md px-3 py-2 text-sm hover:bg-basalt-accent", className)}
			{...props}
		/>
	);
}
