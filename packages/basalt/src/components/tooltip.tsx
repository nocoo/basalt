import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { cn } from "../utils/cn";
import { OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

type RadixTooltipProviderProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>;
type RadixTooltipProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;
type RadixTooltipTriggerProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>;
type RadixTooltipContentProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

export interface TooltipProviderProps
	extends Omit<
		RadixTooltipProviderProps,
		"children" | "delayDuration" | "skipDelayDuration" | "disableHoverableContent"
	> {
	/**
	 * Application or component tree wrapped by the tooltip provider context.
	 */
	children: React.ReactNode;
	/**
	 * Default delay before tooltips open when pointer enters a trigger, in milliseconds.
	 * Can be overridden per tooltip instance via Tooltip.
	 * @default 700
	 */
	delayDuration?: RadixTooltipProviderProps["delayDuration"];
	/**
	 * Duration in milliseconds a user has to enter another trigger without incurring the opening delay again.
	 * @default 300
	 */
	skipDelayDuration?: RadixTooltipProviderProps["skipDelayDuration"];
	/**
	 * When true, moving pointer into tooltip content closes the tooltip as pointer leaves trigger.
	 * @default false
	 */
	disableHoverableContent?: RadixTooltipProviderProps["disableHoverableContent"];
}

export const TooltipProvider: React.FC<TooltipProviderProps> = TooltipPrimitive.Provider;

export interface TooltipProps
	extends Omit<
		RadixTooltipProps,
		| "children"
		| "open"
		| "defaultOpen"
		| "onOpenChange"
		| "delayDuration"
		| "disableHoverableContent"
	> {
	/**
	 * Content elements rendered within the tooltip root, typically a TooltipTrigger and TooltipContent.
	 */
	children?: React.ReactNode;
	/**
	 * Controlled open state of the tooltip.
	 */
	open?: RadixTooltipProps["open"];
	/**
	 * Uncontrolled initial open state of the tooltip.
	 * @default false
	 */
	defaultOpen?: RadixTooltipProps["defaultOpen"];
	/**
	 * Callback called when the open state changes.
	 */
	onOpenChange?: RadixTooltipProps["onOpenChange"];
	/**
	 * Delay before the tooltip opens, in milliseconds. Overrides TooltipProvider delayDuration.
	 * Defaults to provider value (typically 700ms).
	 */
	delayDuration?: RadixTooltipProps["delayDuration"];
	/**
	 * When true, moving pointer into tooltip content closes the tooltip as pointer leaves trigger.
	 * Overrides TooltipProvider setting.
	 */
	disableHoverableContent?: RadixTooltipProps["disableHoverableContent"];
}

export const Tooltip: React.FC<TooltipProps> = TooltipPrimitive.Root;

export interface TooltipTriggerProps extends Omit<RadixTooltipTriggerProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * TooltipTrigger forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixTooltipTriggerProps["asChild"];
}

export const TooltipTrigger = TooltipPrimitive.Trigger;

export interface TooltipContentProps
	extends Omit<
		RadixTooltipContentProps,
		| "aria-label"
		| "onEscapeKeyDown"
		| "onPointerDownOutside"
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
	> {
	/**
	 * A more descriptive accessible label announced by screen readers.
	 */
	"aria-label"?: RadixTooltipContentProps["aria-label"];
	/**
	 * Callback fired when the Escape key is down on the tooltip content layer. Can be prevented.
	 */
	onEscapeKeyDown?: RadixTooltipContentProps["onEscapeKeyDown"];
	/**
	 * Callback fired when a pointerdown event happens outside the bounds of the tooltip. Can be prevented.
	 */
	onPointerDownOutside?: RadixTooltipContentProps["onPointerDownOutside"];
	/**
	 * Preferred placement side relative to trigger.
	 * @default "top"
	 */
	side?: RadixTooltipContentProps["side"];
	/**
	 * Distance in pixels between trigger and floating content panel.
	 * @default 4
	 */
	sideOffset?: RadixTooltipContentProps["sideOffset"];
	/**
	 * Preferred alignment along the side axis.
	 * @default "center"
	 */
	align?: RadixTooltipContentProps["align"];
	/**
	 * Offset in pixels from the start or end alignment position.
	 * @default 0
	 */
	alignOffset?: RadixTooltipContentProps["alignOffset"];
	/**
	 * Whether to reposition content to avoid viewport boundary collisions.
	 * @default true
	 */
	avoidCollisions?: RadixTooltipContentProps["avoidCollisions"];
	/**
	 * Element or elements bounding boundary collision calculations.
	 * @default []
	 */
	collisionBoundary?: RadixTooltipContentProps["collisionBoundary"];
	/**
	 * Virtual padding from collision boundaries in pixels.
	 * @default 0
	 */
	collisionPadding?: RadixTooltipContentProps["collisionPadding"];
	/**
	 * Padding in pixels between popper arrow and floating panel edge.
	 * @default 0
	 */
	arrowPadding?: RadixTooltipContentProps["arrowPadding"];
	/**
	 * Sticky positioning behavior along the align axis when overflowing.
	 * @default "partial"
	 */
	sticky?: RadixTooltipContentProps["sticky"];
	/**
	 * Whether to hide content completely when trigger is fully occluded.
	 * @default false
	 */
	hideWhenDetached?: RadixTooltipContentProps["hideWhenDetached"];
	/**
	 * Strategy used to calculate and update popper position.
	 * @default "optimized"
	 */
	updatePositionStrategy?: RadixTooltipContentProps["updatePositionStrategy"];
	/**
	 * Force mounting content in DOM for external animation controls.
	 * When forceMount is true, the content remains mounted even when closed.
	 * The caller is responsible for visibility transitions and unmounting after animation completes.
	 */
	forceMount?: true;
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * TooltipContent forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixTooltipContentProps["asChild"];
}

export const TooltipContent = React.forwardRef<
	React.ElementRef<typeof TooltipPrimitive.Content>,
	TooltipContentProps
>(({ className, sideOffset = 4, ...props }, ref) => (
	<TooltipPrimitive.Portal forceMount={props.forceMount}>
		<TooltipPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn(
				OVERLAY_LAYER,
				OVERLAY_MOTION,
				"overflow-hidden rounded-basalt-md border border-basalt-border bg-basalt-popover px-3 py-1.5 text-sm text-basalt-popover-foreground shadow-md",
				className,
			)}
			{...props}
		/>
	</TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
