import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";
import {
	ChoiceGroupError,
	ChoiceGroupFieldset,
	ChoiceGroupLegend,
	ChoiceItemLabel,
} from "../utils/choice-group";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Circle } from "../utils/internal-icons";
import { FOCUS_RING } from "./overlay";

export type RadioSize = "sm" | "default";

const RADIO_SIZE_CLASS: Record<RadioSize, string> = {
	sm: "h-basalt-check-sm w-basalt-check-sm",
	default: "h-basalt-check w-basalt-check",
};

const RADIO_INDICATOR_CLASS: Record<RadioSize, string> = {
	sm: "h-basalt-1 w-basalt-1 fill-current text-current",
	default: "h-basalt-1_5 w-basalt-1_5 fill-current text-current",
};

export type RadioGroupProps = Omit<
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
	"disabled" | "value" | "defaultValue" | "onValueChange"
> & {
	/**
	 * The controlled selected value.
	 */
	value?: string;
	/**
	 * The initially selected value.
	 */
	defaultValue?: string;
	/**
	 * Called when the selected value changes.
	 */
	onValueChange?: (value: string) => void;
	/**
	 * Marks the group invalid and shows alert copy.
	 */
	error?: React.ReactNode;
	/**
	 * Disable every item in the group.
	 * @default false
	 */
	disabled?: boolean;
};

export type RadioLegendProps = React.ComponentPropsWithoutRef<"legend">;

export type RadioProps = Omit<
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
	"value"
> & {
	/**
	 * The value associated with the radio item.
	 */
	value: string;
	/**
	 * The visual size of the radio.
	 * @default default
	 */
	size?: RadioSize;
};

const RadioLegend = React.forwardRef<HTMLLegendElement, RadioLegendProps>(
	({ className, ...props }, ref) => (
		<ChoiceGroupLegend ref={ref} className={className} {...props} />
	),
);
RadioLegend.displayName = "Radio.Legend";

export const RadioGroup = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Root>,
	RadioGroupProps
>(
	(
		{
			className,
			error,
			disabled = false,
			children,
			"aria-describedby": describedBy,
			"aria-invalid": ariaInvalid,
			"aria-labelledby": labelledBy,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId();
		const invalid = Boolean(error);
		const errorId = `${generatedId}-error`;
		const defaultLegendId = `${generatedId}-legend`;
		const legends: React.ReactElement<RadioLegendProps>[] = [];
		const items: React.ReactNode[] = [];
		React.Children.forEach(children, (child) => {
			if (React.isValidElement(child) && child.type === RadioLegend) {
				legends.push(child as React.ReactElement<RadioLegendProps>);
				return;
			}
			items.push(child);
		});
		const labeledLegends = legends.map((legend, index) => {
			const legendId =
				legend.props.id ?? (index === 0 ? defaultLegendId : `${defaultLegendId}-${index}`);
			return React.cloneElement(legend, { key: legendId, id: legendId });
		});
		const legendIds = labeledLegends
			.map((legend) => legend.props.id)
			.filter(Boolean)
			.join(" ");
		const mergedLabelledBy = [legendIds, labelledBy].filter(Boolean).join(" ") || undefined;
		const mergedDescribedBy =
			[invalid ? errorId : null, describedBy].filter(Boolean).join(" ") || undefined;
		return (
			<ChoiceGroupFieldset disabled={disabled}>
				{labeledLegends}
				<RadioGroupPrimitive.Root
					ref={ref}
					disabled={disabled}
					className={cn("grid gap-basalt-space-lg", className)}
					{...props}
					aria-labelledby={mergedLabelledBy}
					aria-describedby={mergedDescribedBy}
					aria-invalid={invalid ? true : ariaInvalid}
				>
					{items}
				</RadioGroupPrimitive.Root>
				{invalid ? <ChoiceGroupError id={errorId}>{error}</ChoiceGroupError> : null}
			</ChoiceGroupFieldset>
		);
	},
);
RadioGroup.displayName = "Radio.Group";

const RadioRoot = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioProps>(
	({ className, size = "default", ...props }, ref) => (
		<RadioGroupPrimitive.Item
			ref={ref}
			className={cn(
				BASALT_UI_CLASS,
				"peer aspect-square shrink-0 cursor-pointer rounded-basalt-full border border-basalt-border bg-basalt-control text-basalt-primary-foreground shadow-basalt-well transition-colors basalt-motion hover:border-basalt-foreground/30 data-[state=checked]:border-basalt-primary data-[state=checked]:bg-basalt-primary data-[state=checked]:shadow-basalt-solid disabled:cursor-not-allowed disabled:opacity-50",
				RADIO_SIZE_CLASS[size],
				FOCUS_RING,
				className,
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator className="flex items-center justify-center animate-basalt-check-in motion-reduce:animate-none">
				<Circle className={RADIO_INDICATOR_CLASS[size]} />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	),
);
RadioRoot.displayName = RadioGroupPrimitive.Item.displayName;

const RadioItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioProps>(
	({ children, id, ...props }, ref) => {
		const generatedId = React.useId();
		const controlId = id ?? generatedId;
		if (children == null) {
			return <RadioRoot ref={ref} id={id} {...props} />;
		}
		return (
			<ChoiceItemLabel
				htmlFor={controlId}
				control={<RadioRoot ref={ref} id={controlId} {...props} />}
			>
				{children}
			</ChoiceItemLabel>
		);
	},
);
RadioItem.displayName = "Radio.Item";

export const Radio = Object.assign(RadioRoot, {
	Group: RadioGroup,
	Legend: RadioLegend,
	Item: RadioItem,
});
