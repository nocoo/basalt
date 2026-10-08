import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { FOCUS_RING } from "./overlay";

const toggleVariants = cva(
	`${BASALT_UI_CLASS} basalt-choice relative inline-flex cursor-pointer items-center justify-center rounded-basalt-md font-medium transition-colors basalt-motion before:absolute before:-inset-basalt-border-width hover:bg-basalt-hover ${FOCUS_RING}`,
	{
		variants: {
			variant: {
				default: "bg-basalt-control text-basalt-foreground",
				outline: "border border-basalt-border bg-basalt-control",
			},
			size: {
				default: "basalt-action",
				sm: "basalt-action basalt-action-sm",
				lg: "basalt-action basalt-action-lg",
			},
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

type RadixToggleProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>;

export interface ToggleProps
	extends Omit<RadixToggleProps, "pressed" | "defaultPressed" | "onPressedChange" | "disabled">,
		Omit<VariantProps<typeof toggleVariants>, "variant" | "size"> {
	/**
	 * Visual style variant.
	 * @default "default"
	 */
	variant?: VariantProps<typeof toggleVariants>["variant"];
	/**
	 * Sizing preset.
	 * @default "default"
	 */
	size?: VariantProps<typeof toggleVariants>["size"];
	/**
	 * Controlled pressed state of the toggle. Forwards ref to HTMLButtonElement.
	 */
	pressed?: RadixToggleProps["pressed"];
	/**
	 * Uncontrolled pressed state when initially rendered.
	 * @default false
	 */
	defaultPressed?: RadixToggleProps["defaultPressed"];
	/**
	 * Callback invoked when pressed state changes.
	 */
	onPressedChange?: RadixToggleProps["onPressedChange"];
	/**
	 * Whether the toggle is disabled from user interaction.
	 * @default false
	 */
	disabled?: RadixToggleProps["disabled"];
}

export const Toggle = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, ToggleProps>(
	({ className, variant, size, ...props }, ref) => (
		<TogglePrimitive.Root
			ref={ref}
			className={cn(toggleVariants({ variant, size }), className)}
			{...props}
		/>
	),
);
Toggle.displayName = TogglePrimitive.Root.displayName;
