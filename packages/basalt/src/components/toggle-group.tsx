import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { useSelectionIndicator } from "../utils/selection-indicator";
import { FOCUS_RING } from "./overlay";

const ToggleGroupMode = React.createContext<"single" | "multiple">("single");

type RadixToggleGroupSingleProps = React.ComponentPropsWithoutRef<
	typeof ToggleGroupPrimitive.Root
> & { type: "single" };
type RadixToggleGroupMultipleProps = React.ComponentPropsWithoutRef<
	typeof ToggleGroupPrimitive.Root
> & { type: "multiple" };
type RadixToggleGroupItemProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>;

export interface ToggleGroupSingleProps
	extends Omit<
		RadixToggleGroupSingleProps,
		"type" | "value" | "defaultValue" | "onValueChange" | "disabled" | "rovingFocus" | "orientation"
	> {
	/**
	 * Single-selection mode.
	 */
	type: "single";
	/**
	 * Controlled string value in single mode. Root forwards ref to HTMLDivElement.
	 */
	value?: RadixToggleGroupSingleProps["value"];
	/**
	 * Default string value in single mode when initially rendered.
	 * @default ""
	 */
	defaultValue?: RadixToggleGroupSingleProps["defaultValue"];
	/**
	 * Callback invoked when single selected value changes.
	 */
	onValueChange?: RadixToggleGroupSingleProps["onValueChange"];
	/**
	 * Whether all toggle group items are disabled.
	 * @default false
	 */
	disabled?: RadixToggleGroupSingleProps["disabled"];
	/**
	 * Whether keyboard navigation uses roving tabindex.
	 * @default true
	 */
	rovingFocus?: RadixToggleGroupSingleProps["rovingFocus"];
	/**
	 * Constrains keyboard navigation axis; does not alter horizontal CSS layout.
	 */
	orientation?: RadixToggleGroupSingleProps["orientation"];
}

export interface ToggleGroupMultipleProps
	extends Omit<
		RadixToggleGroupMultipleProps,
		"type" | "value" | "defaultValue" | "onValueChange" | "disabled" | "rovingFocus" | "orientation"
	> {
	/**
	 * Multiple-selection mode.
	 */
	type: "multiple";
	/**
	 * Controlled array in multiple mode. Root forwards ref to HTMLDivElement.
	 */
	value?: RadixToggleGroupMultipleProps["value"];
	/**
	 * Default string array in multiple mode when initially rendered.
	 * @default []
	 */
	defaultValue?: RadixToggleGroupMultipleProps["defaultValue"];
	/**
	 * Callback invoked when multiple selected values change.
	 */
	onValueChange?: RadixToggleGroupMultipleProps["onValueChange"];
	/**
	 * Whether all toggle group items are disabled.
	 * @default false
	 */
	disabled?: RadixToggleGroupMultipleProps["disabled"];
	/**
	 * Whether keyboard navigation uses roving tabindex.
	 * @default true
	 */
	rovingFocus?: RadixToggleGroupMultipleProps["rovingFocus"];
	/**
	 * Constrains keyboard navigation axis; does not alter horizontal CSS layout.
	 */
	orientation?: RadixToggleGroupMultipleProps["orientation"];
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

export const ToggleGroup = React.forwardRef<
	React.ElementRef<typeof ToggleGroupPrimitive.Root>,
	ToggleGroupProps
>(({ className, children, ...props }, ref) => {
	const sliding = props.type === "single";
	const {
		ref: rootRef,
		state,
		motionClassName,
	} = useSelectionIndicator({
		itemSelector: '[data-state="on"]',
		enabled: sliding,
		ref,
	});

	return (
		<ToggleGroupMode.Provider value={props.type}>
			<ToggleGroupPrimitive.Root
				ref={rootRef}
				className={cn(
					BASALT_UI_CLASS,
					"relative inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full bg-basalt-muted p-0.5 ring-1 ring-basalt-border/70",
					className,
				)}
				{...props}
			>
				{sliding ? (
					<span
						aria-hidden="true"
						data-slot="selection-indicator"
						className={cn(
							"pointer-events-none absolute rounded-full bg-basalt-primary shadow-sm",
							motionClassName,
						)}
						style={{
							left: state.left,
							width: state.visible ? state.width : 0,
							top: state.top,
							height: state.visible ? state.height : 0,
						}}
					/>
				) : null}
				{children}
			</ToggleGroupPrimitive.Root>
		</ToggleGroupMode.Provider>
	);
});
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

export interface ToggleGroupItemProps
	extends Omit<RadixToggleGroupItemProps, "value" | "disabled"> {
	/**
	 * Unique item value within the group. Forwards ref to HTMLButtonElement.
	 */
	value: RadixToggleGroupItemProps["value"];
	/**
	 * Whether this toggle item is disabled.
	 * @default false
	 */
	disabled?: RadixToggleGroupItemProps["disabled"];
}

export const ToggleGroupItem = React.forwardRef<
	React.ElementRef<typeof ToggleGroupPrimitive.Item>,
	ToggleGroupItemProps
>(({ className, ...props }, ref) => {
	const mode = React.useContext(ToggleGroupMode);
	return (
		<ToggleGroupPrimitive.Item
			ref={ref}
			className={cn(
				"relative inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-semibold tracking-wide text-basalt-muted-foreground transition-colors",
				"hover:text-basalt-foreground",
				FOCUS_RING,
				"data-[state=on]:text-basalt-primary-foreground",
				mode === "multiple" && "data-[state=on]:bg-basalt-primary data-[state=on]:shadow-sm",
				"disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
