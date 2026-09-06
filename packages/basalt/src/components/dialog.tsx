import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

export const DIALOG_SIZES = {
	sm: "sm:w-72",
	base: "sm:w-96",
	lg: "sm:w-[32rem]",
	xl: "sm:w-[48rem]",
} as const;

export type DialogSize = keyof typeof DIALOG_SIZES;

export function dialogOverlayClass(className?: string) {
	return cn(
		"fixed inset-0 bg-black/40 backdrop-blur-md",
		OVERLAY_LAYER,
		"data-[state=open]:animate-basalt-overlay-in data-[state=closed]:animate-basalt-overlay-out",
		OVERLAY_MOTION,
		className,
	);
}

export function dialogPanelClass({
	size = "base",
	className,
}: {
	size?: DialogSize;
	className?: string;
} = {}) {
	return cn(
		BASALT_UI_CLASS,
		"fixed top-1/2 left-1/2 w-full max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] origin-center -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-basalt-lg p-6 text-basalt-foreground shadow-lg ring-1 ring-basalt-border",
		OVERLAY_LAYER,
		"data-[state=open]:animate-basalt-dialog-in data-[state=closed]:animate-basalt-dialog-out",
		OVERLAY_MOTION,
		DIALOG_SIZES[size],
		className,
	);
}

type RadixDialogProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
type RadixDialogTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
type RadixDialogPortalProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
type RadixDialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
type RadixDialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;
type RadixDialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
type RadixDialogDescriptionProps = React.ComponentPropsWithoutRef<
	typeof DialogPrimitive.Description
>;
type RadixDialogCloseProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;

export interface DialogProps
	extends Omit<RadixDialogProps, "open" | "defaultOpen" | "onOpenChange" | "modal"> {
	/**
	 * Controlled open state of the dialog.
	 */
	open?: RadixDialogProps["open"];
	/**
	 * Uncontrolled default open state of the dialog on initial render.
	 * @default false
	 */
	defaultOpen?: RadixDialogProps["defaultOpen"];
	/**
	 * Callback invoked when the open state changes.
	 */
	onOpenChange?: RadixDialogProps["onOpenChange"];
	/**
	 * Whether the dialog renders modally, preventing outside interaction and hiding background content from screen readers.
	 * @default true
	 */
	modal?: RadixDialogProps["modal"];
}

export const Dialog: React.FC<DialogProps> = DialogPrimitive.Root;

export interface DialogTriggerProps extends Omit<RadixDialogTriggerProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * Trigger forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixDialogTriggerProps["asChild"];
}

export const DialogTrigger = DialogPrimitive.Trigger;

export interface DialogCloseProps extends Omit<RadixDialogCloseProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * Close forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixDialogCloseProps["asChild"];
}

export const DialogClose = DialogPrimitive.Close;

export interface DialogPortalProps
	extends Omit<RadixDialogPortalProps, "container" | "forceMount"> {
	/**
	 * Target container element where the dialog overlay and content portal should mount.
	 */
	container?: RadixDialogPortalProps["container"];
	/**
	 * Used to force mounting when controlling transition animations externally.
	 */
	forceMount?: RadixDialogPortalProps["forceMount"];
}

export const DialogPortal = DialogPrimitive.Portal;

export interface DialogOverlayProps
	extends Omit<RadixDialogOverlayProps, "asChild" | "forceMount"> {
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Overlay forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixDialogOverlayProps["asChild"];
	/**
	 * Used to force mounting when controlling transition animations externally.
	 */
	forceMount?: RadixDialogOverlayProps["forceMount"];
}

export const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	DialogOverlayProps
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay ref={ref} className={dialogOverlayClass(className)} {...props} />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps
	extends Omit<
		RadixDialogContentProps,
		| "size"
		| "disablePointerDismissal"
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
	 * Fixed desktop width preset. Dialog panel scrolls vertically when content overflows available viewport height.
	 * @default "base"
	 */
	size?: DialogSize;
	/**
	 * When true, pointer interactions outside the dialog panel are prevented from dismissing the dialog.
	 * @default false
	 */
	disablePointerDismissal?: boolean;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Content forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixDialogContentProps["asChild"];
	/**
	 * Force mounting content in DOM for external animation controls.
	 * Note: DialogContent renders inside a built-in Portal without passing forceMount to the portal boundary; closed content remains unmounted by the outer portal until portal boundary forwarding is added.
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
	 * Event handler called when a pointer event occurs outside the dialog bounds.
	 */
	onPointerDownOutside?: RadixDialogContentProps["onPointerDownOutside"];
	/**
	 * Event handler called when focus moves outside the dialog bounds.
	 */
	onFocusOutside?: RadixDialogContentProps["onFocusOutside"];
	/**
	 * Event handler called when any interaction (pointer or focus) occurs outside the dialog bounds.
	 */
	onInteractOutside?: RadixDialogContentProps["onInteractOutside"];
}

export const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	DialogContentProps
>(
	(
		{
			className,
			children,
			size = "base",
			disablePointerDismissal = false,
			onPointerDownOutside,
			onInteractOutside,
			...props
		},
		ref,
	) => (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				ref={ref}
				data-basalt-surface-root=""
				className={dialogPanelClass({ size, className })}
				onPointerDownOutside={(event) => {
					if (disablePointerDismissal) {
						event.preventDefault();
					}
					onPointerDownOutside?.(event);
				}}
				onInteractOutside={(event) => {
					if (disablePointerDismissal) {
						event.preventDefault();
					}
					onInteractOutside?.(event);
				}}
				{...props}
			>
				{children}
			</DialogPrimitive.Content>
		</DialogPortal>
	),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

export interface DialogTitleProps extends Omit<RadixDialogTitleProps, "asChild"> {
	/**
	 * Change the default rendered heading element to the child element, merging props and behavior.
	 * Title forwards ref to HTMLHeadingElement and inherits native h2 attributes.
	 * @default false
	 */
	asChild?: RadixDialogTitleProps["asChild"];
}

export const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	DialogTitleProps
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("text-2xl font-semibold tracking-tight", className)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export interface DialogDescriptionProps extends Omit<RadixDialogDescriptionProps, "asChild"> {
	/**
	 * Change the default rendered paragraph element to the child element, merging props and behavior.
	 * Description forwards ref to HTMLParagraphElement and inherits native p attributes.
	 * @default false
	 */
	asChild?: RadixDialogDescriptionProps["asChild"];
}

export const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	DialogDescriptionProps
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-base text-basalt-muted-foreground", className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
	<div className={cn("flex flex-col space-y-1.5 text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
	<div
		className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";
