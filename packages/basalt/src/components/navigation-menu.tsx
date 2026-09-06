import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import type * as React from "react";
import { cn } from "../utils/cn";

type RadixNavigationMenuProps = React.ComponentProps<typeof NavigationMenuPrimitive.Root>;
type RadixNavigationMenuListProps = React.ComponentProps<typeof NavigationMenuPrimitive.List>;
type RadixNavigationMenuItemProps = React.ComponentProps<typeof NavigationMenuPrimitive.Item>;
type RadixNavigationMenuLinkProps = React.ComponentProps<typeof NavigationMenuPrimitive.Link>;

export interface NavigationMenuProps
	extends Omit<
		RadixNavigationMenuProps,
		| "value"
		| "defaultValue"
		| "onValueChange"
		| "dir"
		| "orientation"
		| "delayDuration"
		| "skipDelayDuration"
		| "asChild"
	> {
	/**
	 * Controlled value of the currently active navigation item.
	 */
	value?: RadixNavigationMenuProps["value"];
	/**
	 * Uncontrolled initial active navigation item value.
	 */
	defaultValue?: RadixNavigationMenuProps["defaultValue"];
	/**
	 * Callback invoked when active navigation item value changes.
	 */
	onValueChange?: RadixNavigationMenuProps["onValueChange"];
	/**
	 * Reading direction of the navigation menu. Inherits from nearest DirectionProvider or ltr.
	 * @default "ltr"
	 */
	dir?: RadixNavigationMenuProps["dir"];
	/**
	 * Orientation of the navigation menu items and keyboard navigation axis.
	 * @default "horizontal"
	 */
	orientation?: RadixNavigationMenuProps["orientation"];
	/**
	 * Duration in milliseconds from pointer entering trigger until menu opens.
	 * @default 200
	 */
	delayDuration?: RadixNavigationMenuProps["delayDuration"];
	/**
	 * Duration in milliseconds to move between triggers without re-triggering delay.
	 * @default 300
	 */
	skipDelayDuration?: RadixNavigationMenuProps["skipDelayDuration"];
	/**
	 * Change the default rendered nav element to the child element, merging props and behavior.
	 * NavigationMenu forwards ref to HTMLElement and inherits native nav attributes.
	 * @default false
	 */
	asChild?: RadixNavigationMenuProps["asChild"];
}

export const NavigationMenu = NavigationMenuPrimitive.Root;

export interface NavigationMenuListProps extends Omit<RadixNavigationMenuListProps, "asChild"> {
	/**
	 * Change the default rendered ul element to the child element, merging props and behavior.
	 * NavigationMenuList forwards ref to HTMLUListElement and inherits native ul attributes.
	 * @default false
	 */
	asChild?: RadixNavigationMenuListProps["asChild"];
}

export const NavigationMenuList = NavigationMenuPrimitive.List;

export interface NavigationMenuItemProps
	extends Omit<RadixNavigationMenuItemProps, "value" | "asChild"> {
	/**
	 * Unique value that associates the item with sub-navigation state.
	 */
	value?: RadixNavigationMenuItemProps["value"];
	/**
	 * Change the default rendered li element to the child element, merging props and behavior.
	 * NavigationMenuItem forwards ref to HTMLLIElement and inherits native li attributes.
	 * @default false
	 */
	asChild?: RadixNavigationMenuItemProps["asChild"];
}

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

export interface NavigationMenuLinkProps
	extends Omit<RadixNavigationMenuLinkProps, "active" | "onSelect" | "asChild"> {
	/**
	 * Whether the link represents the currently active destination.
	 * Adds data-active attribute for styling.
	 * @default false
	 */
	active?: RadixNavigationMenuLinkProps["active"];
	/**
	 * Event handler called when the navigation link is selected via pointer or keyboard.
	 */
	onSelect?: RadixNavigationMenuLinkProps["onSelect"];
	/**
	 * Change the default rendered anchor element to the child element, merging props and behavior.
	 * NavigationMenuLink forwards ref to HTMLAnchorElement and inherits native anchor attributes.
	 * @default false
	 */
	asChild?: RadixNavigationMenuLinkProps["asChild"];
}

export function NavigationMenuLink({ className, ...props }: NavigationMenuLinkProps) {
	return (
		<NavigationMenuPrimitive.Link
			className={cn("rounded-basalt-md px-3 py-2 text-sm hover:bg-basalt-accent", className)}
			{...props}
		/>
	);
}
