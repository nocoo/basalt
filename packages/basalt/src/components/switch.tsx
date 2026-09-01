import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "../utils/cn";
import { FOCUS_RING } from "./overlay";

type SwitchGroupContextValue = {
	value: string[];
	setValue: (next: string[]) => void;
	disabled: boolean;
	invalid: boolean;
};

const SwitchGroupContext = React.createContext<SwitchGroupContextValue | null>(null);

export function nextSwitchGroupValue(
	current: string[],
	itemValue: string,
	checked: boolean,
): string[] {
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
				"peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-basalt-primary data-[state=unchecked]:bg-basalt-input disabled:cursor-not-allowed disabled:opacity-50",
				FOCUS_RING,
				size === "sm" ? "h-4 w-7" : "h-6 w-11",
				className,
			)}
			{...props}
			ref={ref}
		>
			<SwitchPrimitives.Thumb
				className={cn(
					"pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
					size === "sm"
						? "h-3 w-3 data-[state=checked]:translate-x-3"
						: "h-5 w-5 data-[state=checked]:translate-x-5",
				)}
			/>
		</SwitchPrimitives.Root>
	),
);
SwitchRoot.displayName = SwitchPrimitives.Root.displayName;

const SwitchGroup = React.forwardRef<HTMLFieldSetElement, SwitchGroupProps>(
	(
		{ className, value, defaultValue, onValueChange, error, disabled = false, children, ...props },
		ref,
	) => {
		const generatedId = React.useId();
		const nodeRef = React.useRef<HTMLFieldSetElement | null>(null);
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
		const setRefs = React.useCallback(
			(node: HTMLFieldSetElement | null) => {
				nodeRef.current = node;
				if (typeof ref === "function") {
					ref(node);
				} else if (ref) {
					ref.current = node;
				}
			},
			[ref],
		);
		React.useEffect(() => {
			const form = nodeRef.current?.form;
			if (!form || value !== undefined) {
				return;
			}
			const onReset = (event: Event) => {
				queueMicrotask(() => {
					if (event.defaultPrevented) {
						return;
					}
					setUncontrolled(defaultValue ?? []);
				});
			};
			form.addEventListener("reset", onReset);
			return () => form.removeEventListener("reset", onReset);
		}, [defaultValue, value]);
		return (
			<SwitchGroupContext.Provider value={{ value: current, setValue, disabled, invalid }}>
				<fieldset
					ref={setRefs}
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
			</SwitchGroupContext.Provider>
		);
	},
);
SwitchGroup.displayName = "Switch.Group";

const SwitchLegend = React.forwardRef<HTMLLegendElement, SwitchLegendProps>(
	({ className, ...props }, ref) => (
		<legend
			ref={ref}
			className={cn("text-sm font-medium text-basalt-foreground", className)}
			{...props}
		/>
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
	const box = (
		<SwitchRoot
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
		<label htmlFor={controlId} className="flex items-center gap-2 text-sm text-basalt-foreground">
			{box}
			{children}
		</label>
	);
});
SwitchItem.displayName = "Switch.Item";

export const Switch = Object.assign(SwitchRoot, {
	Group: SwitchGroup,
	Legend: SwitchLegend,
	Item: SwitchItem,
});
