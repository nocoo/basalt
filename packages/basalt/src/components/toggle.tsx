import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { FOCUS_RING } from "./overlay";

const toggleVariants = cva(
	`${BASALT_UI_CLASS} inline-flex items-center justify-center rounded-basalt-md text-sm font-medium transition-colors hover:bg-basalt-accent data-[state=on]:bg-basalt-accent ${FOCUS_RING}`,
	{
		variants: {
			variant: {
				default: "bg-basalt-muted text-basalt-foreground",
				outline: "border border-basalt-border bg-basalt-secondary",
			},
			size: { default: "h-9 px-3", sm: "h-8 px-2 text-xs", lg: "h-10 px-4" },
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
