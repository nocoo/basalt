import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
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
	 * When multiple values are provided, renders a thumb for each value.
	 */
	value?: RadixSliderRootProps["value"];
	/**
	 * Uncontrolled default value array for the slider.
	 * When multiple values are provided, renders a thumb for each value.
	 * @default [min ?? 0]
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
	 * When set to `"vertical"`, the slider track and range align vertically. A container with an explicit height is required.
	 * @default "horizontal"
	 */
	orientation?: RadixSliderRootProps["orientation"];
	/**
	 * Accessible labels for thumbs when rendering single or multiple values.
	 * When provided, thumb at index `i` receives `labels[i]`. For a single thumb, `labels[0]` takes precedence over `aria-label`.
	 * When omitted on a multi-value slider, the root `aria-label` provides a contextual fallback (e.g. `ariaLabel + " minimum"`),
	 * or falls back to Radix default names (`"Minimum"`, `"Maximum"`, or `"Value N of Total"`).
	 */
	labels?: string[];
}

export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
	(
		{
			className,
			value,
			defaultValue,
			min = 0,
			max = 100,
			orientation = "horizontal",
			labels,
			"aria-label": ariaLabel,
			"aria-labelledby": ariaLabelledBy,
			...props
		},
		ref,
	) => {
		const isVertical = orientation === "vertical";
		const isControlled = value !== undefined;

		const initialUncontrolledCountRef = React.useRef(defaultValue?.length ?? 1);
		const thumbCount = isControlled ? (value?.length ?? 0) : initialUncontrolledCountRef.current;

		return (
			<SliderPrimitive.Root
				ref={ref}
				min={min}
				max={max}
				orientation={orientation}
				value={value}
				defaultValue={defaultValue}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				className={cn(
					BASALT_UI_CLASS,
					"relative flex touch-none select-none items-center",
					isVertical ? "h-full w-auto flex-col justify-center" : "h-auto w-full",
					className,
				)}
				{...props}
			>
				<SliderPrimitive.Track
					className={cn(
						"relative grow overflow-hidden rounded-full bg-basalt-muted",
						isVertical ? "h-full w-2" : "h-2 w-full",
					)}
				>
					<SliderPrimitive.Range
						className={cn("absolute bg-basalt-primary", isVertical ? "w-full" : "h-full")}
					/>
				</SliderPrimitive.Track>
				{Array.from({ length: thumbCount }, (_, index) => {
					let thumbLabel: string | undefined;
					let thumbLabelledBy: string | undefined;

					if (thumbCount === 1) {
						thumbLabel = labels?.[0] ?? ariaLabel;
						thumbLabelledBy = ariaLabelledBy;
					} else {
						if (labels?.[index] !== undefined) {
							thumbLabel = labels[index];
						} else if (ariaLabel) {
							if (thumbCount === 2) {
								const suffix = index === 0 ? "minimum" : "maximum";
								thumbLabel = `${ariaLabel} ${suffix}`;
							} else {
								thumbLabel = `${ariaLabel} thumb ${index + 1} of ${thumbCount}`;
							}
						}
					}

					const thumbProps: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb> = {
						className: cn(
							"block h-4 w-4 rounded-full border border-basalt-primary bg-basalt-background shadow",
							FOCUS_RING,
						),
					};
					if (thumbLabel !== undefined) {
						thumbProps["aria-label"] = thumbLabel;
					}
					if (thumbLabelledBy !== undefined) {
						thumbProps["aria-labelledby"] = thumbLabelledBy;
					}

					return <SliderPrimitive.Thumb key={index} {...thumbProps} />;
				})}
			</SliderPrimitive.Root>
		);
	},
);
Slider.displayName = SliderPrimitive.Root.displayName;
