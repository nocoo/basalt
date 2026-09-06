import * as PopoverPrimitive from "@radix-ui/react-popover";
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
	 * Note: In Basalt, PopoverContent wraps a built-in Portal without passing forceMount;
	 * closed content is unmounted by the outer portal.
	 */
	forceMount?: true;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * PopoverContent forwards ref to HTMLDivElement and inherits native div attributes.
	 * Note: Currently using asChild throws a Radix Primitive.div single-child slot error due to internal child/arrow wrapping (even with arrow=false). Prefer standard className/native div props.
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
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				ref={ref}
				align={align}
				side={side}
				sideOffset={sideOffset}
				className={cn(
					OVERLAY_LAYER,
					OVERLAY_MOTION,
					"rounded-basalt-md border border-basalt-border bg-basalt-popover px-4 py-3 text-sm text-basalt-popover-foreground shadow-md outline-hidden",
					className,
				)}
				{...props}
			>
				{children}
				{arrow ? (
					<PopoverPrimitive.Arrow asChild width={20} height={10}>
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
			className={cn("m-0 text-base font-medium leading-6 text-basalt-foreground", className)}
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
			className={cn("m-0 text-base leading-6 text-basalt-muted-foreground", className)}
			{...props}
		/>
	),
);
PopoverDescription.displayName = "PopoverDescription";

function ArrowSvg(props: React.ComponentProps<"svg">) {
	return (
		<svg width={20} height={10} aria-hidden {...props}>
			<svg width="100%" height="100%" viewBox="0 0 20 10" preserveAspectRatio="none" aria-hidden>
				<path
					d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
					className="fill-basalt-popover"
				/>
				<path
					d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
					className="fill-basalt-border"
				/>
			</svg>
		</svg>
	);
}
