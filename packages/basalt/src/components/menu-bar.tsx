import * as MenubarPrimitive from "@radix-ui/react-menubar";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { MENU_GAP, overlayItemClass, overlayPanelClass } from "./overlay";

type RadixMenubarProps = React.ComponentProps<typeof MenubarPrimitive.Root>;
type RadixMenubarMenuProps = React.ComponentProps<typeof MenubarPrimitive.Menu>;
type RadixMenubarTriggerProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>;
type RadixMenubarContentProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>;
type RadixMenubarItemProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item>;

export interface MenuBarProps
	extends Omit<
		RadixMenubarProps,
		"value" | "defaultValue" | "onValueChange" | "loop" | "dir" | "asChild"
	> {
	/**
	 * Controlled value of the currently open menu.
	 */
	value?: RadixMenubarProps["value"];
	/**
	 * Uncontrolled initial value of the open menu.
	 * @default ""
	 */
	defaultValue?: RadixMenubarProps["defaultValue"];
	/**
	 * Callback invoked when the open menu value changes.
	 */
	onValueChange?: RadixMenubarProps["onValueChange"];
	/**
	 * Whether keyboard navigation loops around when reaching ends.
	 * @default true
	 */
	loop?: RadixMenubarProps["loop"];
	/**
	 * Reading direction of the menubar.
	 * @default "ltr"
	 */
	dir?: RadixMenubarProps["dir"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * MenuBar forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixMenubarProps["asChild"];
}

export function MenuBar(props: MenuBarProps) {
	return <MenuBarRoot {...props} />;
}

export interface MenuBarMenuProps extends Omit<RadixMenubarMenuProps, "value"> {
	/**
	 * Unique identifier value for this menu within the menubar.
	 */
	value?: RadixMenubarMenuProps["value"];
}

export function MenuBarMenu(props: MenuBarMenuProps) {
	return <MenubarPrimitive.Menu {...props} />;
}

export interface MenuBarTriggerProps
	extends Omit<RadixMenubarTriggerProps, "disabled" | "asChild"> {
	/**
	 * Disable the menubar trigger button.
	 * @default false
	 */
	disabled?: RadixMenubarTriggerProps["disabled"];
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * Trigger forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixMenubarTriggerProps["asChild"];
}

export const MenuBarTrigger = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Trigger>,
	MenuBarTriggerProps
>(({ className, ...props }, ref) => (
	<MenubarPrimitive.Trigger
		ref={ref}
		className={cn(
			BASALT_UI_CLASS,
			"inline-flex h-8 items-center rounded-basalt-sm px-3 text-sm font-medium outline-hidden hover:bg-basalt-accent data-[state=open]:bg-basalt-accent",
			className,
		)}
		{...props}
	/>
));
MenuBarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

export interface MenuBarContentProps
	extends Omit<
		RadixMenubarContentProps,
		| "loop"
		| "side"
		| "sideOffset"
		| "align"
		| "alignOffset"
		| "avoidCollisions"
		| "collisionBoundary"
		| "collisionPadding"
		| "arrowPadding"
		| "sticky"
		| "hideWhenDetached"
		| "forceMount"
		| "asChild"
		| "onCloseAutoFocus"
		| "onEscapeKeyDown"
		| "onPointerDownOutside"
		| "onFocusOutside"
		| "onInteractOutside"
	> {
	/**
	 * Whether keyboard navigation loops around when reaching the start or end item.
	 * @default false
	 */
	loop?: RadixMenubarContentProps["loop"];
	/**
	 * Preferred placement side relative to the menu trigger.
	 * @default "bottom"
	 */
	side?: RadixMenubarContentProps["side"];
	/**
	 * Distance in pixels between trigger and floating content panel.
	 * @default 4
	 */
	sideOffset?: RadixMenubarContentProps["sideOffset"];
	/**
	 * Preferred alignment along the side axis.
	 * @default "start"
	 */
	align?: RadixMenubarContentProps["align"];
	/**
	 * Offset in pixels from the start or end alignment position.
	 * @default 0
	 */
	alignOffset?: RadixMenubarContentProps["alignOffset"];
	/**
	 * Whether to reposition content to avoid viewport boundary collisions.
	 * @default true
	 */
	avoidCollisions?: RadixMenubarContentProps["avoidCollisions"];
	/**
	 * Element or elements bounding boundary collision calculations.
	 * @default []
	 */
	collisionBoundary?: RadixMenubarContentProps["collisionBoundary"];
	/**
	 * Virtual padding from collision boundaries in pixels.
	 * @default 0
	 */
	collisionPadding?: RadixMenubarContentProps["collisionPadding"];
	/**
	 * Padding in pixels between popper arrow and floating panel edge.
	 * @default 0
	 */
	arrowPadding?: RadixMenubarContentProps["arrowPadding"];
	/**
	 * Sticky positioning behavior along the align axis when overflowing.
	 * @default "partial"
	 */
	sticky?: RadixMenubarContentProps["sticky"];
	/**
	 * Whether to hide content completely when trigger is fully occluded.
	 * @default false
	 */
	hideWhenDetached?: RadixMenubarContentProps["hideWhenDetached"];
	/**
	 * Force mounting content in DOM for external animation controls.
	 * When forceMount is true, the content remains mounted even when closed.
	 * The caller is responsible for visibility transitions and unmounting after animation completes.
	 */
	forceMount?: true;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Content forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixMenubarContentProps["asChild"];
	/**
	 * Callback fired when auto-focusing on close. Can be prevented.
	 */
	onCloseAutoFocus?: RadixMenubarContentProps["onCloseAutoFocus"];
	/**
	 * Callback fired when the Escape key is down on the dismissable layer. Can be prevented.
	 */
	onEscapeKeyDown?: RadixMenubarContentProps["onEscapeKeyDown"];
	/**
	 * Callback fired when a pointerdown event happens outside the bounds of the dismissable layer. Can be prevented.
	 */
	onPointerDownOutside?: RadixMenubarContentProps["onPointerDownOutside"];
	/**
	 * Callback fired when focus moves outside the bounds of the dismissable layer. Can be prevented.
	 */
	onFocusOutside?: RadixMenubarContentProps["onFocusOutside"];
	/**
	 * Callback fired when an interaction (pointerdown or focus) happens outside the bounds of the dismissable layer. Can be prevented.
	 */
	onInteractOutside?: RadixMenubarContentProps["onInteractOutside"];
}

export const MenuBarContent = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Content>,
	MenuBarContentProps
>(({ className, sideOffset = MENU_GAP, ...props }, ref) => (
	<MenubarPrimitive.Portal forceMount={props.forceMount}>
		<MenubarPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={overlayPanelClass(cn("min-w-40", className))}
			{...props}
		/>
	</MenubarPrimitive.Portal>
));
MenuBarContent.displayName = MenubarPrimitive.Content.displayName;

export interface MenuBarItemProps
	extends Omit<RadixMenubarItemProps, "disabled" | "onSelect" | "textValue" | "asChild"> {
	/**
	 * Disable the menubar item.
	 * @default false
	 */
	disabled?: RadixMenubarItemProps["disabled"];
	/**
	 * Event handler called when the menubar item is selected (via click or keyboard).
	 */
	onSelect?: RadixMenubarItemProps["onSelect"];
	/**
	 * Optional text used for typeahead navigation. By default typeahead uses item text content.
	 */
	textValue?: RadixMenubarItemProps["textValue"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Item forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixMenubarItemProps["asChild"];
}

export const MenuBarItem = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Item>,
	MenuBarItemProps
>(({ className, ...props }, ref) => (
	<MenubarPrimitive.Item
		ref={ref}
		className={overlayItemClass(cn("relative outline-hidden focus:bg-basalt-accent", className))}
		{...props}
	/>
));
MenuBarItem.displayName = MenubarPrimitive.Item.displayName;

export interface MenuBarRootProps extends MenuBarProps {}

export function MenuBarRoot({ className, ...props }: MenuBarRootProps) {
	return (
		<MenubarPrimitive.Root
			className={cn(
				BASALT_UI_CLASS,
				"flex h-9 items-center gap-0.5 rounded-basalt-md border border-basalt-border bg-basalt-popover px-1",
				className,
			)}
			{...props}
		/>
	);
}
