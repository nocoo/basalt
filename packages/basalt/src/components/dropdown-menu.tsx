import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
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
import { MENU_GAP, overlayPanelClass } from "../utils/overlay";
import { useHoverHighlight } from "../utils/use-hover-highlight";

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
type RadixDropdownMenuCheckboxItemProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.CheckboxItem
>;
type RadixDropdownMenuRadioItemProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.RadioItem
>;
type RadixDropdownMenuLabelProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Label
>;
type RadixDropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Separator
>;
type RadixDropdownMenuSubTriggerProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.SubTrigger
>;
type RadixDropdownMenuSubContentProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.SubContent
>;

export interface DropdownMenuProps
	extends Omit<
		RadixDropdownMenuProps,
		"open" | "defaultOpen" | "onOpenChange" | "dir" | "modal" | "children"
	> {
	/** Structure elements comprising the dropdown menu, typically trigger and content. */
	children?: React.ReactNode;
	/** The controlled open state of the dropdown menu. */
	open?: RadixDropdownMenuProps["open"];
	/**
	 * The uncontrolled initial open state of the dropdown menu.
	 * @default false
	 */
	defaultOpen?: RadixDropdownMenuProps["defaultOpen"];
	/** Called when the open state changes. */
	onOpenChange?: RadixDropdownMenuProps["onOpenChange"];
	/**
	 * The reading direction of the dropdown menu.
	 * @default "ltr"
	 */
	dir?: RadixDropdownMenuProps["dir"];
	/**
	 * The modality of the dropdown menu.
	 * @default true
	 */
	modal?: RadixDropdownMenuProps["modal"];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = DropdownMenuPrimitive.Root;

export interface DropdownMenuTriggerProps
	extends Omit<RadixDropdownMenuTriggerProps, "asChild" | "children"> {
	/** Trigger element content. */
	children?: React.ReactNode;
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixDropdownMenuTriggerProps["asChild"];
}

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export interface DropdownMenuGroupProps
	extends Omit<RadixDropdownMenuGroupProps, "asChild" | "children"> {
	/** Menu items or elements grouped together. */
	children?: React.ReactNode;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixDropdownMenuGroupProps["asChild"];
}

export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export interface DropdownMenuPortalProps
	extends Omit<RadixDropdownMenuPortalProps, "container" | "forceMount" | "children"> {
	/** Content to render into the portal target. */
	children?: React.ReactNode;
	/** Specify a container element to portal the content into. */
	container?: RadixDropdownMenuPortalProps["container"];
	/** Used to force mounting when more control is needed. */
	forceMount?: RadixDropdownMenuPortalProps["forceMount"];
}

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export interface DropdownMenuSubProps
	extends Omit<RadixDropdownMenuSubProps, "open" | "defaultOpen" | "onOpenChange" | "children"> {
	/** Submenu trigger and content elements. */
	children?: React.ReactNode;
	/** The controlled open state of the submenu. */
	open?: RadixDropdownMenuSubProps["open"];
	/**
	 * The uncontrolled initial open state of the submenu.
	 * @default false
	 */
	defaultOpen?: RadixDropdownMenuSubProps["defaultOpen"];
	/** Event handler called when the open state of the submenu changes. */
	onOpenChange?: RadixDropdownMenuSubProps["onOpenChange"];
}

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export interface DropdownMenuRadioGroupProps
	extends Omit<
		RadixDropdownMenuRadioGroupProps,
		"value" | "onValueChange" | "asChild" | "children"
	> {
	/** Radio item elements grouped together. */
	children?: React.ReactNode;
	/** The value of the currently selected radio item. */
	value?: RadixDropdownMenuRadioGroupProps["value"];
	/** Event handler called when the value changes. */
	onValueChange?: RadixDropdownMenuRadioGroupProps["onValueChange"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
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
	/** Callback fired when auto-focusing on close. */
	onCloseAutoFocus?: RadixDropdownMenuContentProps["onCloseAutoFocus"];
	/** Callback fired when Escape is pressed on the content layer. */
	onEscapeKeyDown?: RadixDropdownMenuContentProps["onEscapeKeyDown"];
	/** Callback fired when a pointerdown event happens outside the content. */
	onPointerDownOutside?: RadixDropdownMenuContentProps["onPointerDownOutside"];
	/** Callback fired when focus moves outside the content. */
	onFocusOutside?: RadixDropdownMenuContentProps["onFocusOutside"];
	/** Callback fired when pointer or focus interaction happens outside the content. */
	onInteractOutside?: RadixDropdownMenuContentProps["onInteractOutside"];
	/** Force mounting content in DOM for external animation controls. */
	forceMount?: true;
	/**
	 * Merge props and behavior onto the child element instead of rendering a wrapper div.
	 * @default false
	 */
	asChild?: RadixDropdownMenuContentProps["asChild"];
}

export const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	DropdownMenuContentProps
>(({ className, sideOffset = MENU_GAP, ...props }, ref) => {
	const highlightRef = useHoverHighlight(ref);
	return (
		<DropdownMenuPrimitive.Portal forceMount={props.forceMount}>
			<DropdownMenuPrimitive.Content
				ref={highlightRef}
				data-slot="dropdown-menu-content"
				sideOffset={sideOffset}
				className={overlayPanelClass(cn(MENU_PANEL_CLASS, className))}
				{...props}
			/>
		</DropdownMenuPrimitive.Portal>
	);
});
DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuItemProps
	extends Omit<RadixDropdownMenuItemProps, "disabled" | "onSelect" | "textValue" | "asChild"> {
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
	 * Disable the menu item.
	 * @default false
	 */
	disabled?: RadixDropdownMenuItemProps["disabled"];
	/** Event handler called when the menu item is selected. */
	onSelect?: RadixDropdownMenuItemProps["onSelect"];
	/** Optional text used for typeahead navigation. */
	textValue?: RadixDropdownMenuItemProps["textValue"];
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixDropdownMenuItemProps["asChild"];
}

export const DropdownMenuItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	DropdownMenuItemProps
>(({ className, variant = "default", inset = false, ...props }, ref) => (
	<DropdownMenuPrimitive.Item
		data-slot="dropdown-menu-item"
		data-variant={variant}
		data-basalt-hover-item=""
		ref={ref}
		className={menuItemClass({ variant, inset, className })}
		{...props}
	/>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export interface DropdownMenuCheckboxItemProps
	extends Omit<
		RadixDropdownMenuCheckboxItemProps,
		"checked" | "onCheckedChange" | "disabled" | "onSelect" | "textValue" | "asChild"
	> {
	/** Checked state of the item. */
	checked?: RadixDropdownMenuCheckboxItemProps["checked"];
	/** Event handler called when the checked state changes. */
	onCheckedChange?: RadixDropdownMenuCheckboxItemProps["onCheckedChange"];
	/**
	 * Disable the checkbox item.
	 * @default false
	 */
	disabled?: RadixDropdownMenuCheckboxItemProps["disabled"];
	/** Event handler called when the item is selected. */
	onSelect?: RadixDropdownMenuCheckboxItemProps["onSelect"];
	/** Optional text used for typeahead navigation. */
	textValue?: RadixDropdownMenuCheckboxItemProps["textValue"];
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixDropdownMenuCheckboxItemProps["asChild"];
}

export const DropdownMenuCheckboxItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
	DropdownMenuCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => (
	<DropdownMenuPrimitive.CheckboxItem
		ref={ref}
		data-slot="dropdown-menu-checkbox-item"
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
					<DropdownMenuPrimitive.ItemIndicator>
						<Check className="size-basalt-icon-sm" aria-hidden="true" />
					</DropdownMenuPrimitive.ItemIndicator>
				</span>
				{children}
			</>
		)}
	</DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export interface DropdownMenuRadioItemProps
	extends Omit<
		RadixDropdownMenuRadioItemProps,
		"value" | "disabled" | "onSelect" | "textValue" | "asChild"
	> {
	/** Unique value associated with this radio item. */
	value: RadixDropdownMenuRadioItemProps["value"];
	/**
	 * Disable the radio item.
	 * @default false
	 */
	disabled?: RadixDropdownMenuRadioItemProps["disabled"];
	/** Event handler called when the radio item is selected. */
	onSelect?: RadixDropdownMenuRadioItemProps["onSelect"];
	/** Optional text used for typeahead navigation. */
	textValue?: RadixDropdownMenuRadioItemProps["textValue"];
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixDropdownMenuRadioItemProps["asChild"];
}

export const DropdownMenuRadioItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
	DropdownMenuRadioItemProps
>(({ className, children, ...props }, ref) => (
	<DropdownMenuPrimitive.RadioItem
		ref={ref}
		data-slot="dropdown-menu-radio-item"
		data-basalt-hover-item=""
		className={menuCheckableItemClass(className)}
		{...props}
	>
		{props.asChild ? (
			children
		) : (
			<>
				<span aria-hidden="true" className={MENU_INDICATOR_SLOT_CLASS}>
					<DropdownMenuPrimitive.ItemIndicator>
						<span aria-hidden="true" className="size-basalt-1_5 rounded-basalt-full bg-current" />
					</DropdownMenuPrimitive.ItemIndicator>
				</span>
				{children}
			</>
		)}
	</DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export interface DropdownMenuLabelProps extends Omit<RadixDropdownMenuLabelProps, "asChild"> {
	/**
	 * Indent label to align with checkable menu items.
	 * @default false
	 */
	inset?: boolean;
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixDropdownMenuLabelProps["asChild"];
}

export const DropdownMenuLabel = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Label>,
	DropdownMenuLabelProps
>(({ className, inset = false, ...props }, ref) => (
	<DropdownMenuPrimitive.Label
		ref={ref}
		data-slot="dropdown-menu-label"
		className={menuLabelClass(inset, className)}
		{...props}
	/>
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export interface DropdownMenuSeparatorProps
	extends Omit<RadixDropdownMenuSeparatorProps, "asChild"> {
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixDropdownMenuSeparatorProps["asChild"];
}

export const DropdownMenuSeparator = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
	DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Separator
		ref={ref}
		data-slot="dropdown-menu-separator"
		className={menuSeparatorClass(className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuSubTriggerProps
	extends Omit<RadixDropdownMenuSubTriggerProps, "disabled" | "textValue" | "asChild"> {
	/**
	 * Indent label to align with checkable menu items.
	 * @default false
	 */
	inset?: boolean;
	/**
	 * Disable the submenu trigger.
	 * @default false
	 */
	disabled?: RadixDropdownMenuSubTriggerProps["disabled"];
	/** Optional text used for typeahead navigation. */
	textValue?: RadixDropdownMenuSubTriggerProps["textValue"];
	/**
	 * Change the default rendered div element to the child element.
	 * @default false
	 */
	asChild?: RadixDropdownMenuSubTriggerProps["asChild"];
}

export const DropdownMenuSubTrigger = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
	DropdownMenuSubTriggerProps
>(({ className, inset = false, children, ...props }, ref) => (
	<DropdownMenuPrimitive.SubTrigger
		ref={ref}
		data-slot="dropdown-menu-sub-trigger"
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
	</DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export interface DropdownMenuSubContentProps
	extends Omit<RadixDropdownMenuSubContentProps, "forceMount" | "asChild"> {
	/** Force mounting submenu content in DOM for external animation controls. */
	forceMount?: true;
	/**
	 * Merge props and behavior onto the child element instead of rendering a wrapper div.
	 * @default false
	 */
	asChild?: RadixDropdownMenuSubContentProps["asChild"];
}

export const DropdownMenuSubContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
	DropdownMenuSubContentProps
>(({ className, ...props }, ref) => {
	const highlightRef = useHoverHighlight(ref);
	return (
		<DropdownMenuPrimitive.Portal forceMount={props.forceMount}>
			<DropdownMenuPrimitive.SubContent
				ref={highlightRef}
				data-slot="dropdown-menu-sub-content"
				className={overlayPanelClass(cn(MENU_PANEL_CLASS, className))}
				{...props}
			/>
		</DropdownMenuPrimitive.Portal>
	);
});
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
	return (
		<span data-slot="dropdown-menu-shortcut" className={menuShortcutClass(className)} {...props} />
	);
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
