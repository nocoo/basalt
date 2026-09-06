import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";
import { cn } from "../utils/cn";
import { MENU_GAP, OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

type RadixHoverCardProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>;
type RadixHoverCardTriggerProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger>;
type RadixHoverCardContentProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>;

export interface HoverCardProps
	extends Omit<
		RadixHoverCardProps,
		"open" | "defaultOpen" | "onOpenChange" | "openDelay" | "closeDelay"
	> {
	/**
	 * Controlled open state of the hover card.
	 */
	open?: RadixHoverCardProps["open"];
	/**
	 * Open state of the hover card when initially rendered in uncontrolled mode.
	 * @default false
	 */
	defaultOpen?: RadixHoverCardProps["defaultOpen"];
	/**
	 * Callback invoked when open state changes.
	 */
	onOpenChange?: RadixHoverCardProps["onOpenChange"];
	/**
	 * Delay in milliseconds before the hover card opens after hovering trigger.
	 * @default 700
	 */
	openDelay?: RadixHoverCardProps["openDelay"];
	/**
	 * Delay in milliseconds before the hover card closes after hover leaves trigger or content.
	 * @default 300
	 */
	closeDelay?: RadixHoverCardProps["closeDelay"];
}

export const HoverCard = HoverCardPrimitive.Root;

export interface HoverCardTriggerProps extends Omit<RadixHoverCardTriggerProps, "asChild"> {
	/**
	 * Change the default rendered anchor element to the child element, merging props and behavior.
	 * @default false
	 */
	asChild?: RadixHoverCardTriggerProps["asChild"];
}

export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export interface HoverCardContentProps
	extends Omit<
		RadixHoverCardContentProps,
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
		| "forceMount"
		| "onEscapeKeyDown"
		| "onPointerDownOutside"
		| "onFocusOutside"
		| "onInteractOutside"
	> {
	/**
	 * Preferred placement side relative to trigger.
	 * @default "bottom"
	 */
	side?: RadixHoverCardContentProps["side"];
	/**
	 * Distance in pixels between trigger and floating content panel.
	 * @default 8
	 */
	sideOffset?: RadixHoverCardContentProps["sideOffset"];
	/**
	 * Preferred alignment along the side axis.
	 * @default "center"
	 */
	align?: RadixHoverCardContentProps["align"];
	/**
	 * Offset in pixels from the start or end alignment position.
	 * @default 0
	 */
	alignOffset?: RadixHoverCardContentProps["alignOffset"];
	/**
	 * Whether to reposition content to avoid viewport boundary collisions.
	 * @default true
	 */
	avoidCollisions?: RadixHoverCardContentProps["avoidCollisions"];
	/**
	 * Element or elements bounding boundary collision calculations.
	 * @default []
	 */
	collisionBoundary?: RadixHoverCardContentProps["collisionBoundary"];
	/**
	 * Virtual padding from collision boundaries in pixels.
	 * @default 0
	 */
	collisionPadding?: RadixHoverCardContentProps["collisionPadding"];
	/**
	 * Padding in pixels between popper arrow and floating panel edge.
	 * @default 0
	 */
	arrowPadding?: RadixHoverCardContentProps["arrowPadding"];
	/**
	 * Sticky positioning behavior along the align axis when overflowing.
	 * @default "partial"
	 */
	sticky?: RadixHoverCardContentProps["sticky"];
	/**
	 * Whether to hide content completely when trigger is fully occluded.
	 * @default false
	 */
	hideWhenDetached?: RadixHoverCardContentProps["hideWhenDetached"];
	/**
	 * Force mounting content in DOM for external animation controls.
	 * Note: In Basalt, HoverCardContent wraps a built-in Portal without passing forceMount;
	 * closed content is currently unmounted by the outer portal.
	 */
	forceMount?: true;
	/**
	 * Callback fired when the Escape key is down on the dismissable layer. Can be prevented.
	 */
	onEscapeKeyDown?: RadixHoverCardContentProps["onEscapeKeyDown"];
	/**
	 * Callback fired when a pointerdown event happens outside the bounds of the dismissable layer. Can be prevented.
	 */
	onPointerDownOutside?: RadixHoverCardContentProps["onPointerDownOutside"];
	/**
	 * Callback fired when focus moves outside the bounds of the dismissable layer. Can be prevented.
	 */
	onFocusOutside?: RadixHoverCardContentProps["onFocusOutside"];
	/**
	 * Callback fired when an interaction (pointerdown or focus) happens outside the bounds of the dismissable layer. Can be prevented.
	 */
	onInteractOutside?: RadixHoverCardContentProps["onInteractOutside"];
}

export const HoverCardContent = React.forwardRef<
	React.ElementRef<typeof HoverCardPrimitive.Content>,
	HoverCardContentProps
>(({ className, sideOffset = MENU_GAP, ...props }, ref) => (
	<HoverCardPrimitive.Portal>
		<HoverCardPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn(
				OVERLAY_LAYER,
				OVERLAY_MOTION,
				"w-64 rounded-basalt-md border border-basalt-border bg-basalt-popover p-4 text-basalt-popover-foreground shadow-md",
				className,
			)}
			{...props}
		/>
	</HoverCardPrimitive.Portal>
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;
