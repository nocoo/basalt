import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";
import { cn } from "../utils/cn";
import {
	MODAL_DESCRIPTION_CLASS,
	MODAL_FOOTER_CLASS,
	MODAL_HEADER_CLASS,
	MODAL_TITLE_CLASS,
} from "../utils/modal-surface";
import { type ButtonProps, buttonVariants } from "./button";
import { type DialogSize, dialogOverlayClass, dialogPanelClass } from "./dialog";

type RadixAlertDialogProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>;
type RadixAlertDialogTriggerProps = React.ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Trigger
>;
type RadixAlertDialogPortalProps = React.ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Portal
>;
type RadixAlertDialogOverlayProps = React.ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Overlay
>;
type RadixAlertDialogContentProps = React.ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Content
>;
type RadixAlertDialogTitleProps = React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>;
type RadixAlertDialogDescriptionProps = React.ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Description
>;
type RadixAlertDialogActionProps = React.ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Action
>;
type RadixAlertDialogCancelProps = React.ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Cancel
>;

export interface AlertDialogProps
	extends Omit<RadixAlertDialogProps, "open" | "defaultOpen" | "onOpenChange"> {
	/** Controlled open state of the alert dialog. */
	open?: RadixAlertDialogProps["open"];
	/**
	 * Uncontrolled default open state of the alert dialog on initial render.
	 * @default false
	 */
	defaultOpen?: RadixAlertDialogProps["defaultOpen"];
	/** Callback invoked when the open state changes. */
	onOpenChange?: RadixAlertDialogProps["onOpenChange"];
}

export const AlertDialog: React.FC<AlertDialogProps> = AlertDialogPrimitive.Root;

export interface AlertDialogTriggerProps extends Omit<RadixAlertDialogTriggerProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixAlertDialogTriggerProps["asChild"];
}

export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export interface AlertDialogPortalProps
	extends Omit<RadixAlertDialogPortalProps, "container" | "forceMount"> {
	/** Target container element where the alert dialog overlay and content portal should mount. */
	container?: RadixAlertDialogPortalProps["container"];
	/** Used to force mounting when controlling transition animations externally. */
	forceMount?: RadixAlertDialogPortalProps["forceMount"];
}

export const AlertDialogPortal = AlertDialogPrimitive.Portal;

export interface AlertDialogOverlayProps
	extends Omit<RadixAlertDialogOverlayProps, "asChild" | "forceMount"> {
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixAlertDialogOverlayProps["asChild"];
	/** Used to force mounting when controlling transition animations externally. */
	forceMount?: RadixAlertDialogOverlayProps["forceMount"];
}

export const AlertDialogOverlay = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
	AlertDialogOverlayProps
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Overlay
		ref={ref}
		data-slot="alert-dialog-overlay"
		className={dialogOverlayClass(className)}
		{...props}
	/>
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

export interface AlertDialogContentProps
	extends Omit<
		RadixAlertDialogContentProps,
		| "size"
		| "asChild"
		| "forceMount"
		| "trapFocus"
		| "onOpenAutoFocus"
		| "onCloseAutoFocus"
		| "onEscapeKeyDown"
	> {
	/**
	 * Fixed desktop width preset, shared with Dialog. Content scrolls vertically when overflowing available height.
	 * @default "base"
	 */
	size?: DialogSize;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixAlertDialogContentProps["asChild"];
	/** Force mounting content in DOM for external animation controls. */
	forceMount?: RadixAlertDialogContentProps["forceMount"];
	/** Event handler called when auto-focusing on open. Defaults to focusing the cancel button. */
	onOpenAutoFocus?: RadixAlertDialogContentProps["onOpenAutoFocus"];
	/** Event handler called when restoring focus on close. */
	onCloseAutoFocus?: RadixAlertDialogContentProps["onCloseAutoFocus"];
	/** Event handler called when the Escape key is pressed. */
	onEscapeKeyDown?: RadixAlertDialogContentProps["onEscapeKeyDown"];
}

export const AlertDialogContent = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Content>,
	AlertDialogContentProps
>(({ className, size = "base", ...props }, ref) => (
	<AlertDialogPortal forceMount={props.forceMount}>
		<AlertDialogOverlay forceMount={props.forceMount} />
		<AlertDialogPrimitive.Content
			ref={ref}
			data-slot="alert-dialog-content"
			data-basalt-surface-root=""
			data-basalt-floating=""
			className={dialogPanelClass({ size, className })}
			{...props}
		/>
	</AlertDialogPortal>
));
AlertDialogContent.displayName = "AlertDialogContent";

export interface AlertDialogTitleProps extends Omit<RadixAlertDialogTitleProps, "asChild"> {
	/**
	 * Change the default rendered heading element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixAlertDialogTitleProps["asChild"];
}

export const AlertDialogTitle = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Title>,
	AlertDialogTitleProps
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Title
		ref={ref}
		data-slot="alert-dialog-title"
		className={cn(MODAL_TITLE_CLASS, className)}
		{...props}
	/>
));
AlertDialogTitle.displayName = "AlertDialogTitle";

export interface AlertDialogDescriptionProps
	extends Omit<RadixAlertDialogDescriptionProps, "asChild"> {
	/**
	 * Change the default rendered paragraph element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixAlertDialogDescriptionProps["asChild"];
}

export const AlertDialogDescription = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Description>,
	AlertDialogDescriptionProps
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Description
		ref={ref}
		data-slot="alert-dialog-description"
		className={cn(MODAL_DESCRIPTION_CLASS, className)}
		{...props}
	/>
));
AlertDialogDescription.displayName = "AlertDialogDescription";

export interface AlertDialogCancelProps extends Omit<RadixAlertDialogCancelProps, "asChild"> {
	/**
	 * Button size preset for the cancel button.
	 * @default "default"
	 */
	size?: ButtonProps["size"];
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixAlertDialogCancelProps["asChild"];
}

export const AlertDialogCancel = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
	AlertDialogCancelProps
>(({ className, size = "default", ...props }, ref) => (
	<AlertDialogPrimitive.Cancel
		ref={ref}
		data-slot="alert-dialog-cancel"
		className={cn(buttonVariants({ variant: "outline", size }), className)}
		{...props}
	/>
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export interface AlertDialogActionProps extends Omit<RadixAlertDialogActionProps, "asChild"> {
	/**
	 * Visual button variant for the primary confirmation action.
	 * @default "destructive"
	 */
	variant?: ButtonProps["variant"];
	/**
	 * Button size preset for the primary confirmation action.
	 * @default "default"
	 */
	size?: ButtonProps["size"];
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixAlertDialogActionProps["asChild"];
}

export const AlertDialogAction = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Action>,
	AlertDialogActionProps
>(({ className, variant = "destructive", size = "default", ...props }, ref) => (
	<AlertDialogPrimitive.Action
		ref={ref}
		data-slot="alert-dialog-action"
		className={cn(buttonVariants({ variant, size }), className)}
		{...props}
	/>
));
AlertDialogAction.displayName = "AlertDialogAction";

export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogHeader = ({ className, ...props }: AlertDialogHeaderProps) => (
	<div data-slot="alert-dialog-header" className={cn(MODAL_HEADER_CLASS, className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogFooter = ({ className, ...props }: AlertDialogFooterProps) => (
	<div data-slot="alert-dialog-footer" className={cn(MODAL_FOOTER_CLASS, className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";
