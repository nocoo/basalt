import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import * as React from "react";
import { cn } from "../utils/cn";
import { Check, ChevronRight } from "../utils/internal-icons";
import {
	MENU_INDICATOR_SLOT_CLASS,
	MENU_PANEL_CLASS,
	menuCheckableItemClass,
	menuItemClass,
	menuLabelClass,
	menuSeparatorClass,
	menuShortcutClass,
} from "../utils/menu-surface";
import { overlayPanelClass } from "../utils/overlay";
import { useHoverHighlight } from "../utils/use-hover-highlight";

type RadixContextMenuProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root>;
type RadixContextMenuTriggerProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.Trigger
>;
type RadixContextMenuGroupProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Group>;
type RadixContextMenuPortalProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.Portal
>;
type RadixContextMenuSubProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Sub>;
type RadixContextMenuRadioGroupProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.RadioGroup
>;
type RadixContextMenuContentProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.Content
>;
type RadixContextMenuItemProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>;
type RadixContextMenuCheckboxItemProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.CheckboxItem
>;
type RadixContextMenuRadioItemProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.RadioItem
>;
type RadixContextMenuLabelProps = React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>;
type RadixContextMenuSeparatorProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.Separator
>;
type RadixContextMenuSubTriggerProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.SubTrigger
>;
type RadixContextMenuSubContentProps = React.ComponentPropsWithoutRef<
	typeof ContextMenuPrimitive.SubContent
>;

export interface ContextMenuProps
	extends Omit<RadixContextMenuProps, "open" | "onOpenChange" | "dir" | "modal"> {
	/**
	 * Controlled open state of the context menu.
	 * When set to true before pointer trigger interaction, positions at the top-left of the viewport.
	 */
	open?: RadixContextMenuProps["open"];
	/** Callback invoked when open state changes. */
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
	 * @default false
	 */
	asChild?: RadixContextMenuTriggerProps["asChild"];
}

export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

export interface ContextMenuGroupProps
	extends Omit<RadixContextMenuGroupProps, "asChild" | "children"> {
	/** Menu items or elements grouped together. */
	children?: React.ReactNode;
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixContextMenuGroupProps["asChild"];
}

export const ContextMenuGroup = ContextMenuPrimitive.Group;

export interface ContextMenuPortalProps
	extends Omit<RadixContextMenuPortalProps, "container" | "forceMount" | "children"> {
	/** Content to render into the portal target. */
	children?: React.ReactNode;
	/** Specify a container element to portal the content into. */
	container?: RadixContextMenuPortalProps["container"];
	/** Used to force mounting when more control is needed. */
	forceMount?: RadixContextMenuPortalProps["forceMount"];
}

export const ContextMenuPortal = ContextMenuPrimitive.Portal;

export interface ContextMenuSubProps
	extends Omit<RadixContextMenuSubProps, "open" | "defaultOpen" | "onOpenChange" | "children"> {
	/** Submenu trigger and content elements. */
	children?: React.ReactNode;
	/** Controlled open state of the submenu. */
	open?: RadixContextMenuSubProps["open"];
	/**
	 * Uncontrolled initial open state of the submenu.
	 * @default false
	 */
	defaultOpen?: RadixContextMenuSubProps["defaultOpen"];
	/** Callback invoked when the submenu open state changes. */
	onOpenChange?: RadixContextMenuSubProps["onOpenChange"];
}

export const ContextMenuSub = ContextMenuPrimitive.Sub;

export interface ContextMenuRadioGroupProps
	extends Omit<
		RadixContextMenuRadioGroupProps,
		"value" | "onValueChange" | "asChild" | "children"
	> {
	/** Radio item elements grouped together. */
	children?: React.ReactNode;
	/** Value of the currently selected radio item. */
	value?: RadixContextMenuRadioGroupProps["value"];
	/** Callback invoked when the selected value changes. */
	onValueChange?: RadixContextMenuRadioGroupProps["onValueChange"];
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixContextMenuRadioGroupProps["asChild"];
}

export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

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
	/** Force mounting content in DOM for external animation controls. */
	forceMount?: true;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixContextMenuContentProps["asChild"];
	/** Callback fired when auto-focusing on close. */
	onCloseAutoFocus?: RadixContextMenuContentProps["onCloseAutoFocus"];
	/** Callback fired when the Escape key is down on the dismissable layer. */
	onEscapeKeyDown?: RadixContextMenuContentProps["onEscapeKeyDown"];
	/** Callback fired when a pointerdown event happens outside the content. */
	onPointerDownOutside?: RadixContextMenuContentProps["onPointerDownOutside"];
	/** Callback fired when focus moves outside the content. */
	onFocusOutside?: RadixContextMenuContentProps["onFocusOutside"];
	/** Callback fired when pointer or focus interaction happens outside the content. */
	onInteractOutside?: RadixContextMenuContentProps["onInteractOutside"];
}

export const ContextMenuContent = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.Content>,
	ContextMenuContentProps
>(({ className, ...props }, ref) => {
	const highlightRef = useHoverHighlight(ref);
	return (
		<ContextMenuPrimitive.Portal forceMount={props.forceMount}>
			<ContextMenuPrimitive.Content
				ref={highlightRef}
				data-slot="context-menu-content"
				className={overlayPanelClass(cn(MENU_PANEL_CLASS, className))}
				{...props}
			/>
		</ContextMenuPrimitive.Portal>
	);
});
ContextMenuContent.displayName = "ContextMenuContent";

export interface ContextMenuItemProps
	extends Omit<RadixContextMenuItemProps, "disabled" | "onSelect" | "textValue" | "asChild"> {
	/**
	 * Visual emphasis of the menu item.
	 * @default "default"
	 */
	variant?: "default" | "destructive";
	/**
	 * Indent label to align with checkable items in the same menu.
	 * @default false
	 */
	inset?: boolean;
	/**
	 * Disable the context menu item.
	 * @default false
	 */
	disabled?: RadixContextMenuItemProps["disabled"];
	/** Event handler called when the context menu item is selected. */
	onSelect?: RadixContextMenuItemProps["onSelect"];
	/** Optional text used for typeahead navigation. */
	textValue?: RadixContextMenuItemProps["textValue"];
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixContextMenuItemProps["asChild"];
}

export const ContextMenuItem = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.Item>,
	ContextMenuItemProps
>(({ className, variant = "default", inset = false, ...props }, ref) => (
	<ContextMenuPrimitive.Item
		data-slot="context-menu-item"
		data-variant={variant}
		data-basalt-hover-item=""
		ref={ref}
		className={menuItemClass({ variant, inset, className })}
		{...props}
	/>
));
ContextMenuItem.displayName = "ContextMenuItem";

export interface ContextMenuCheckboxItemProps
	extends Omit<
		RadixContextMenuCheckboxItemProps,
		"checked" | "onCheckedChange" | "disabled" | "onSelect" | "textValue" | "asChild"
	> {
	/** Checked state of the item. */
	checked?: RadixContextMenuCheckboxItemProps["checked"];
	/** Callback invoked when the checked state changes. */
	onCheckedChange?: RadixContextMenuCheckboxItemProps["onCheckedChange"];
	/**
	 * Disable the checkbox item.
	 * @default false
	 */
	disabled?: RadixContextMenuCheckboxItemProps["disabled"];
	/** Event handler called when the item is selected. */
	onSelect?: RadixContextMenuCheckboxItemProps["onSelect"];
	/** Optional text used for typeahead navigation. */
	textValue?: RadixContextMenuCheckboxItemProps["textValue"];
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixContextMenuCheckboxItemProps["asChild"];
}

export const ContextMenuCheckboxItem = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
	ContextMenuCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => (
	<ContextMenuPrimitive.CheckboxItem
		ref={ref}
		data-slot="context-menu-checkbox-item"
		data-basalt-hover-item=""
		checked={checked}
		className={menuCheckableItemClass(className)}
		{...props}
	>
		{props.asChild ? (
			children
		) : (
			<>
				<span aria-hidden="true" className={MENU_INDICATOR_SLOT_CLASS}>
					<ContextMenuPrimitive.ItemIndicator>
						<Check className="size-basalt-icon-sm" aria-hidden="true" />
					</ContextMenuPrimitive.ItemIndicator>
				</span>
				{children}
			</>
		)}
	</ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export interface ContextMenuRadioItemProps
	extends Omit<
		RadixContextMenuRadioItemProps,
		"value" | "disabled" | "onSelect" | "textValue" | "asChild"
	> {
	/** Unique value associated with this radio item. */
	value: RadixContextMenuRadioItemProps["value"];
	/**
	 * Disable the radio item.
	 * @default false
	 */
	disabled?: RadixContextMenuRadioItemProps["disabled"];
	/** Event handler called when the radio item is selected. */
	onSelect?: RadixContextMenuRadioItemProps["onSelect"];
	/** Optional text used for typeahead navigation. */
	textValue?: RadixContextMenuRadioItemProps["textValue"];
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixContextMenuRadioItemProps["asChild"];
}

export const ContextMenuRadioItem = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
	ContextMenuRadioItemProps
>(({ className, children, ...props }, ref) => (
	<ContextMenuPrimitive.RadioItem
		ref={ref}
		data-slot="context-menu-radio-item"
		data-basalt-hover-item=""
		className={menuCheckableItemClass(className)}
		{...props}
	>
		{props.asChild ? (
			children
		) : (
			<>
				<span aria-hidden="true" className={MENU_INDICATOR_SLOT_CLASS}>
					<ContextMenuPrimitive.ItemIndicator>
						<span aria-hidden="true" className="size-basalt-1_5 rounded-basalt-full bg-current" />
					</ContextMenuPrimitive.ItemIndicator>
				</span>
				{children}
			</>
		)}
	</ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export interface ContextMenuLabelProps extends Omit<RadixContextMenuLabelProps, "asChild"> {
	/**
	 * Indent label to align with checkable menu items.
	 * @default false
	 */
	inset?: boolean;
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixContextMenuLabelProps["asChild"];
}

export const ContextMenuLabel = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.Label>,
	ContextMenuLabelProps
>(({ className, inset = false, ...props }, ref) => (
	<ContextMenuPrimitive.Label
		ref={ref}
		data-slot="context-menu-label"
		className={menuLabelClass(inset, className)}
		{...props}
	/>
));
ContextMenuLabel.displayName = "ContextMenuLabel";

export interface ContextMenuSeparatorProps extends Omit<RadixContextMenuSeparatorProps, "asChild"> {
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixContextMenuSeparatorProps["asChild"];
}

export const ContextMenuSeparator = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.Separator>,
	ContextMenuSeparatorProps
>(({ className, ...props }, ref) => (
	<ContextMenuPrimitive.Separator
		ref={ref}
		data-slot="context-menu-separator"
		className={menuSeparatorClass(className)}
		{...props}
	/>
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export interface ContextMenuSubTriggerProps
	extends Omit<RadixContextMenuSubTriggerProps, "disabled" | "textValue" | "asChild"> {
	/**
	 * Indent label to align with checkable menu items.
	 * @default false
	 */
	inset?: boolean;
	/**
	 * Disable the submenu trigger.
	 * @default false
	 */
	disabled?: RadixContextMenuSubTriggerProps["disabled"];
	/** Optional text used for typeahead navigation. */
	textValue?: RadixContextMenuSubTriggerProps["textValue"];
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixContextMenuSubTriggerProps["asChild"];
}

export const ContextMenuSubTrigger = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
	ContextMenuSubTriggerProps
>(({ className, inset = false, children, ...props }, ref) => (
	<ContextMenuPrimitive.SubTrigger
		ref={ref}
		data-slot="context-menu-sub-trigger"
		data-basalt-hover-item=""
		className={menuItemClass({ inset, className })}
		{...props}
	>
		{props.asChild ? (
			children
		) : (
			<>
				{children}
				<ChevronRight
					className="ms-auto size-basalt-icon-sm text-basalt-muted-foreground"
					aria-hidden="true"
				/>
			</>
		)}
	</ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export interface ContextMenuSubContentProps
	extends Omit<RadixContextMenuSubContentProps, "forceMount" | "asChild"> {
	/** Force mounting submenu content in DOM for external animation controls. */
	forceMount?: true;
	/**
	 * Merge props and behavior onto the child element instead of rendering a wrapper div.
	 * @default false
	 */
	asChild?: RadixContextMenuSubContentProps["asChild"];
}

export const ContextMenuSubContent = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
	ContextMenuSubContentProps
>(({ className, ...props }, ref) => {
	const highlightRef = useHoverHighlight(ref);
	return (
		<ContextMenuPrimitive.Portal forceMount={props.forceMount}>
			<ContextMenuPrimitive.SubContent
				ref={highlightRef}
				data-slot="context-menu-sub-content"
				className={overlayPanelClass(cn(MENU_PANEL_CLASS, className))}
				{...props}
			/>
		</ContextMenuPrimitive.Portal>
	);
});
ContextMenuSubContent.displayName = "ContextMenuSubContent";

export interface ContextMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps) {
	return (
		<span data-slot="context-menu-shortcut" className={menuShortcutClass(className)} {...props} />
	);
}
ContextMenuShortcut.displayName = "ContextMenuShortcut";
