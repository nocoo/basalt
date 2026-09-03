import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "../utils/cn";
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
		"fixed top-1/2 left-1/2 w-full max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] origin-center -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-basalt-lg p-8 text-basalt-foreground shadow-lg ring-1 ring-basalt-border",
		OVERLAY_LAYER,
		"data-[state=open]:animate-basalt-dialog-in data-[state=closed]:animate-basalt-dialog-out",
		OVERLAY_MOTION,
		DIALOG_SIZES[size],
		className,
	);
}

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay ref={ref} className={dialogOverlayClass(className)} {...props} />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
	size?: DialogSize;
	disablePointerDismissal?: boolean;
};

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

export const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("text-2xl font-semibold tracking-tight", className)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-base text-basalt-muted-foreground", className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col space-y-1.5 text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";
