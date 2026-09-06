import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";
import { cn } from "../utils/cn";
import { MENU_GAP, overlayItemClass, overlayPanelClass } from "./overlay";

type RadixDropdownMenuProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>;
type RadixDropdownMenuTriggerProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Trigger
>;
type RadixDropdownMenuGroupProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Group
>;
type RadixDropdownMenuPortalProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Portal
>;
type RadixDropdownMenuSubProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Sub>;
type RadixDropdownMenuRadioGroupProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.RadioGroup
>;
type RadixDropdownMenuContentProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Content
>;
type RadixDropdownMenuItemProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>;

export interface DropdownMenuProps
	extends Omit<
		RadixDropdownMenuProps,
		"open" | "defaultOpen" | "onOpenChange" | "dir" | "modal" | "children"
	> {
	/**
	 * Structure elements comprising the dropdown menu, typically trigger and content.
	 */
	children?: React.ReactNode;
	/**
	 * The controlled open state of the dropdown menu.
	 */
	open?: RadixDropdownMenuProps["open"];
	/**
	 * The uncontrolled initial open state of the dropdown menu.
	 * @default false
	 */
	defaultOpen?: RadixDropdownMenuProps["defaultOpen"];
	/**
	 * Called when the open state changes.
	 */
	onOpenChange?: RadixDropdownMenuProps["onOpenChange"];
	/**
	 * The reading direction of the dropdown menu. Inherited from DirectionProvider if present,
	 * or defaults to "ltr".
	 * @default "ltr"
	 */
	dir?: RadixDropdownMenuProps["dir"];
	/**
	 * The modality of the dropdown menu. When set to true, interaction with outside elements
	 * will be disabled and only menu content will be visible to screen readers.
	 * @default true
	 */
	modal?: RadixDropdownMenuProps["modal"];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = DropdownMenuPrimitive.Root;

export interface DropdownMenuTriggerProps
	extends Omit<RadixDropdownMenuTriggerProps, "asChild" | "children"> {
	/**
	 * Trigger element content.
	 */
	children?: React.ReactNode;
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * DropdownMenuTrigger forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixDropdownMenuTriggerProps["asChild"];
}

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export interface DropdownMenuGroupProps
	extends Omit<RadixDropdownMenuGroupProps, "asChild" | "children"> {
	/**
	 * Menu items or elements grouped together.
	 */
	children?: React.ReactNode;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * DropdownMenuGroup forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixDropdownMenuGroupProps["asChild"];
}

export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export interface DropdownMenuPortalProps
	extends Omit<RadixDropdownMenuPortalProps, "container" | "forceMount" | "children"> {
	/**
	 * Content to render into the portal target.
	 */
	children?: React.ReactNode;
	/**
	 * Specify a container element to portal the content into.
	 * Note: Only controls direct portal children; does not override the destination
	 * container of the built-in portal inside DropdownMenuContent.
	 */
	container?: RadixDropdownMenuPortalProps["container"];
	/**
	 * Used to force mounting when more control is needed. Useful when
	 * controlling animation with React animation libraries.
	 */
	forceMount?: RadixDropdownMenuPortalProps["forceMount"];
}

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export interface DropdownMenuSubProps
	extends Omit<RadixDropdownMenuSubProps, "open" | "defaultOpen" | "onOpenChange" | "children"> {
	/**
	 * Submenu structure elements.
	 * Note: Basalt does not export styled DropdownMenuSubTrigger or DropdownMenuSubContent components;
	 * compose with underlying Radix primitives when building nested submenus.
	 */
	children?: React.ReactNode;
	/**
	 * The controlled open state of the submenu.
	 */
	open?: RadixDropdownMenuSubProps["open"];
	/**
	 * The uncontrolled initial open state of the submenu.
	 * @default false
	 */
	defaultOpen?: RadixDropdownMenuSubProps["defaultOpen"];
	/**
	 * Event handler called when the open state of the submenu changes.
	 */
	onOpenChange?: RadixDropdownMenuSubProps["onOpenChange"];
}

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export interface DropdownMenuRadioGroupProps
	extends Omit<
		RadixDropdownMenuRadioGroupProps,
		"value" | "onValueChange" | "asChild" | "children"
	> {
	/**
	 * Radio item elements grouped together.
	 * Note: Basalt does not export styled DropdownMenuRadioItem or indicator components;
	 * compose with underlying Radix primitives when building radio selection groups.
	 */
	children?: React.ReactNode;
	/**
	 * The value of the currently selected radio item.
	 */
	value?: RadixDropdownMenuRadioGroupProps["value"];
	/**
	 * Event handler called when the value changes.
	 */
	onValueChange?: RadixDropdownMenuRadioGroupProps["onValueChange"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * DropdownMenuRadioGroup forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixDropdownMenuRadioGroupProps["asChild"];
}

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export interface DropdownMenuContentProps
	extends Omit<
		RadixDropdownMenuContentProps,
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
		| "updatePositionStrategy"
		| "loop"
		| "onCloseAutoFocus"
		| "onEscapeKeyDown"
		| "onPointerDownOutside"
		| "onFocusOutside"
		| "onInteractOutside"
		| "forceMount"
		| "asChild"
	> {
	/**
	 * Preferred placement side relative to trigger.
	 * @default "bottom"
	 */
	side?: RadixDropdownMenuContentProps["side"];
	/**
	 * Distance in pixels between trigger and floating content panel.
	 * In Basalt, defaults to MENU_GAP (8).
	 * @default 8
	 */
	sideOffset?: RadixDropdownMenuContentProps["sideOffset"];
	/**
	 * Preferred alignment along the side axis.
	 * @default "center"
	 */
	align?: RadixDropdownMenuContentProps["align"];
	/**
	 * Offset in pixels from the start or end alignment position.
	 * @default 0
	 */
	alignOffset?: RadixDropdownMenuContentProps["alignOffset"];
	/**
	 * Whether to reposition content to avoid viewport boundary collisions.
	 * @default true
	 */
	avoidCollisions?: RadixDropdownMenuContentProps["avoidCollisions"];
	/**
	 * Element or elements bounding boundary collision calculations.
	 * @default []
	 */
	collisionBoundary?: RadixDropdownMenuContentProps["collisionBoundary"];
	/**
	 * Virtual padding from collision boundaries in pixels.
	 * @default 0
	 */
	collisionPadding?: RadixDropdownMenuContentProps["collisionPadding"];
	/**
	 * Padding in pixels between popper arrow and floating panel edge.
	 * @default 0
	 */
	arrowPadding?: RadixDropdownMenuContentProps["arrowPadding"];
	/**
	 * Sticky positioning behavior along the align axis when overflowing.
	 * @default "partial"
	 */
	sticky?: RadixDropdownMenuContentProps["sticky"];
	/**
	 * Whether to hide content completely when trigger is fully occluded.
	 * @default false
	 */
	hideWhenDetached?: RadixDropdownMenuContentProps["hideWhenDetached"];
	/**
	 * Strategy used to calculate and update popper position.
	 * @default "optimized"
	 */
	updatePositionStrategy?: RadixDropdownMenuContentProps["updatePositionStrategy"];
	/**
	 * Whether keyboard navigation should loop around item boundaries.
	 * @default false
	 */
	loop?: RadixDropdownMenuContentProps["loop"];
	/**
	 * Callback fired when auto-focusing on close. Can be prevented.
	 */
	onCloseAutoFocus?: RadixDropdownMenuContentProps["onCloseAutoFocus"];
	/**
	 * Callback fired when the Escape key is down on the content layer. Can be prevented.
	 */
	onEscapeKeyDown?: RadixDropdownMenuContentProps["onEscapeKeyDown"];
	/**
	 * Callback fired when a pointerdown event happens outside the bounds of the content. Can be prevented.
	 */
	onPointerDownOutside?: RadixDropdownMenuContentProps["onPointerDownOutside"];
	/**
	 * Callback fired when focus moves outside the bounds of the content. Can be prevented.
	 */
	onFocusOutside?: RadixDropdownMenuContentProps["onFocusOutside"];
	/**
	 * Callback fired when an interaction (pointerdown or focus) happens outside the bounds of the content. Can be prevented.
	 */
	onInteractOutside?: RadixDropdownMenuContentProps["onInteractOutside"];
	/**
	 * Force mounting content in DOM for external animation controls.
	 * When forceMount is true, the content remains mounted even when closed.
	 * The caller is responsible for visibility transitions and unmounting after animation completes.
	 * Note: Keeping modal content forceMounted may isolate background interactions until unmounted.
	 */
	forceMount?: true;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * DropdownMenuContent forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixDropdownMenuContentProps["asChild"];
}

export const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	DropdownMenuContentProps
>(({ className, sideOffset = MENU_GAP, ...props }, ref) => (
	<DropdownMenuPrimitive.Portal forceMount={props.forceMount}>
		<DropdownMenuPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={overlayPanelClass(cn("min-w-40", className))}
			{...props}
		/>
	</DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

export interface DropdownMenuItemProps
	extends Omit<RadixDropdownMenuItemProps, "disabled" | "onSelect" | "textValue" | "asChild"> {
	/**
	 * Disable the menu item.
	 * @default false
	 */
	disabled?: RadixDropdownMenuItemProps["disabled"];
	/**
	 * Event handler called when the menu item is selected (via click or keyboard).
	 * Note that this is a Radix CustomEvent, not native DOM onSelect.
	 */
	onSelect?: RadixDropdownMenuItemProps["onSelect"];
	/**
	 * Optional text used for typeahead navigation. By default typeahead uses item text content.
	 */
	textValue?: RadixDropdownMenuItemProps["textValue"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * DropdownMenuItem forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixDropdownMenuItemProps["asChild"];
}

export const DropdownMenuItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	DropdownMenuItemProps
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Item
		ref={ref}
		className={overlayItemClass(
			cn(
				"relative outline-hidden focus:bg-basalt-accent data-disabled:pointer-events-none data-disabled:opacity-50",
				className,
			),
		)}
		{...props}
	/>
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
