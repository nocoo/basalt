import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "../utils/cn";
import { FOCUS_RING } from "./overlay";

type RadixSliderRootProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

export interface SliderProps
	extends Omit<
		RadixSliderRootProps,
		| "value"
		| "defaultValue"
		| "onValueChange"
		| "onValueCommit"
		| "disabled"
		| "name"
		| "min"
		| "max"
		| "step"
		| "orientation"
	> {
	/**
	 * Controlled value array for the slider. Forwards ref to root span element.
	 * Currently renders a single thumb; root aria-label does not label an independent thumb.
	 */
	value?: RadixSliderRootProps["value"];
	/**
	 * Uncontrolled default value array for the slider. Currently renders a single thumb.
	 */
	defaultValue?: RadixSliderRootProps["defaultValue"];
	/**
	 * Callback invoked when slider value changes during interaction.
	 */
	onValueChange?: RadixSliderRootProps["onValueChange"];
	/**
	 * Callback invoked when slider interaction finishes and value is committed.
	 */
	onValueCommit?: RadixSliderRootProps["onValueCommit"];
	/**
	 * Whether the slider is disabled from user interaction.
	 * @default false
	 */
	disabled?: RadixSliderRootProps["disabled"];
	/**
	 * Form field name submitted with the slider values.
	 */
	name?: RadixSliderRootProps["name"];
	/**
	 * Minimum allowable value.
	 * @default 0
	 */
	min?: RadixSliderRootProps["min"];
	/**
	 * Maximum allowable value.
	 * @default 100
	 */
	max?: RadixSliderRootProps["max"];
	/**
	 * Step interval between selectable values.
	 * @default 1
	 */
	step?: RadixSliderRootProps["step"];
	/**
	 * Layout orientation of the slider track.
	 * @default "horizontal"
	 */
	orientation?: RadixSliderRootProps["orientation"];
}

export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
	({ className, ...props }, ref) => (
		<SliderPrimitive.Root
			ref={ref}
			className={cn("relative flex w-full touch-none select-none items-center", className)}
			{...props}
		>
			<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-basalt-muted">
				<SliderPrimitive.Range className="absolute h-full bg-basalt-primary" />
			</SliderPrimitive.Track>
			<SliderPrimitive.Thumb
				className={cn(
					"block h-4 w-4 rounded-full border border-basalt-primary bg-basalt-background shadow",
					FOCUS_RING,
				)}
			/>
		</SliderPrimitive.Root>
	),
);
Slider.displayName = SliderPrimitive.Root.displayName;
