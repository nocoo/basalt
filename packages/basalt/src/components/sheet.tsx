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
	/** Controlled open state of the sheet drawer. */
	open?: RadixDialogProps["open"];
	/**
	 * Uncontrolled default open state of the sheet on initial render.
	 * @default false
	 */
	defaultOpen?: RadixDialogProps["defaultOpen"];
	/** Callback invoked when the open state changes. */
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
	 * @default false
	 */
	asChild?: RadixDialogTriggerProps["asChild"];
}

export const SheetTrigger = DialogPrimitive.Trigger;

export interface SheetCloseProps extends Omit<RadixDialogCloseProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixDialogCloseProps["asChild"];
}

export const SheetClose = DialogPrimitive.Close;

export interface SheetTitleProps extends Omit<RadixDialogTitleProps, "asChild"> {
	/**
	 * Change the default rendered heading element to the child element, merging props and behavior.
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
		data-slot="sheet-title"
		className={cn(MODAL_TITLE_CLASS, className)}
		{...props}
	/>
));
SheetTitle.displayName = "SheetTitle";

export interface SheetDescriptionProps extends Omit<RadixDialogDescriptionProps, "asChild"> {
	/**
	 * Change the default rendered paragraph element to the child element, merging props and behavior.
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
		data-slot="sheet-description"
		className={cn(MODAL_DESCRIPTION_CLASS, className)}
		{...props}
	/>
));
SheetDescription.displayName = "SheetDescription";

const SIDE = {
	right: `fixed inset-y-0 right-0 ${BASALT_UI_CLASS} flex h-full w-basalt-80 flex-col gap-basalt-space-lg border-l border-basalt-border p-basalt-card sm:p-basalt-card-lg text-basalt-base text-basalt-foreground shadow-basalt-modal`,
	left: `fixed inset-y-0 left-0 ${BASALT_UI_CLASS} flex h-full w-basalt-80 flex-col gap-basalt-space-lg border-r border-basalt-border p-basalt-card sm:p-basalt-card-lg text-basalt-base text-basalt-foreground shadow-basalt-modal`,
	top: `fixed inset-x-0 top-0 ${BASALT_UI_CLASS} flex h-basalt-80 w-full flex-col gap-basalt-space-lg border-b border-basalt-border p-basalt-card sm:p-basalt-card-lg text-basalt-base text-basalt-foreground shadow-basalt-modal`,
	bottom: `fixed inset-x-0 bottom-0 ${BASALT_UI_CLASS} flex h-basalt-80 w-full flex-col gap-basalt-space-lg border-t border-basalt-border p-basalt-card sm:p-basalt-card-lg text-basalt-base text-basalt-foreground shadow-basalt-modal`,
} as const;

export type SheetSide = keyof typeof SIDE;

export interface SheetContentProps
	extends Omit<
		RadixDialogContentProps,
		| "side"
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
	 * Edge of the screen where the drawer panel is positioned and anchored.
	 * @default "right"
	 */
	side?: SheetSide;
	/**
	 * Show the built-in top-right dismiss icon button inside SheetContent.
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
	/** Event handler called when a pointer event occurs outside the sheet bounds. */
	onPointerDownOutside?: RadixDialogContentProps["onPointerDownOutside"];
	/** Event handler called when focus moves outside the sheet bounds. */
	onFocusOutside?: RadixDialogContentProps["onFocusOutside"];
	/** Event handler called when any interaction occurs outside the sheet bounds. */
	onInteractOutside?: RadixDialogContentProps["onInteractOutside"];
}

export const SheetContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	SheetContentProps
>(
	(
		{ className, side = "right", showCloseButton = true, closeLabel = "Close", children, ...props },
		ref,
	) => (
		<DialogPrimitive.Portal forceMount={props.forceMount}>
			<DialogPrimitive.Overlay
				forceMount={props.forceMount}
				className={cn(
					"basalt-sheet-overlay fixed inset-0 bg-basalt-scrim",
					OVERLAY_LAYER,
					OVERLAY_MOTION,
				)}
			/>
			<DialogPrimitive.Content
				ref={ref}
				data-slot="sheet-content"
				data-basalt-sheet=""
				data-side={side}
				data-basalt-surface-root=""
				data-basalt-floating=""
				className={cn(OVERLAY_LAYER, OVERLAY_MOTION, "max-h-dvh max-w-full", SIDE[side], className)}
				{...props}
				style={{ boxSizing: "border-box", ...props.style }}
			>
				{children}
				{showCloseButton && !props.asChild ? (
					<DialogPrimitive.Close
						type="button"
						aria-label={closeLabel}
						data-slot="sheet-close"
						className={MODAL_CLOSE_BUTTON_CLASS}
					>
						<X className="size-basalt-icon-sm" aria-hidden="true" />
					</DialogPrimitive.Close>
				) : null}
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	),
);
SheetContent.displayName = "SheetContent";

export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SheetHeader = ({ className, ...props }: SheetHeaderProps) => (
	<div
		data-slot="sheet-header"
		className={cn(MODAL_HEADER_CLASS, MODAL_HEADER_DISMISSIBLE_CLASS, className)}
		{...props}
	/>
);
SheetHeader.displayName = "SheetHeader";

export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SheetFooter = ({ className, ...props }: SheetFooterProps) => (
	<div data-slot="sheet-footer" className={cn(MODAL_FOOTER_CLASS, className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";
