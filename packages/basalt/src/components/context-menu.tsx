import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import * as React from "react";
import { cn } from "../utils/cn";
import { overlayItemClass, overlayPanelClass } from "./overlay";

type RadixContextMenuProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root>;
type RadixContextMenuTriggerProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.Trigger
>;
type RadixContextMenuContentProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.Content
>;
type RadixContextMenuItemProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>;

export interface ContextMenuProps
	extends Omit<RadixContextMenuProps, "open" | "onOpenChange" | "dir" | "modal"> {
	/**
	 * Controlled open state of the context menu.
	 * When set to true before pointer trigger interaction, positions at the top-left of the viewport.
	 */
	open?: RadixContextMenuProps["open"];
	/**
	 * Callback invoked when open state changes.
	 */
	onOpenChange?: RadixContextMenuProps["onOpenChange"];
	/**
	 * The reading direction of the context menu.
	 * @default "ltr"
	 */
	dir?: RadixContextMenuProps["dir"];
	/**
	 * Whether the context menu is modal, preventing outside interactions.
	 * @default true
	 */
	modal?: RadixContextMenuProps["modal"];
}

export const ContextMenu = ContextMenuPrimitive.Root;

export interface ContextMenuTriggerProps
	extends Omit<RadixContextMenuTriggerProps, "disabled" | "asChild"> {
	/**
	 * Disable the context menu trigger from opening on right-click.
	 * @default false
	 */
	disabled?: RadixContextMenuTriggerProps["disabled"];
	/**
	 * Change the default rendered span element to the child element, merging props and behavior.
	 * Trigger forwards ref to HTMLSpanElement and inherits native span attributes.
	 * @default false
	 */
	asChild?: RadixContextMenuTriggerProps["asChild"];
}

export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

export interface ContextMenuContentProps
	extends Omit<
		RadixContextMenuContentProps,
		| "loop"
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
	 * Whether keyboard navigation should loop around item boundaries.
	 * @default false
	 */
	loop?: RadixContextMenuContentProps["loop"];
	/**
	 * Offset in pixels from the start or end alignment position.
	 * @default 0
	 */
	alignOffset?: RadixContextMenuContentProps["alignOffset"];
	/**
	 * Whether to reposition content to avoid viewport boundary collisions.
	 * @default true
	 */
	avoidCollisions?: RadixContextMenuContentProps["avoidCollisions"];
	/**
	 * Element or elements bounding boundary collision calculations.
	 * @default []
	 */
	collisionBoundary?: RadixContextMenuContentProps["collisionBoundary"];
	/**
	 * Virtual padding from collision boundaries in pixels.
	 * @default 0
	 */
	collisionPadding?: RadixContextMenuContentProps["collisionPadding"];
	/**
	 * Padding in pixels between popper arrow and floating panel edge.
	 * @default 0
	 */
	arrowPadding?: RadixContextMenuContentProps["arrowPadding"];
	/**
	 * Sticky positioning behavior along the align axis when overflowing.
	 * @default "partial"
	 */
	sticky?: RadixContextMenuContentProps["sticky"];
	/**
	 * Whether to hide content completely when trigger is fully occluded.
	 * @default false
	 */
	hideWhenDetached?: RadixContextMenuContentProps["hideWhenDetached"];
	/**
	 * Force mounting content in DOM for external animation controls.
	 * Note: Bare ContextMenuContent mounts directly without a built-in Portal wrapper.
	 */
	forceMount?: true;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Content forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixContextMenuContentProps["asChild"];
	/**
	 * Callback fired when auto-focusing on close. Can be prevented.
	 */
	onCloseAutoFocus?: RadixContextMenuContentProps["onCloseAutoFocus"];
	/**
	 * Callback fired when the Escape key is down on the dismissable layer. Can be prevented.
	 */
	onEscapeKeyDown?: RadixContextMenuContentProps["onEscapeKeyDown"];
	/**
	 * Callback fired when a pointerdown event happens outside the bounds of the dismissable layer. Can be prevented.
	 */
	onPointerDownOutside?: RadixContextMenuContentProps["onPointerDownOutside"];
	/**
	 * Callback fired when focus moves outside the bounds of the dismissable layer. Can be prevented.
	 */
	onFocusOutside?: RadixContextMenuContentProps["onFocusOutside"];
	/**
	 * Callback fired when an interaction (pointerdown or focus) happens outside the bounds of the dismissable layer. Can be prevented.
	 */
	onInteractOutside?: RadixContextMenuContentProps["onInteractOutside"];
}

export const ContextMenuContent = ContextMenuPrimitive.Content;

export interface ContextMenuItemProps
	extends Omit<RadixContextMenuItemProps, "disabled" | "onSelect" | "textValue" | "asChild"> {
	/**
	 * Disable the context menu item.
	 * @default false
	 */
	disabled?: RadixContextMenuItemProps["disabled"];
	/**
	 * Event handler called when the context menu item is selected (via click or keyboard).
	 */
	onSelect?: RadixContextMenuItemProps["onSelect"];
	/**
	 * Optional text used for typeahead navigation. By default typeahead uses item text content.
	 */
	textValue?: RadixContextMenuItemProps["textValue"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Item forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixContextMenuItemProps["asChild"];
}

export const ContextMenuItem = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.Item>,
	ContextMenuItemProps
>(({ className, ...props }, ref) => (
	<ContextMenuPrimitive.Item
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
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

export interface ContextMenuPanelProps
	extends Omit<
		React.ComponentProps<typeof ContextMenuPrimitive.Content>,
		| "loop"
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
	 * Whether keyboard navigation should loop around item boundaries.
	 * @default false
	 */
	loop?: RadixContextMenuContentProps["loop"];
	/**
	 * Offset in pixels from the start or end alignment position.
	 * @default 0
	 */
	alignOffset?: RadixContextMenuContentProps["alignOffset"];
	/**
	 * Whether to reposition content to avoid viewport boundary collisions.
	 * @default true
	 */
	avoidCollisions?: RadixContextMenuContentProps["avoidCollisions"];
	/**
	 * Element or elements bounding boundary collision calculations.
	 * @default []
	 */
	collisionBoundary?: RadixContextMenuContentProps["collisionBoundary"];
	/**
	 * Virtual padding from collision boundaries in pixels.
	 * @default 0
	 */
	collisionPadding?: RadixContextMenuContentProps["collisionPadding"];
	/**
	 * Padding in pixels between popper arrow and floating panel edge.
	 * @default 0
	 */
	arrowPadding?: RadixContextMenuContentProps["arrowPadding"];
	/**
	 * Sticky positioning behavior along the align axis when overflowing.
	 * @default "partial"
	 */
	sticky?: RadixContextMenuContentProps["sticky"];
	/**
	 * Whether to hide content completely when trigger is fully occluded.
	 * @default false
	 */
	hideWhenDetached?: RadixContextMenuContentProps["hideWhenDetached"];
	/**
	 * Force mounting content in DOM for external animation controls.
	 * When forceMount is true, the content remains mounted even when closed.
	 * The caller is responsible for visibility transitions and unmounting after animation completes.
	 * Note: Keeping modal content forceMounted may isolate background interactions until unmounted.
	 */
	forceMount?: true;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Content forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixContextMenuContentProps["asChild"];
	/**
	 * Callback fired when auto-focusing on close. Can be prevented.
	 */
	onCloseAutoFocus?: RadixContextMenuContentProps["onCloseAutoFocus"];
	/**
	 * Callback fired when the Escape key is down on the dismissable layer. Can be prevented.
	 */
	onEscapeKeyDown?: RadixContextMenuContentProps["onEscapeKeyDown"];
	/**
	 * Callback fired when a pointerdown event happens outside the bounds of the dismissable layer. Can be prevented.
	 */
	onPointerDownOutside?: RadixContextMenuContentProps["onPointerDownOutside"];
	/**
	 * Callback fired when focus moves outside the bounds of the dismissable layer. Can be prevented.
	 */
	onFocusOutside?: RadixContextMenuContentProps["onFocusOutside"];
	/**
	 * Callback fired when an interaction (pointerdown or focus) happens outside the bounds of the dismissable layer. Can be prevented.
	 */
	onInteractOutside?: RadixContextMenuContentProps["onInteractOutside"];
}

export function ContextMenuPanel({ className, ...props }: ContextMenuPanelProps) {
	return (
		<ContextMenuPrimitive.Portal forceMount={props.forceMount}>
			<ContextMenuPrimitive.Content
				className={overlayPanelClass(cn("min-w-40", className))}
				{...props}
			/>
		</ContextMenuPrimitive.Portal>
	);
}
