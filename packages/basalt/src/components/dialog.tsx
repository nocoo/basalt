import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { X } from "../utils/internal-icons";
import {
	MODAL_CLOSE_BUTTON_CLASS,
	MODAL_DESCRIPTION_CLASS,
	MODAL_FOOTER_CLASS,
	MODAL_HEADER_CLASS,
	MODAL_HEADER_DISMISSIBLE_CLASS,
	MODAL_TITLE_CLASS,
} from "../utils/modal-surface";
import { OVERLAY_LAYER, OVERLAY_MOTION } from "../utils/overlay";

export const DIALOG_SIZES = {
	sm: "sm:w-basalt-72",
	md: "sm:w-basalt-96",
	lg: "sm:w-[32rem]",
	xl: "sm:w-[48rem]",
} as const;

export type DialogSize = keyof typeof DIALOG_SIZES;

export function dialogOverlayClass(className?: string) {
	return cn(
		"fixed inset-0 bg-basalt-scrim",
		OVERLAY_LAYER,
		"data-[state=open]:animate-basalt-overlay-in data-[state=closed]:animate-basalt-overlay-out",
		OVERLAY_MOTION,
		className,
	);
}

export function dialogPanelClass({
	size = "md",
	className,
}: {
	size?: DialogSize;
	className?: string;
} = {}) {
	return cn(
		BASALT_UI_CLASS,
		"fixed top-1/2 left-1/2 w-full max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] origin-center -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-basalt-lg p-basalt-card sm:p-basalt-card-lg text-basalt-foreground shadow-basalt-modal ring-1 ring-basalt-border",
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
	/** Controlled open state of the dialog. */
	open?: RadixDialogProps["open"];
	/**
	 * Uncontrolled default open state of the dialog on initial render.
	 * @default false
	 */
	defaultOpen?: RadixDialogProps["defaultOpen"];
	/** Callback invoked when the open state changes. */
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
	 * @default false
	 */
	asChild?: RadixDialogTriggerProps["asChild"];
}

export const DialogTrigger = DialogPrimitive.Trigger;

export interface DialogCloseProps extends Omit<RadixDialogCloseProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixDialogCloseProps["asChild"];
}

export const DialogClose = DialogPrimitive.Close;

export interface DialogPortalProps
	extends Omit<RadixDialogPortalProps, "container" | "forceMount"> {
	/** Target container element where the dialog overlay and content portal should mount. */
	container?: RadixDialogPortalProps["container"];
	/** Used to force mounting when controlling transition animations externally. */
	forceMount?: RadixDialogPortalProps["forceMount"];
}

export const DialogPortal = DialogPrimitive.Portal;

export interface DialogOverlayProps
	extends Omit<RadixDialogOverlayProps, "asChild" | "forceMount"> {
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixDialogOverlayProps["asChild"];
	/** Used to force mounting when controlling transition animations externally. */
	forceMount?: RadixDialogOverlayProps["forceMount"];
}

export const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	DialogOverlayProps
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		data-slot="dialog-overlay"
		className={dialogOverlayClass(className)}
		{...props}
	/>
));
DialogOverlay.displayName = "DialogOverlay";

export interface DialogContentProps
	extends Omit<
		RadixDialogContentProps,
		| "size"
		| "disablePointerDismissal"
		| "showCloseButton"
		| "closeLabel"
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
	 * @default "md"
	 */
	size?: DialogSize;
	/**
	 * When true, pointer interactions outside the dialog panel are prevented from dismissing the dialog.
	 * @default false
	 */
	disablePointerDismissal?: boolean;
	/**
	 * Show the built-in top-right dismiss icon button inside DialogContent.
	 * @default true
	 */
	showCloseButton?: boolean;
	/**
	 * Accessible label for the built-in close button.
	 * @default "Close"
	 */
	closeLabel?: string;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixDialogContentProps["asChild"];
	/** Force mounting content in DOM for external animation controls. */
	forceMount?: RadixDialogContentProps["forceMount"];
	/** Event handler called when auto-focusing the first element on open. */
	onOpenAutoFocus?: RadixDialogContentProps["onOpenAutoFocus"];
	/** Event handler called when restoring focus on close. */
	onCloseAutoFocus?: RadixDialogContentProps["onCloseAutoFocus"];
	/** Event handler called when the Escape key is pressed. */
	onEscapeKeyDown?: RadixDialogContentProps["onEscapeKeyDown"];
	/** Event handler called when a pointer event occurs outside the dialog bounds. */
	onPointerDownOutside?: RadixDialogContentProps["onPointerDownOutside"];
	/** Event handler called when focus moves outside the dialog bounds. */
	onFocusOutside?: RadixDialogContentProps["onFocusOutside"];
	/** Event handler called when any interaction occurs outside the dialog bounds. */
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
			size = "md",
			disablePointerDismissal = false,
			showCloseButton = true,
			closeLabel = "Close",
			onPointerDownOutside,
			onInteractOutside,
			...props
		},
		ref,
	) => (
		<DialogPortal forceMount={props.forceMount}>
			<DialogOverlay forceMount={props.forceMount} />
			<DialogPrimitive.Content
				ref={ref}
				data-slot="dialog-content"
				data-basalt-surface-root=""
				data-basalt-floating=""
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
				{showCloseButton && !props.asChild ? (
					<DialogPrimitive.Close
						type="button"
						aria-label={closeLabel}
						data-slot="dialog-close"
						className={MODAL_CLOSE_BUTTON_CLASS}
					>
						<X className="size-basalt-icon-sm" aria-hidden="true" />
					</DialogPrimitive.Close>
				) : null}
			</DialogPrimitive.Content>
		</DialogPortal>
	),
);
DialogContent.displayName = "DialogContent";

export interface DialogTitleProps extends Omit<RadixDialogTitleProps, "asChild"> {
	/**
	 * Change the default rendered heading element to the child element, merging props and behavior.
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
		data-slot="dialog-title"
		className={cn(MODAL_TITLE_CLASS, className)}
		{...props}
	/>
));
DialogTitle.displayName = "DialogTitle";

export interface DialogDescriptionProps extends Omit<RadixDialogDescriptionProps, "asChild"> {
	/**
	 * Change the default rendered paragraph element to the child element, merging props and behavior.
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
		data-slot="dialog-description"
		className={cn(MODAL_DESCRIPTION_CLASS, className)}
		{...props}
	/>
));
DialogDescription.displayName = "DialogDescription";

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
	<div
		data-slot="dialog-header"
		className={cn(MODAL_HEADER_CLASS, MODAL_HEADER_DISMISSIBLE_CLASS, className)}
		{...props}
	/>
);
DialogHeader.displayName = "DialogHeader";

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
	<div data-slot="dialog-footer" className={cn(MODAL_FOOTER_CLASS, className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";
