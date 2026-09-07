import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { TAG_COLORS, type TagColor } from "./tag-badge";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

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
		<ToggleGroup
			type="single"
			value={selected}
			aria-label={label}
			disabled={disabled}
			className={cn(
				BASALT_UI_CLASS,
				"flex h-auto flex-wrap justify-start gap-2 rounded-basalt-lg p-1",
				className,
			)}
			onValueChange={(next) => {
				if (!next) return;
				const color = next as TagColor;
				if (value === undefined) setLocalValue(color);
				onValueChange?.(color);
			}}
		>
			{colors.map((color) => (
				<ToggleGroupItem
					key={color}
					value={color}
					aria-label={labels?.[color] ?? TAG_COLORS[color].label}
					className="h-auto min-w-16 flex-col gap-1.5 rounded-basalt-md px-2 py-2"
				>
					<span
						aria-hidden="true"
						className={cn(
							"flex size-7 items-center justify-center rounded-full border",
							TAG_COLORS[color].className,
						)}
					>
						{selected === color && <Check className="size-4" />}
					</span>
					<span className="text-xs">{labels?.[color] ?? TAG_COLORS[color].label}</span>
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
