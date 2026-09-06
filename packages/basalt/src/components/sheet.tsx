import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "../utils/cn";
import { OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

type RadixDialogProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
type RadixDialogTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
type RadixDialogCloseProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;
type RadixDialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;
type RadixDialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
type RadixDialogDescriptionProps = React.ComponentPropsWithoutRef<
	typeof DialogPrimitive.Description
>;

export interface SheetProps
	extends Omit<RadixDialogProps, "open" | "defaultOpen" | "onOpenChange" | "modal"> {
	/**
	 * Controlled open state of the sheet drawer.
	 */
	open?: RadixDialogProps["open"];
	/**
	 * Uncontrolled default open state of the sheet on initial render.
	 * @default false
	 */
	defaultOpen?: RadixDialogProps["defaultOpen"];
	/**
	 * Callback invoked when the open state changes.
	 */
	onOpenChange?: RadixDialogProps["onOpenChange"];
	/**
	 * Whether the sheet renders modally, preventing outside interaction and hiding background content from screen readers.
	 * @default true
	 */
	modal?: RadixDialogProps["modal"];
}

export const Sheet: React.FC<SheetProps> = DialogPrimitive.Root;

export interface SheetTriggerProps extends Omit<RadixDialogTriggerProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * Trigger forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixDialogTriggerProps["asChild"];
}

export const SheetTrigger = DialogPrimitive.Trigger;

export interface SheetCloseProps extends Omit<RadixDialogCloseProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * Close forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixDialogCloseProps["asChild"];
}

export const SheetClose = DialogPrimitive.Close;

export interface SheetTitleProps extends Omit<RadixDialogTitleProps, "asChild"> {
	/**
	 * Change the default rendered heading element to the child element, merging props and behavior.
	 * Title forwards ref to HTMLHeadingElement and inherits native h2 attributes.
	 * @default false
	 */
	asChild?: RadixDialogTitleProps["asChild"];
}

export const SheetTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	SheetTitleProps
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("text-lg font-semibold leading-none tracking-tight", className)}
		{...props}
	/>
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export interface SheetDescriptionProps extends Omit<RadixDialogDescriptionProps, "asChild"> {
	/**
	 * Change the default rendered paragraph element to the child element, merging props and behavior.
	 * Description forwards ref to HTMLParagraphElement and inherits native p attributes.
	 * @default false
	 */
	asChild?: RadixDialogDescriptionProps["asChild"];
}

export const SheetDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	SheetDescriptionProps
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-sm text-basalt-muted-foreground", className)}
		{...props}
	/>
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

const SIDE = {
	right:
		"fixed inset-y-0 right-0 box-border flex h-full w-80 flex-col gap-3 border-l border-basalt-border p-6 text-sm text-basalt-foreground shadow-lg",
	left: "fixed inset-y-0 left-0 box-border flex h-full w-80 flex-col gap-3 border-r border-basalt-border p-6 text-sm text-basalt-foreground shadow-lg",
	top: "fixed inset-x-0 top-0 box-border flex h-80 w-full flex-col gap-3 border-b border-basalt-border p-6 text-sm text-basalt-foreground shadow-lg",
	bottom:
		"fixed inset-x-0 bottom-0 box-border flex h-80 w-full flex-col gap-3 border-t border-basalt-border p-6 text-sm text-basalt-foreground shadow-lg",
} as const;

export type SheetSide = keyof typeof SIDE;

export interface SheetContentProps
	extends Omit<
		RadixDialogContentProps,
		| "side"
		| "asChild"
		| "forceMount"
		| "trapFocus"
		| "onOpenAutoFocus"
		| "onCloseAutoFocus"
		| "onEscapeKeyDown"
		| "onPointerDownOutside"
		| "onFocusOutside"
		| "onInteractOutside"
	> {
	/**
	 * Edge of the screen where the drawer panel is positioned and anchored.
	 * @default "right"
	 */
	side?: SheetSide;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Content forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixDialogContentProps["asChild"];
	/**
	 * Force mounting content in DOM for external animation controls.
	 * Note: SheetContent renders inside a built-in Portal without passing forceMount to the portal boundary; closed content remains unmounted by the outer portal until portal boundary forwarding is added.
	 */
	forceMount?: RadixDialogContentProps["forceMount"];
	/**
	 * Event handler called when auto-focusing the first element on open. Can be prevented with event.preventDefault().
	 */
	onOpenAutoFocus?: RadixDialogContentProps["onOpenAutoFocus"];
	/**
	 * Event handler called when restoring focus on close. Can be prevented with event.preventDefault().
	 */
	onCloseAutoFocus?: RadixDialogContentProps["onCloseAutoFocus"];
	/**
	 * Event handler called when the Escape key is pressed. Can be prevented with event.preventDefault().
	 */
	onEscapeKeyDown?: RadixDialogContentProps["onEscapeKeyDown"];
	/**
	 * Event handler called when a pointer event occurs outside the sheet bounds.
	 */
	onPointerDownOutside?: RadixDialogContentProps["onPointerDownOutside"];
	/**
	 * Event handler called when focus moves outside the sheet bounds.
	 */
	onFocusOutside?: RadixDialogContentProps["onFocusOutside"];
	/**
	 * Event handler called when any interaction (pointer or focus) occurs outside the sheet bounds.
	 */
	onInteractOutside?: RadixDialogContentProps["onInteractOutside"];
}

export const SheetContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	SheetContentProps
>(({ className, side = "right", children, ...props }, ref) => (
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay
			className={cn("fixed inset-0 bg-black/50 backdrop-blur-xs", OVERLAY_LAYER, OVERLAY_MOTION)}
		/>
		<DialogPrimitive.Content
			ref={ref}
			data-basalt-surface-root=""
			className={cn(OVERLAY_LAYER, OVERLAY_MOTION, SIDE[side], className)}
			{...props}
			style={{ boxSizing: "border-box", ...props.style }}
		>
			{children}
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SheetHeader = ({ className, ...props }: SheetHeaderProps) => (
	<div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SheetFooter = ({ className, ...props }: SheetFooterProps) => (
	<div
		className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
		{...props}
	/>
);
SheetFooter.displayName = "SheetFooter";
