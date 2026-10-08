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
				"basalt-ui group/collapsible m-0 inline-flex min-w-0 cursor-pointer items-center gap-basalt-control-gap border-none bg-transparent p-0 text-left text-basalt-base font-medium leading-[var(--basalt-line-body)] text-basalt-foreground shadow-none select-none",
				FOCUS_INSET,
				OVERLAY_MOTION,
				className,
			)}
			{...props}
		>
			<span className="flex min-w-0 items-center gap-basalt-control-gap">{children}</span>
			<ChevronDown
				aria-hidden="true"
				data-slot="collapsible-chevron"
				className={cn(
					"size-basalt-icon-sm shrink-0 transition-transform basalt-motion duration-basalt-normal ease-basalt group-data-[state=open]/collapsible:rotate-180",
					OVERLAY_MOTION,
				)}
			/>
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
			<div className="my-basalt-layout-sm border-l-2 border-basalt-border px-basalt-card py-basalt-card-sm text-basalt-base text-basalt-foreground">
				{children}
			</div>
		)}
	</CollapsiblePrimitive.CollapsibleContent>
));
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName;
