import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { FOCUS_RING } from "./overlay";

export type RadioSize = "sm" | "default";

const RADIO_SIZE_CLASS: Record<RadioSize, string> = {
	sm: "h-3 w-3",
	default: "h-4 w-4",
};

const RADIO_INDICATOR_CLASS: Record<RadioSize, string> = {
	sm: "h-1.5 w-1.5 fill-current text-current",
	default: "h-2.5 w-2.5 fill-current text-current",
};

export type RadioGroupProps = Omit<
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
	"disabled"
> & {
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
		<legend
			ref={ref}
			className={cn("text-sm font-medium text-basalt-foreground", className)}
			{...props}
		/>
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
			<fieldset disabled={disabled} className="flex flex-col gap-2">
				{labeledLegends}
				<RadioGroupPrimitive.Root
					ref={ref}
					disabled={disabled}
					className={cn("grid gap-2", className)}
					{...props}
					aria-labelledby={mergedLabelledBy}
					aria-describedby={mergedDescribedBy}
					aria-invalid={invalid ? true : ariaInvalid}
				>
					{items}
				</RadioGroupPrimitive.Root>
				{invalid ? (
					<p id={errorId} className="text-xs text-basalt-destructive" role="alert">
						{error}
					</p>
				) : null}
			</fieldset>
		);
	},
);
RadioGroup.displayName = "Radio.Group";

const RadioRoot = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioProps>(
	({ className, size = "default", ...props }, ref) => (
		<RadioGroupPrimitive.Item
			ref={ref}
			className={cn(
				"aspect-square shrink-0 rounded-full border border-basalt-primary text-basalt-primary disabled:cursor-not-allowed disabled:opacity-50",
				RADIO_SIZE_CLASS[size],
				FOCUS_RING,
				className,
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
				<Circle className={RADIO_INDICATOR_CLASS[size]} />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	),
);
RadioRoot.displayName = RadioGroupPrimitive.Item.displayName;

export const Radio = Object.assign(RadioRoot, {
	Group: RadioGroup,
	Legend: RadioLegend,
	Item: RadioRoot,
});
