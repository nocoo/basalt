import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";
import {
	ChoiceGroupError,
	ChoiceGroupFieldset,
	ChoiceGroupLegend,
	ChoiceItemLabel,
} from "../utils/choice-group";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Check, Minus } from "../utils/internal-icons";
import { useCheckableGroup } from "../utils/use-checkable-group";
import { FOCUS_RING } from "./overlay";

export type CheckboxSize = "sm" | "default";

const CHECKBOX_SIZE_CLASS: Record<CheckboxSize, string> = {
	sm: "h-basalt-check-sm w-basalt-check-sm",
	default: "h-basalt-check w-basalt-check",
};

const CHECK_ICON_CLASS: Record<CheckboxSize, string> = {
	sm: "hidden h-basalt-2_5 w-basalt-2_5 group-data-[state=checked]:block",
	default: "hidden h-basalt-3 w-basalt-3 group-data-[state=checked]:block",
};

const MINUS_ICON_CLASS: Record<CheckboxSize, string> = {
	sm: "hidden h-basalt-2_5 w-basalt-2_5 group-data-[state=indeterminate]:block",
	default: "hidden h-basalt-3 w-basalt-3 group-data-[state=indeterminate]:block",
};

type CheckboxGroupContextValue = {
	value: string[];
	setValue: (next: string[]) => void;
	disabled: boolean;
	invalid: boolean;
};

const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue | null>(null);

function nextCheckboxGroupValue(current: string[], itemValue: string, checked: boolean): string[] {
	if (checked) {
		return current.includes(itemValue) ? current : [...current, itemValue];
	}
	return current.filter((entry) => entry !== itemValue);
}

export type CheckboxProps = Omit<
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
	"checked"
> & {
	/**
	 * The controlled checked state of the checkbox.
	 */
	checked?: boolean | "indeterminate";
	/**
	 * The visual size of the checkbox.
	 * @default default
	 */
	size?: CheckboxSize;
};

export type CheckboxGroupProps = Omit<
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

export type CheckboxLegendProps = React.ComponentPropsWithoutRef<"legend">;

export type CheckboxItemProps = Omit<
	CheckboxProps,
	"checked" | "defaultChecked" | "onCheckedChange" | "value"
> & {
	/**
	 * The value stored in the group when this item is checked.
	 */
	value: string;
};

const CheckboxRoot = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	CheckboxProps
>(({ className, size = "default", ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			BASALT_UI_CLASS,
			"group peer shrink-0 cursor-pointer rounded-basalt-sm border border-basalt-border bg-basalt-control shadow-basalt-well transition-colors basalt-motion hover:border-basalt-foreground/30 data-[state=checked]:border-basalt-primary data-[state=checked]:bg-basalt-primary data-[state=checked]:text-basalt-primary-foreground data-[state=checked]:shadow-basalt-solid data-[state=indeterminate]:border-basalt-primary data-[state=indeterminate]:bg-basalt-primary data-[state=indeterminate]:text-basalt-primary-foreground data-[state=indeterminate]:shadow-basalt-solid disabled:cursor-not-allowed disabled:opacity-50",
			CHECKBOX_SIZE_CLASS[size],
			FOCUS_RING,
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator className="flex items-center justify-center text-current animate-basalt-check-in motion-reduce:animate-none">
			<Check className={CHECK_ICON_CLASS[size]} strokeWidth={2.25} />
			<Minus className={MINUS_ICON_CLASS[size]} strokeWidth={2.25} />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
CheckboxRoot.displayName = CheckboxPrimitive.Root.displayName;

const CheckboxGroup = React.forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
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
			<CheckboxGroupContext.Provider
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
			</CheckboxGroupContext.Provider>
		);
	},
);
CheckboxGroup.displayName = "Checkbox.Group";

const CheckboxLegend = React.forwardRef<HTMLLegendElement, CheckboxLegendProps>(
	({ className, ...props }, ref) => (
		<ChoiceGroupLegend ref={ref} className={className} {...props} />
	),
);
CheckboxLegend.displayName = "Checkbox.Legend";

const CheckboxItem = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	CheckboxItemProps
>(({ className, value, children, disabled, size, id, ...props }, ref) => {
	const group = React.useContext(CheckboxGroupContext);
	const grouped = group != null;
	const generatedId = React.useId();
	const controlId = id ?? generatedId;
	const isChecked = grouped ? group.value.includes(value) : undefined;
	const box = (
		<CheckboxRoot
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
				if (grouped && typeof next === "boolean") {
					group.setValue(nextCheckboxGroupValue(group.value, value, next));
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
CheckboxItem.displayName = "Checkbox.Item";

export const Checkbox = Object.assign(CheckboxRoot, {
	Group: CheckboxGroup,
	Legend: CheckboxLegend,
	Item: CheckboxItem,
});
