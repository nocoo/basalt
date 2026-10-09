import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { Check, ChevronDown, Search } from "lucide-react";
import { type AriaAttributes, type ReactNode, useState } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Button } from "./button";
import { Input } from "./input";
import { FOCUS_INSET } from "./overlay";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

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
	/** Forwarded to the trigger so Field and Label can own it. */
	id?: string;
	/** Forwarded to the trigger; Field sets it while the value is invalid. */
	"aria-invalid"?: AriaAttributes["aria-invalid"];
	/** Forwarded to the trigger; Field points it at the hint or error. */
	"aria-describedby"?: string;
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
	id,
	"aria-invalid": ariaInvalid,
	"aria-describedby": describedBy,
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
		<Popover
			open={open && !disabled}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setQuery("");
			}}
		>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					disabled={disabled}
					id={id}
					aria-invalid={ariaInvalid}
					aria-describedby={describedBy}
					aria-label={`${label}: ${option?.label ?? placeholder}`}
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
				arrow={false}
				className="w-basalt-72 max-w-[calc(100vw-2rem)] space-y-basalt-layout-sm"
				aria-label={label}
			>
				<div className="relative">
					<Search
						aria-hidden="true"
						className="pointer-events-none absolute left-basalt-space-lg top-1/2 size-basalt-icon -translate-y-1/2 text-basalt-muted-foreground"
					/>
					<Input
						className="pl-basalt-card-xl"
						aria-label={`${label}: search`}
						value={query}
						placeholder={searchPlaceholder}
						onChange={(event) => setQuery(event.target.value)}
					/>
				</div>
				<ToggleGroupPrimitive.Root
					type="single"
					aria-label={label}
					value={selected}
					className="grid max-h-basalt-64 grid-cols-2 gap-basalt-space-lg overflow-y-auto"
					onValueChange={(next) => {
						if (!next) return;
						if (value === undefined) setLocalValue(next);
						onValueChange?.(next);
						setOpen(false);
						setQuery("");
					}}
				>
					{matches.map((item) => (
						<ToggleGroupPrimitive.Item
							key={item.value}
							value={item.value}
							disabled={item.disabled}
							aria-label={item.label}
							title={item.label}
							className={cn(
								// Accent choice grid: selection is the documented primary fill and its
								// contrast-corrected foreground, never a control fill plus a frame.
								"group relative flex min-w-0 flex-col items-center justify-center gap-basalt-space-lg rounded-basalt-md p-basalt-layout-sm text-basalt-foreground data-[state=on]:bg-basalt-primary data-[state=on]:text-basalt-primary-foreground disabled:cursor-not-allowed disabled:opacity-40",
								FOCUS_INSET,
							)}
						>
							<span
								aria-hidden="true"
								className="flex size-basalt-6 items-center justify-center [&>svg]:size-basalt-6"
							>
								{item.icon}
							</span>
							<span className="max-w-full break-words text-basalt-sm font-medium">
								{item.label}
							</span>
							<Check
								aria-hidden="true"
								className="absolute right-basalt-space-sm top-basalt-space-sm size-basalt-icon-sm opacity-0 group-data-[state=on]:opacity-100"
							/>
						</ToggleGroupPrimitive.Item>
					))}
				</ToggleGroupPrimitive.Root>
				{matches.length === 0 && (
					<p role="status" className="text-basalt-base text-basalt-muted-foreground">
						{emptyLabel}
					</p>
				)}
			</PopoverContent>
		</Popover>
	);
}
