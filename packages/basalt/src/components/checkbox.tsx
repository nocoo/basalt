import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { FOCUS_RING } from "./overlay";

export type CheckboxSize = "sm" | "default";

const CHECKBOX_SIZE_CLASS: Record<CheckboxSize, string> = {
	sm: "h-3 w-3",
	default: "h-4 w-4",
};

const CHECK_ICON_CLASS: Record<CheckboxSize, string> = {
	sm: "hidden h-3 w-3 group-data-[state=checked]:block",
	default: "hidden h-4 w-4 group-data-[state=checked]:block",
};

const MINUS_ICON_CLASS: Record<CheckboxSize, string> = {
	sm: "hidden h-2.5 w-2.5 group-data-[state=indeterminate]:block",
	default: "hidden h-3 w-3 group-data-[state=indeterminate]:block",
};

type CheckboxGroupContextValue = {
	value: string[];
	setValue: (next: string[]) => void;
	disabled: boolean;
	invalid: boolean;
};

const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue | null>(null);

export function nextCheckboxGroupValue(
	current: string[],
	itemValue: string,
	checked: boolean,
): string[] {
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
			"group peer shrink-0 rounded-[4px] border border-basalt-primary data-[state=checked]:bg-basalt-primary data-[state=checked]:text-basalt-primary-foreground data-[state=indeterminate]:bg-basalt-primary data-[state=indeterminate]:text-basalt-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
			CHECKBOX_SIZE_CLASS[size],
			FOCUS_RING,
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
			<Check className={CHECK_ICON_CLASS[size]} />
			<Minus className={MINUS_ICON_CLASS[size]} />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
CheckboxRoot.displayName = CheckboxPrimitive.Root.displayName;

const CheckboxGroup = React.forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
	(
		{ className, value, defaultValue, onValueChange, error, disabled = false, children, ...props },
		ref,
	) => {
		const generatedId = React.useId();
		const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? []);
		const current = value ?? uncontrolled;
		const invalid = Boolean(error);
		const errorId = `${generatedId}-error`;
		const setValue = React.useCallback(
			(next: string[]) => {
				if (value === undefined) {
					setUncontrolled(next);
				}
				onValueChange?.(next);
			},
			[onValueChange, value],
		);
		return (
			<CheckboxGroupContext.Provider value={{ value: current, setValue, disabled, invalid }}>
				<fieldset
					ref={ref}
					{...props}
					disabled={disabled}
					aria-invalid={invalid || undefined}
					aria-describedby={invalid ? errorId : undefined}
					className={cn("flex flex-col gap-2", className)}
				>
					{children}
					{invalid ? (
						<p id={errorId} className="text-xs text-basalt-destructive" role="alert">
							{error}
						</p>
					) : null}
				</fieldset>
			</CheckboxGroupContext.Provider>
		);
	},
);
CheckboxGroup.displayName = "Checkbox.Group";

const CheckboxLegend = React.forwardRef<HTMLLegendElement, CheckboxLegendProps>(
	({ className, ...props }, ref) => (
		<legend
			ref={ref}
			className={cn("text-sm font-medium text-basalt-foreground", className)}
			{...props}
		/>
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
	const box = (
		<CheckboxRoot
			ref={ref}
			{...props}
			id={controlId}
			value={value}
			size={size}
			checked={grouped ? group.value.includes(value) : undefined}
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
		<label htmlFor={controlId} className="flex items-center gap-2 text-sm text-basalt-foreground">
			{box}
			{children}
		</label>
	);
});
CheckboxItem.displayName = "Checkbox.Item";

export const Checkbox = Object.assign(CheckboxRoot, {
	Group: CheckboxGroup,
	Legend: CheckboxLegend,
	Item: CheckboxItem,
});
