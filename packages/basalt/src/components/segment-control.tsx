import * as React from "react";
import { cn } from "../utils/cn";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

export interface SegmentControlOption {
	/** The value selected when this segment is activated. */
	value: string;
	/** The visible label for the segment. */
	label: React.ReactNode;
	/** Disable only this segment. */
	disabled?: boolean;
}

export interface SegmentControlAllOption {
	/** The value representing the unfiltered selection. */
	value: string;
	/** The visible label for the leading segment. */
	label?: React.ReactNode;
	/** Disable only the leading segment. */
	disabled?: boolean;
}

export interface SegmentControlProps
	extends Omit<React.HTMLAttributes<HTMLFieldSetElement>, "children" | "onChange"> {
	/** The currently selected value. */
	value: string;
	/** Called when the user selects a different segment. */
	onValueChange: (value: string) => void;
	/** The visible legend that names the control. */
	legend: React.ReactNode;
	/** The selectable segments shown after the optional All segment. */
	options: readonly SegmentControlOption[];
	/** Add a leading unfiltered segment, labelled All by default. */
	allOption?: SegmentControlAllOption;
	/**
	 * Disable every segment.
	 * @default false
	 */
	disabled?: boolean;
}

export const SegmentControl = React.forwardRef<HTMLFieldSetElement, SegmentControlProps>(
	(
		{ allOption, className, disabled = false, legend, onValueChange, options, value, ...props },
		ref,
	) => {
		const legendId = React.useId();
		const items: readonly SegmentControlOption[] = allOption
			? [{ ...allOption, label: allOption.label ?? "All" }, ...options]
			: options;

		return (
			<fieldset
				ref={ref}
				disabled={disabled}
				className={cn("min-w-0 border-0 p-0", className)}
				{...props}
			>
				<legend
					id={legendId}
					className="mb-2 block text-xs font-medium text-basalt-muted-foreground"
				>
					{legend}
				</legend>
				<div data-slot="segment-control-viewport" className="max-w-full overflow-x-auto pb-1">
					<ToggleGroup
						type="single"
						value={value}
						disabled={disabled}
						onValueChange={(nextValue) => {
							if (nextValue) {
								onValueChange(nextValue);
							}
						}}
						aria-labelledby={legendId}
						className="w-max"
					>
						{items.map((item) => (
							<ToggleGroupItem key={item.value} value={item.value} disabled={item.disabled}>
								{item.label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
			</fieldset>
		);
	},
);
SegmentControl.displayName = "SegmentControl";
