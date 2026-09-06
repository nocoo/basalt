import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { FOCUS_INSET, OVERLAY_MOTION } from "./overlay";

type RadixCollapsibleProps = React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>;
type RadixCollapsibleTriggerProps = React.ComponentPropsWithoutRef<
	typeof CollapsiblePrimitive.CollapsibleTrigger
>;
type RadixCollapsibleContentProps = React.ComponentPropsWithoutRef<
	typeof CollapsiblePrimitive.CollapsibleContent
>;

export interface CollapsibleProps
	extends Omit<
		RadixCollapsibleProps,
		"open" | "defaultOpen" | "onOpenChange" | "disabled" | "asChild" | "children"
	> {
	/**
	 * Collapsible structure elements, typically CollapsibleTrigger and CollapsibleContent.
	 */
	children?: React.ReactNode;
	/**
	 * The controlled open state of the collapsible.
	 */
	open?: RadixCollapsibleProps["open"];
	/**
	 * The uncontrolled initial open state of the collapsible.
	 * @default false
	 */
	defaultOpen?: RadixCollapsibleProps["defaultOpen"];
	/**
	 * Called when the open state changes.
	 */
	onOpenChange?: RadixCollapsibleProps["onOpenChange"];
	/**
	 * When true, prevents the user from interacting with the collapsible.
	 * @default false
	 */
	disabled?: RadixCollapsibleProps["disabled"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Note: Collapsible root is typed as React.FC and does not declare ref in its public Props;
	 * forwards rest props and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixCollapsibleProps["asChild"];
}

export const Collapsible: React.FC<CollapsibleProps> = CollapsiblePrimitive.Root;

export interface CollapsibleTriggerProps
	extends Omit<RadixCollapsibleTriggerProps, "asChild" | "children"> {
	/**
	 * Content of the trigger button. When asChild is false, automatically renders
	 * a text container span alongside an animated ChevronDown icon.
	 */
	children?: React.ReactNode;
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * When true, bypasses the default text span and ChevronDown icon wrapping.
	 * CollapsibleTrigger forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixCollapsibleTriggerProps["asChild"];
}

export const CollapsibleTrigger = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
	CollapsibleTriggerProps
>(({ className, children, asChild = false, ...props }, ref) => {
	if (asChild) {
		return (
			<CollapsiblePrimitive.CollapsibleTrigger ref={ref} asChild className={className} {...props}>
				{children}
			</CollapsiblePrimitive.CollapsibleTrigger>
		);
	}
	return (
		<CollapsiblePrimitive.CollapsibleTrigger
			ref={ref}
			className={cn(
				"m-0 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-sm font-medium text-basalt-foreground shadow-none select-none",
				FOCUS_INSET,
				"[&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:origin-center [&_svg]:transition-transform [&_svg]:duration-100 [&_svg]:ease-out",
				"data-[state=open]:[&_svg]:rotate-180",
				OVERLAY_MOTION,
				className,
			)}
			{...props}
		>
			<span>{children}</span>
			<ChevronDown aria-hidden="true" className={OVERLAY_MOTION} />
		</CollapsiblePrimitive.CollapsibleTrigger>
	);
});
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName;

export interface CollapsibleContentProps
	extends Omit<RadixCollapsibleContentProps, "unstyled" | "forceMount" | "asChild"> {
	/**
	 * Render children without the default inset border container.
	 * Note: When unstyled is false (default), children are wrapped in an inner inset border div.
	 * When combined with asChild, asChild slots onto that inner div unless unstyled={true} is set.
	 * @default false
	 */
	unstyled?: boolean;
	/**
	 * Used to force mounting when more control is needed. Useful when
	 * controlling animation with React animation libraries.
	 */
	forceMount?: RadixCollapsibleContentProps["forceMount"];
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Note: When unstyled is false, asChild operates within the inner inset div wrapper;
	 * set unstyled={true} to slot directly onto the child element as the content/ref target.
	 * CollapsibleContent forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixCollapsibleContentProps["asChild"];
}

export const CollapsibleContent = React.forwardRef<
	React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
	CollapsibleContentProps
>(({ className, children, unstyled = false, ...props }, ref) => (
	<CollapsiblePrimitive.CollapsibleContent
		ref={ref}
		className={cn(
			"overflow-hidden data-[state=closed]:animate-basalt-collapsible-up data-[state=open]:animate-basalt-collapsible-down",
			OVERLAY_MOTION,
			className,
		)}
		{...props}
	>
		{unstyled ? (
			children
		) : (
			<div className="my-2 border-l-2 border-basalt-border py-1 pr-1 pl-4 text-sm text-basalt-foreground">
				{children}
			</div>
		)}
	</CollapsiblePrimitive.CollapsibleContent>
));
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName;
