import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { ChevronDown } from "../utils/internal-icons";
import { FOCUS_RING, OVERLAY_MOTION } from "../utils/overlay";

type RadixAccordionSingleProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
	type: "single";
};
type RadixAccordionMultipleProps = React.ComponentPropsWithoutRef<
	typeof AccordionPrimitive.Root
> & { type: "multiple" };
type RadixAccordionItemProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>;

export interface AccordionSingleProps
	extends Omit<
		RadixAccordionSingleProps,
		| "type"
		| "value"
		| "defaultValue"
		| "onValueChange"
		| "collapsible"
		| "disabled"
		| "orientation"
		| "dir"
	> {
	/**
	 * Single-expansion mode where at most one item is open.
	 */
	type: "single";
	/**
	 * Controlled string value of the expanded accordion item. Root forwards ref to HTMLDivElement.
	 */
	value?: RadixAccordionSingleProps["value"];
	/**
	 * Initial string value of the expanded accordion item when uncontrolled.
	 * @default ""
	 */
	defaultValue?: RadixAccordionSingleProps["defaultValue"];
	/**
	 * Callback invoked when the expanded accordion item changes.
	 */
	onValueChange?: RadixAccordionSingleProps["onValueChange"];
	/**
	 * Whether an open accordion item can be closed by clicking its trigger again in single mode.
	 * @default false
	 */
	collapsible?: RadixAccordionSingleProps["collapsible"];
	/**
	 * Whether interaction with the entire accordion is disabled.
	 * @default false
	 */
	disabled?: RadixAccordionSingleProps["disabled"];
	/**
	 * Layout orientation of the accordion used for roving keyboard navigation.
	 * @default "vertical"
	 */
	orientation?: RadixAccordionSingleProps["orientation"];
	/**
	 * Reading direction of the accordion for bidirectional text layouts.
	 * @default "ltr"
	 */
	dir?: RadixAccordionSingleProps["dir"];
}

export interface AccordionMultipleProps
	extends Omit<
		RadixAccordionMultipleProps,
		"type" | "value" | "defaultValue" | "onValueChange" | "disabled" | "orientation" | "dir"
	> {
	/**
	 * Multiple-expansion mode where multiple items can be open concurrently.
	 */
	type: "multiple";
	/**
	 * Controlled string array of expanded accordion items. Root forwards ref to HTMLDivElement.
	 */
	value?: RadixAccordionMultipleProps["value"];
	/**
	 * Initial string array of expanded accordion items when uncontrolled.
	 * @default []
	 */
	defaultValue?: RadixAccordionMultipleProps["defaultValue"];
	/**
	 * Callback invoked when expanded accordion items change.
	 */
	onValueChange?: RadixAccordionMultipleProps["onValueChange"];
	/**
	 * Whether interaction with the entire accordion is disabled.
	 * @default false
	 */
	disabled?: RadixAccordionMultipleProps["disabled"];
	/**
	 * Layout orientation of the accordion used for roving keyboard navigation.
	 * @default "vertical"
	 */
	orientation?: RadixAccordionMultipleProps["orientation"];
	/**
	 * Reading direction of the accordion for bidirectional text layouts.
	 * @default "ltr"
	 */
	dir?: RadixAccordionMultipleProps["dir"];
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export const Accordion = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Root>,
	AccordionProps
>(({ className, ...props }, ref) => (
	<AccordionPrimitive.Root ref={ref} className={cn(BASALT_UI_CLASS, className)} {...props} />
));
Accordion.displayName = AccordionPrimitive.Root.displayName;

type RadixAccordionTriggerProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>;
type RadixAccordionContentProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>;

export interface AccordionItemProps extends Omit<RadixAccordionItemProps, "value" | "disabled"> {
	/**
	 * Unique string value identifying the accordion item. Item forwards ref to HTMLDivElement.
	 */
	value: RadixAccordionItemProps["value"];
	/**
	 * Whether this individual accordion item is disabled from user interaction.
	 * @default false
	 */
	disabled?: RadixAccordionItemProps["disabled"];
}

export const AccordionItem = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Item>,
	AccordionItemProps
>(({ className, ...props }, ref) => (
	<AccordionPrimitive.Item
		ref={ref}
		className={cn("border-b border-basalt-border last:border-b-0", className)}
		{...props}
	/>
));
AccordionItem.displayName = AccordionPrimitive.Item.displayName;

export interface AccordionTriggerProps extends Omit<RadixAccordionTriggerProps, "asChild"> {
	/**
	 * Change the default rendered button element to the child element, merging props and behavior.
	 * Trigger forwards ref to HTMLButtonElement and inherits native button attributes.
	 * @default false
	 */
	asChild?: RadixAccordionTriggerProps["asChild"];
}

export const AccordionTrigger = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Trigger>,
	AccordionTriggerProps
>(({ className, children, asChild = false, ...props }, ref) => (
	<AccordionPrimitive.Header className={cn(BASALT_UI_CLASS, "flex")}>
		{asChild ? (
			<AccordionPrimitive.Trigger ref={ref} asChild className={className} {...props}>
				{children}
			</AccordionPrimitive.Trigger>
		) : (
			<AccordionPrimitive.Trigger
				ref={ref}
				className={cn(
					BASALT_UI_CLASS,
					"group/accordion flex flex-1 cursor-pointer items-center justify-between gap-basalt-space-lg rounded-basalt-sm py-basalt-card-sm text-left text-basalt-base font-medium text-basalt-foreground transition-colors basalt-motion hover:[&_[data-slot=accordion-chevron]]:text-basalt-foreground disabled:pointer-events-none disabled:opacity-50",
					FOCUS_RING,
					className,
				)}
				{...props}
			>
				<span>{children}</span>
				<ChevronDown
					aria-hidden="true"
					data-slot="accordion-chevron"
					className={cn(
						"size-basalt-icon-sm shrink-0 text-basalt-muted-foreground transition-transform basalt-motion duration-basalt-normal ease-basalt group-data-[state=open]/accordion:rotate-180",
						OVERLAY_MOTION,
					)}
				/>
			</AccordionPrimitive.Trigger>
		)}
	</AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

export interface AccordionContentProps
	extends Omit<RadixAccordionContentProps, "asChild" | "forceMount"> {
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Content forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixAccordionContentProps["asChild"];
	/**
	 * Force mounting content in DOM for external animation controls. Content unmounts when closed if omitted.
	 */
	forceMount?: RadixAccordionContentProps["forceMount"];
}

export const AccordionContent = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Content>,
	AccordionContentProps
>(({ className, children, asChild = false, ...props }, ref) => (
	<AccordionPrimitive.Content
		ref={ref}
		asChild={asChild}
		className={cn(
			"overflow-hidden text-basalt-base text-basalt-muted-foreground data-[state=closed]:animate-basalt-accordion-up data-[state=open]:animate-basalt-accordion-down",
			OVERLAY_MOTION,
			className,
		)}
		{...props}
	>
		{asChild ? children : <div className="pb-basalt-card-sm pt-0">{children}</div>}
	</AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
