import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Slottable } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "../utils/cn";
import { MENU_GAP, OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

export const POPOVER_SIDES = ["top", "bottom", "left", "right"] as const;
export type PopoverSide = (typeof POPOVER_SIDES)[number];

type RadixPopoverProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>;
type RadixPopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>;
type RadixPopoverCloseProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>;
type RadixPopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>;

export interface PopoverProps
	extends Omit<RadixPopoverProps, "children" | "open" | "defaultOpen" | "onOpenChange" | "modal"> {
	/**
	 * Popover structure elements, typically PopoverTrigger and PopoverContent.
	 */
	children?: React.ReactNode;
	/**
	 * Controlled open state of the popover.
	 */
	open?: RadixPopoverProps["open"];
	/**
	 * Uncontrolled initial open state of the popover.
	 * @default false
	 */
	defaultOpen?: RadixPopoverProps["defaultOpen"];
	/**
	 * Callback called when the open state changes.
	 */
	onOpenChange?: RadixPopoverProps["onOpenChange"];
	/**
	 * Whether the popover renders modally, preventing outside interaction and hiding background content from screen readers.
	 * @default false
	 */
	modal?: RadixPopoverProps["modal"];
}

export const Popover: React.FC<PopoverProps> = PopoverPrimitive.Root;

export interface PopoverTriggerProps extends Omit<RadixPopoverTriggerProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * PopoverTrigger forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixPopoverTriggerProps["asChild"];
}

export const PopoverTrigger = PopoverPrimitive.Trigger;

export interface PopoverCloseProps extends Omit<RadixPopoverCloseProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * PopoverClose forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixPopoverCloseProps["asChild"];
}

export const PopoverClose = PopoverPrimitive.Close;

export interface PopoverContentProps
	extends Omit<
		RadixPopoverContentProps,
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
		| "forceMount"
		| "asChild"
		| "onOpenAutoFocus"
		| "onCloseAutoFocus"
		| "onEscapeKeyDown"
		| "onPointerDownOutside"
		| "onFocusOutside"
		| "onInteractOutside"
	> {
	/**
	 * Preferred placement side relative to trigger.
	 * @default "bottom"
	 */
	side?: RadixPopoverContentProps["side"];
	/**
	 * Distance in pixels between trigger and floating content panel.
	 * @default 8
	 */
	sideOffset?: RadixPopoverContentProps["sideOffset"];
	/**
	 * Preferred alignment along the side axis.
	 * @default "center"
	 */
	align?: RadixPopoverContentProps["align"];
	/**
	 * Offset in pixels from the start or end alignment position.
	 * @default 0
	 */
	alignOffset?: RadixPopoverContentProps["alignOffset"];
	/**
	 * Whether to reposition content to avoid viewport boundary collisions.
	 * @default true
	 */
	avoidCollisions?: RadixPopoverContentProps["avoidCollisions"];
	/**
	 * Element or elements bounding boundary collision calculations.
	 * @default []
	 */
	collisionBoundary?: RadixPopoverContentProps["collisionBoundary"];
	/**
	 * Virtual padding from collision boundaries in pixels.
	 * @default 0
	 */
	collisionPadding?: RadixPopoverContentProps["collisionPadding"];
	/**
	 * Padding in pixels between popper arrow and floating panel edge.
	 * @default 0
	 */
	arrowPadding?: RadixPopoverContentProps["arrowPadding"];
	/**
	 * Sticky positioning behavior along the align axis when overflowing.
	 * @default "partial"
	 */
	sticky?: RadixPopoverContentProps["sticky"];
	/**
	 * Whether to hide content completely when trigger is fully occluded.
	 * @default false
	 */
	hideWhenDetached?: RadixPopoverContentProps["hideWhenDetached"];
	/**
	 * Strategy used to calculate and update popper position.
	 * @default "optimized"
	 */
	updatePositionStrategy?: RadixPopoverContentProps["updatePositionStrategy"];
	/**
	 * Force mounting content in DOM for external animation controls.
	 * When forceMount is true, the content remains mounted even when closed.
	 * The caller is responsible for visibility transitions and unmounting after animation completes.
	 * Note: Keeping modal content forceMounted may isolate background interactions until unmounted.
	 */
	forceMount?: true;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * PopoverContent forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixPopoverContentProps["asChild"];
	/**
	 * Callback fired when auto-focusing on open. Can be prevented.
	 */
	onOpenAutoFocus?: RadixPopoverContentProps["onOpenAutoFocus"];
	/**
	 * Callback fired when auto-focusing on close. Can be prevented.
	 */
	onCloseAutoFocus?: RadixPopoverContentProps["onCloseAutoFocus"];
	/**
	 * Callback fired when the Escape key is down on the dismissable layer. Can be prevented.
	 */
	onEscapeKeyDown?: RadixPopoverContentProps["onEscapeKeyDown"];
	/**
	 * Callback fired when a pointerdown event happens outside the bounds of the dismissable layer. Can be prevented.
	 */
	onPointerDownOutside?: RadixPopoverContentProps["onPointerDownOutside"];
	/**
	 * Callback fired when focus moves outside the bounds of the dismissable layer. Can be prevented.
	 */
	onFocusOutside?: RadixPopoverContentProps["onFocusOutside"];
	/**
	 * Callback fired when an interaction (pointerdown or focus) happens outside the bounds of the dismissable layer. Can be prevented.
	 */
	onInteractOutside?: RadixPopoverContentProps["onInteractOutside"];
	/**
	 * Show the pointing arrow.
	 * @default true
	 */
	arrow?: boolean;
}

export const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	PopoverContentProps
>(
	(
		{
			className,
			align = "center",
			side = "bottom",
			sideOffset = MENU_GAP,
			arrow = true,
			children,
			...props
		},
		ref,
	) => (
		<PopoverPrimitive.Portal forceMount={props.forceMount}>
			<PopoverPrimitive.Content
				ref={ref}
				align={align}
				side={side}
				sideOffset={sideOffset}
				className={cn(
					OVERLAY_LAYER,
					OVERLAY_MOTION,
					"basalt-floating rounded-basalt-md border border-basalt-border bg-basalt-popover p-basalt-card text-basalt-base leading-[var(--basalt-line-body)] text-basalt-popover-foreground shadow-md outline-hidden",
					className,
				)}
				{...props}
			>
				<Slottable>{children}</Slottable>
				{arrow ? (
					<PopoverPrimitive.Arrow asChild width={12} height={6}>
						<ArrowSvg />
					</PopoverPrimitive.Arrow>
				) : null}
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Portal>
	),
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export interface PopoverTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const PopoverTitle = React.forwardRef<HTMLHeadingElement, PopoverTitleProps>(
	({ className, ...props }, ref) => (
		<h2
			ref={ref}
			className={cn(
				"m-0 mb-basalt-space-sm text-basalt-base font-medium leading-[var(--basalt-line-body)] text-basalt-popover-foreground",
				className,
			)}
			{...props}
		/>
	),
);
PopoverTitle.displayName = "PopoverTitle";

export interface PopoverDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const PopoverDescription = React.forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
	({ className, ...props }, ref) => (
		<p
			ref={ref}
			className={cn(
				"m-0 text-basalt-base leading-[var(--basalt-line-body)] text-basalt-muted-foreground",
				className,
			)}
			{...props}
		/>
	),
);
PopoverDescription.displayName = "PopoverDescription";

function ArrowSvg(props: React.ComponentProps<"svg">) {
	return (
		<svg {...props} width={12} height={6} viewBox="0 0 12 6" aria-hidden>
			<path d="M0 0H12L6 6Z" className="fill-basalt-popover" />
			<path d="M0 0L6 6L12 0" fill="none" className="stroke-basalt-border" />
		</svg>
	);
}
