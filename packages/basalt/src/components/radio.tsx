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
>(({ className, error, disabled = false, children, ...props }, ref) => {
	const generatedId = React.useId();
	const invalid = Boolean(error);
	const errorId = `${generatedId}-error`;
	const legends: React.ReactNode[] = [];
	const items: React.ReactNode[] = [];
	React.Children.forEach(children, (child) => {
		if (React.isValidElement(child) && child.type === RadioLegend) {
			legends.push(child);
			return;
		}
		items.push(child);
	});
	return (
		<fieldset
			disabled={disabled}
			aria-invalid={invalid || undefined}
			aria-describedby={invalid ? errorId : undefined}
			className="flex flex-col gap-2"
		>
			{legends}
			<RadioGroupPrimitive.Root
				ref={ref}
				disabled={disabled}
				className={cn("grid gap-2", className)}
				{...props}
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
});
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
