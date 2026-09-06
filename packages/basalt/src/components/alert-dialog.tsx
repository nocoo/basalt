import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";
import { cn } from "../utils/cn";
import { buttonVariants } from "./button";
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
	/**
	 * Controlled open state of the alert dialog.
	 */
	open?: RadixAlertDialogProps["open"];
	/**
	 * Uncontrolled default open state of the alert dialog on initial render.
	 * @default false
	 */
	defaultOpen?: RadixAlertDialogProps["defaultOpen"];
	/**
	 * Callback invoked when the open state changes.
	 */
	onOpenChange?: RadixAlertDialogProps["onOpenChange"];
}

export const AlertDialog: React.FC<AlertDialogProps> = AlertDialogPrimitive.Root;

export interface AlertDialogTriggerProps extends Omit<RadixAlertDialogTriggerProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * Trigger forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixAlertDialogTriggerProps["asChild"];
}

export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export interface AlertDialogPortalProps
	extends Omit<RadixAlertDialogPortalProps, "container" | "forceMount"> {
	/**
	 * Target container element where the alert dialog overlay and content portal should mount.
	 */
	container?: RadixAlertDialogPortalProps["container"];
	/**
	 * Used to force mounting when controlling transition animations externally.
	 */
	forceMount?: RadixAlertDialogPortalProps["forceMount"];
}

export const AlertDialogPortal = AlertDialogPrimitive.Portal;

export interface AlertDialogOverlayProps
	extends Omit<RadixAlertDialogOverlayProps, "asChild" | "forceMount"> {
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Overlay forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixAlertDialogOverlayProps["asChild"];
	/**
	 * Used to force mounting when controlling transition animations externally.
	 */
	forceMount?: RadixAlertDialogOverlayProps["forceMount"];
}

export const AlertDialogOverlay = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
	AlertDialogOverlayProps
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Overlay ref={ref} className={dialogOverlayClass(className)} {...props} />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

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
	 * Content forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixAlertDialogContentProps["asChild"];
	/**
	 * Force mounting content in DOM for external animation controls.
	 * Note: AlertDialogContent renders inside a built-in Portal without passing forceMount to the portal boundary; closed content remains unmounted by the outer portal until portal boundary forwarding is added.
	 */
	forceMount?: RadixAlertDialogContentProps["forceMount"];
	/**
	 * Event handler called when auto-focusing on open. Defaults to focusing the cancel button. Can be prevented with event.preventDefault().
	 */
	onOpenAutoFocus?: RadixAlertDialogContentProps["onOpenAutoFocus"];
	/**
	 * Event handler called when restoring focus on close. Can be prevented with event.preventDefault().
	 */
	onCloseAutoFocus?: RadixAlertDialogContentProps["onCloseAutoFocus"];
	/**
	 * Event handler called when the Escape key is pressed. Can be prevented with event.preventDefault().
	 */
	onEscapeKeyDown?: RadixAlertDialogContentProps["onEscapeKeyDown"];
}

export const AlertDialogContent = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Content>,
	AlertDialogContentProps
>(({ className, size = "base", ...props }, ref) => (
	<AlertDialogPortal>
		<AlertDialogOverlay />
		<AlertDialogPrimitive.Content
			ref={ref}
			data-basalt-surface-root=""
			className={dialogPanelClass({ size, className })}
			{...props}
		/>
	</AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export interface AlertDialogTitleProps extends Omit<RadixAlertDialogTitleProps, "asChild"> {
	/**
	 * Change the default rendered heading element to the child element, merging props and behavior.
	 * Title forwards ref to HTMLHeadingElement and inherits native h2 attributes.
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
		className={cn("text-2xl font-semibold tracking-tight", className)}
		{...props}
	/>
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

export interface AlertDialogDescriptionProps
	extends Omit<RadixAlertDialogDescriptionProps, "asChild"> {
	/**
	 * Change the default rendered paragraph element to the child element, merging props and behavior.
	 * Description forwards ref to HTMLParagraphElement and inherits native p attributes.
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
		className={cn("text-base text-basalt-muted-foreground", className)}
		{...props}
	/>
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

export interface AlertDialogCancelProps extends Omit<RadixAlertDialogCancelProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * Cancel forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixAlertDialogCancelProps["asChild"];
}

export const AlertDialogCancel = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
	AlertDialogCancelProps
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Cancel
		ref={ref}
		className={cn(buttonVariants({ variant: "outline" }), className)}
		{...props}
	/>
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export interface AlertDialogActionProps extends Omit<RadixAlertDialogActionProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * Action forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixAlertDialogActionProps["asChild"];
}

export const AlertDialogAction = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Action>,
	AlertDialogActionProps
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Action
		ref={ref}
		className={cn(buttonVariants({ variant: "destructive" }), className)}
		{...props}
	/>
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogHeader = ({ className, ...props }: AlertDialogHeaderProps) => (
	<div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogFooter = ({ className, ...props }: AlertDialogFooterProps) => (
	<div
		className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
		{...props}
	/>
);
AlertDialogFooter.displayName = "AlertDialogFooter";
