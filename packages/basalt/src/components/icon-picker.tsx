import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

export interface IconPickerOption {
	/** Stable application-owned identifier. */
	value: string;
	/** Visible selection text and accessible icon name. */
	label: string;
	/** Caller-rendered icon, from a deliberately small subset. */
	icon: ReactNode;
	/** Exclude this option from selection and keyboard navigation. */
	disabled?: boolean;
}
export interface IconPickerProps {
	/** Accessible picker name. */
	label: string;
	/** Caller-supplied icon subset; the library never imports an icon catalog. */
	options: readonly IconPickerOption[];
	/** Controlled icon identifier. */
	value?: string;
	/** Initial uncontrolled icon identifier. */
	defaultValue?: string;
	/** Selection request. */
	onValueChange?: (value: string) => void;
	/** Disable selection. @default false */
	disabled?: boolean;
	/** Empty selection prompt. @default "Choose icon" */
	placeholder?: string;
	/** Search placeholder. @default "Search icons…" */
	searchPlaceholder?: string;
	/** Empty-search text. @default "No icons found." */
	emptyLabel?: string;
	/** Additional root classes. */
	className?: string;
}
export function IconPicker({
	label,
	options,
	value,
	defaultValue = "",
	onValueChange,
	disabled = false,
	placeholder = "Choose icon",
	searchPlaceholder = "Search icons…",
	emptyLabel = "No icons found.",
	className,
}: IconPickerProps) {
	const [localValue, setLocalValue] = useState(defaultValue);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const selected = value ?? localValue;
	const option = options.find((option) => option.value === selected);
	const matches = options.filter((option) =>
		option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
	);
	return (
		<Popover open={open && !disabled} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					disabled={disabled}
					aria-label={label}
					className={cn(BASALT_UI_CLASS, "max-w-full", className)}
				>
					<span aria-hidden="true" className="shrink-0">
						{option?.icon}
					</span>
					<span className="truncate">{option?.label ?? placeholder}</span>
					<ChevronDown className="shrink-0" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-72 max-w-[calc(100vw-2rem)] space-y-3 p-3"
				aria-label={label}
			>
				<Input
					aria-label={`${label}: search`}
					value={query}
					placeholder={searchPlaceholder}
					onChange={(event) => setQuery(event.target.value)}
				/>
				<ToggleGroup
					type="single"
					aria-label={label}
					value={selected}
					className="flex h-auto flex-wrap justify-start gap-1 rounded-basalt-lg p-1"
					onValueChange={(next) => {
						if (!next) return;
						if (value === undefined) setLocalValue(next);
						onValueChange?.(next);
						setOpen(false);
						setQuery("");
					}}
				>
					{matches.map((item) => (
						<ToggleGroupItem
							key={item.value}
							value={item.value}
							disabled={item.disabled}
							aria-label={item.label}
							title={item.label}
							className="size-10"
						>
							{item.icon}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				{matches.length === 0 && (
					<p role="status" className="text-sm text-basalt-muted-foreground">
						{emptyLabel}
					</p>
				)}
			</PopoverContent>
		</Popover>
	);
}
