import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";
import { useState } from "react";
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
	className,
}: TagColorPickerProps) {
	const [localValue, setLocalValue] = useState(defaultValue);
	const selected = value ?? localValue;
	return (
		<RadioGroupPrimitive.Root
			value={selected}
			aria-label={label}
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
						"group flex min-w-0 items-center gap-basalt-space-lg rounded-basalt-md border border-transparent p-basalt-space-lg text-left text-basalt-foreground transition-colors hover:bg-basalt-hover data-[state=checked]:border-basalt-primary/40 data-[state=checked]:bg-basalt-control disabled:cursor-not-allowed disabled:opacity-50",
						FOCUS_INSET,
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
						className="size-basalt-icon shrink-0 text-basalt-primary opacity-0 group-data-[state=checked]:opacity-100"
					/>
				</RadioGroupPrimitive.Item>
			))}
		</RadioGroupPrimitive.Root>
	);
}
