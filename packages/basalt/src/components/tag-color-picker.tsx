import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";
import { type AriaAttributes, useState } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { FOCUS_INSET } from "./overlay";
import { TAG_COLORS, type TagColor } from "./tag-badge";

export interface TagColorPickerProps {
	/** Accessible group name. */
	label: string;
	/** Controlled named color. */
	value?: TagColor;
	/** Initial uncontrolled color. @default "slate" */
	defaultValue?: TagColor;
	/** Color selection request. */
	onValueChange?: (value: TagColor) => void;
	/** Allowed color subset, in caller-defined order. */
	colors?: readonly TagColor[];
	/** Localized visible and accessible color names. */
	labels?: Partial<Record<TagColor, string>>;
	/** Disable the picker. @default false */
	disabled?: boolean;
	/** Forwarded to the radio group so Field and Label can own it. */
	id?: string;
	/** Forwarded to the radio group; Field sets it while the value is invalid. */
	"aria-invalid"?: AriaAttributes["aria-invalid"];
	/** Forwarded to the radio group; Field points it at the hint or error. */
	"aria-describedby"?: string;
	/** Additional root classes. */
	className?: string;
}
const ALL_COLORS = Object.keys(TAG_COLORS) as TagColor[];
export function TagColorPicker({
	label,
	value,
	defaultValue = "slate",
	onValueChange,
	colors = ALL_COLORS,
	labels,
	disabled = false,
	id,
	"aria-invalid": ariaInvalid,
	"aria-describedby": describedBy,
	className,
}: TagColorPickerProps) {
	const [localValue, setLocalValue] = useState(defaultValue);
	const selected = value ?? localValue;
	return (
		<RadioGroupPrimitive.Root
			value={selected}
			id={id}
			aria-label={label}
			aria-invalid={ariaInvalid}
			aria-describedby={describedBy}
			disabled={disabled}
			className={cn(
				BASALT_UI_CLASS,
				"grid w-full min-w-0 max-w-3xl grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-basalt-space-lg",
				className,
			)}
			onValueChange={(next) => {
				const color = next as TagColor;
				if (value === undefined) setLocalValue(color);
				onValueChange?.(color);
			}}
		>
			{colors.map((color) => (
				<RadioGroupPrimitive.Item
					key={color}
					value={color}
					aria-label={labels?.[color] ?? TAG_COLORS[color].label}
					className={cn(
						// Accent choice grid: the selected tile owns the primary fill and its
						// contrast-corrected foreground, not a control fill inside a frame.
						"group flex min-w-0 items-center gap-basalt-space-lg rounded-basalt-md p-basalt-space-lg text-left text-basalt-foreground transition-colors hover:bg-basalt-hover data-[state=checked]:bg-basalt-primary data-[state=checked]:text-basalt-primary-foreground disabled:cursor-not-allowed disabled:opacity-50",
						FOCUS_INSET,
						"data-[state=checked]:focus-visible:ring-basalt-primary-foreground",
					)}
				>
					<span
						aria-hidden="true"
						className={cn(
							"size-basalt-7 shrink-0 rounded-basalt-md border",
							TAG_COLORS[color].className,
						)}
					/>
					<span className="min-w-0 flex-1 break-words text-basalt-sm font-medium">
						{labels?.[color] ?? TAG_COLORS[color].label}
					</span>
					<Check
						aria-hidden="true"
						className="size-basalt-icon shrink-0 opacity-0 group-data-[state=checked]:opacity-100"
					/>
				</RadioGroupPrimitive.Item>
			))}
		</RadioGroupPrimitive.Root>
	);
}
