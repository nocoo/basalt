import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";
import {
	ChoiceGroupError,
	ChoiceGroupFieldset,
	ChoiceGroupLegend,
	ChoiceItemLabel,
} from "../utils/choice-group";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { useCheckableGroup } from "../utils/use-checkable-group";
import { FOCUS_RING } from "./overlay";

type SwitchGroupContextValue = {
	value: string[];
	setValue: (next: string[]) => void;
	disabled: boolean;
	invalid: boolean;
};

const SwitchGroupContext = React.createContext<SwitchGroupContextValue | null>(null);

function nextSwitchGroupValue(current: string[], itemValue: string, checked: boolean): string[] {
	if (checked) {
		return current.includes(itemValue) ? current : [...current, itemValue];
	}
	return current.filter((entry) => entry !== itemValue);
}

export type SwitchProps = Omit<
	React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
	"checked"
> & {
	/**
	 * The controlled checked state of the switch.
	 */
	checked?: boolean;
	/**
	 * The visual size of the switch.
	 * @default default
	 */
	size?: "default" | "sm";
};

export type SwitchGroupProps = Omit<
	React.ComponentPropsWithoutRef<"fieldset">,
	"onChange" | "defaultValue" | "disabled"
> & {
	/**
	 * The controlled selected values.
	 */
	value?: string[];
	/**
	 * The initially selected values.
	 */
	defaultValue?: string[];
	/**
	 * Called when the selected values change.
	 */
	onValueChange?: (value: string[]) => void;
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

export type SwitchLegendProps = React.ComponentPropsWithoutRef<"legend">;

export type SwitchItemProps = Omit<
	SwitchProps,
	"checked" | "defaultChecked" | "onCheckedChange" | "value"
> & {
	/**
	 * The value stored in the group when this item is on.
	 */
	value: string;
};

const SwitchRoot = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
	({ className, size = "default", ...props }, ref) => (
		<SwitchPrimitives.Root
			className={cn(
				BASALT_UI_CLASS,
				"peer inline-flex shrink-0 cursor-pointer items-center rounded-basalt-full border-2 border-transparent transition-colors basalt-motion data-[state=unchecked]:bg-basalt-well data-[state=unchecked]:shadow-basalt-well data-[state=unchecked]:hover:bg-basalt-input data-[state=checked]:bg-basalt-primary data-[state=checked]:shadow-basalt-solid data-[state=checked]:hover:bg-basalt-primary-hover disabled:cursor-not-allowed disabled:opacity-50",
				FOCUS_RING,
				size === "sm" ? "h-basalt-4 w-basalt-7" : "h-basalt-4_5 w-basalt-8",
				className,
			)}
			{...props}
			ref={ref}
		>
			<SwitchPrimitives.Thumb
				className={cn(
					"pointer-events-none block rounded-basalt-full bg-basalt-on-solid shadow-basalt-knob transition-transform basalt-motion data-[state=unchecked]:translate-x-0 active:scale-95",
					size === "sm"
						? "h-basalt-3 w-basalt-3 data-[state=checked]:translate-x-basalt-3"
						: "h-basalt-3_5 w-basalt-3_5 data-[state=checked]:translate-x-basalt-3_5",
				)}
			/>
		</SwitchPrimitives.Root>
	),
);
SwitchRoot.displayName = SwitchPrimitives.Root.displayName;

const SwitchGroup = React.forwardRef<HTMLFieldSetElement, SwitchGroupProps>(
	(
		{
			className,
			value,
			defaultValue,
			onValueChange,
			error,
			disabled = false,
			children,
			"aria-describedby": describedBy,
			"aria-invalid": ariaInvalid,
			...props
		},
		ref,
	) => {
		const group = useCheckableGroup({
			value,
			defaultValue,
			onValueChange,
			error,
			describedBy,
			ariaInvalid,
			form: props.form,
			ref,
		});
		return (
			<SwitchGroupContext.Provider
				value={{ value: group.current, setValue: group.setValue, disabled, invalid: group.invalid }}
			>
				<ChoiceGroupFieldset
					ref={group.setRefs}
					{...props}
					disabled={disabled}
					aria-invalid={group.ariaInvalid}
					aria-describedby={group.mergedDescribedBy}
					className={className}
				>
					{children}
					{group.invalid ? <ChoiceGroupError id={group.errorId}>{error}</ChoiceGroupError> : null}
				</ChoiceGroupFieldset>
			</SwitchGroupContext.Provider>
		);
	},
);
SwitchGroup.displayName = "Switch.Group";

const SwitchLegend = React.forwardRef<HTMLLegendElement, SwitchLegendProps>(
	({ className, ...props }, ref) => (
		<ChoiceGroupLegend ref={ref} className={className} {...props} />
	),
);
SwitchLegend.displayName = "Switch.Legend";

const SwitchItem = React.forwardRef<
	React.ElementRef<typeof SwitchPrimitives.Root>,
	SwitchItemProps
>(({ className, value, children, disabled, size, id, ...props }, ref) => {
	const group = React.useContext(SwitchGroupContext);
	const grouped = group != null;
	const generatedId = React.useId();
	const controlId = id ?? generatedId;
	const isChecked = grouped ? group.value.includes(value) : undefined;
	const box = (
		<SwitchRoot
			ref={ref}
			{...props}
			id={controlId}
			value={value}
			size={size}
			checked={isChecked}
			defaultChecked={grouped ? isChecked : undefined}
			disabled={disabled || group?.disabled}
			aria-invalid={group?.invalid || undefined}
			className={className}
			onCheckedChange={(next) => {
				if (grouped) {
					group.setValue(nextSwitchGroupValue(group.value, value, next));
				}
			}}
		/>
	);
	if (children == null) {
		return box;
	}
	return (
		<ChoiceItemLabel htmlFor={controlId} control={box}>
			{children}
		</ChoiceItemLabel>
	);
});
SwitchItem.displayName = "Switch.Item";

export const Switch = Object.assign(SwitchRoot, {
	Group: SwitchGroup,
	Legend: SwitchLegend,
	Item: SwitchItem,
});
