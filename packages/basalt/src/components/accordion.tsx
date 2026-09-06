import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

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

export const AccordionItem = AccordionPrimitive.Item;

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
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Header className={cn(BASALT_UI_CLASS, "flex")}>
		<AccordionPrimitive.Trigger
			ref={ref}
			className={cn(
				BASALT_UI_CLASS,
				"flex flex-1 items-center justify-between py-3 text-sm font-medium",
				className,
			)}
			{...props}
		>
			{children}
		</AccordionPrimitive.Trigger>
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

export const AccordionContent = AccordionPrimitive.Content;
