import { Command as CommandPrimitive } from "cmdk";
import { forwardRef, type ReactNode, useId, useState } from "react";
import { cn } from "../utils/cn";
import {
	BASALT_UI_CLASS,
	SELECT_TRIGGER_CHEVRON_CLASS,
	type SelectTriggerSize,
	selectTriggerClass,
} from "../utils/control-surface";
import { Check, ChevronDown, Search, X } from "../utils/internal-icons";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Spinner } from "./spinner";

export interface ComboboxOption {
	/** Stable identifier emitted on selection changes. */
	value: string;
	/** Primary display label shown in the trigger and option list. */
	label: string;
	/** Optional secondary metadata shown below the option label. */
	description?: string;
	/** Additional search keywords indexed by built-in command filtering. */
	keywords?: readonly string[];
	/** Optional leading icon or badge rendered beside the option label. */
	leading?: ReactNode;
	/** Prevent selecting or toggling this option. */
	disabled?: boolean;
}

export interface ComboboxProps {
	/** Available selectable options. */
	options: readonly ComboboxOption[];
	/**
	 * Enable multi-value toggling without closing the popup on each pick.
	 * @default false
	 */
	multiple?: boolean;
	/** Controlled selected value (`string` for single, `string[]` when `multiple`). */
	value?: string | string[];
	/** Initial uncontrolled value (`string` for single, `string[]` when `multiple`). */
	defaultValue?: string | string[];
	/** Called when the selection changes. */
	onValueChange?: (value: string | string[]) => void;
	/** Controlled search input query. */
	search?: string;
	/** Called when the search input changes. */
	onSearchChange?: (search: string) => void;
	/**
	 * Filter options client-side using command search matching. Disable for async server filtering.
	 * @default true
	 */
	shouldFilter?: boolean;
	/**
	 * Show busy spinner inside the search header and option list.
	 * @default false
	 */
	loading?: boolean;
	/**
	 * Status copy rendered when `loading` is true.
	 * @default "Loading…"
	 */
	loadingLabel?: string;
	/**
	 * Render an adjacent clear button whenever a value is selected.
	 * @default false
	 */
	clearable?: boolean;
	/**
	 * Accessible label for the clear selection button.
	 * @default "Clear selection"
	 */
	clearLabel?: string;
	/**
	 * Trigger height preset matching control inputs.
	 * @default "md"
	 */
	size?: SelectTriggerSize;
	/**
	 * Prompt shown inside the trigger when nothing is selected.
	 * @default "Select option…"
	 */
	placeholder?: string;
	/**
	 * Prompt shown inside the search input.
	 * @default "Search…"
	 */
	searchPlaceholder?: string;
	/**
	 * Empty result message when no options match the query.
	 * @default "No results found."
	 */
	emptyLabel?: string;
	/**
	 * Disable interaction with the combobox trigger and clear control.
	 * @default false
	 */
	disabled?: boolean;
	/** Controlled popup visibility. */
	open?: boolean;
	/**
	 * Initial uncontrolled popup visibility.
	 * @default false
	 */
	defaultOpen?: boolean;
	/** Called when popup visibility changes. */
	onOpenChange?: (open: boolean) => void;
	/** Accessible name applied to the combobox trigger and command menu. */
	label?: string;
	/** Optional HTML id applied to the trigger button. */
	id?: string;
	/** Invalid state styling attribute forwarded to the trigger button. */
	"aria-invalid"?: boolean | "true" | "false";
	/** Reference to external helper or error text describing the combobox. */
	"aria-describedby"?: string;
	/** Additional classes merged onto the root container. */
	className?: string;
}

function normalizeSelectedValues(
	multiple: boolean,
	value: string | string[] | undefined,
	defaultValue: string | string[] | undefined,
): string[] {
	const raw = value !== undefined ? value : defaultValue;
	if (raw === undefined) {
		return [];
	}
	if (Array.isArray(raw)) {
		return multiple ? raw : raw.slice(0, 1);
	}
	return raw === "" ? [] : [raw];
}

/** Searchable single- or multi-value picker combining Select trigger geometry with cmdk filtering. */
export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(function Combobox(
	{
		options,
		multiple = false,
		value,
		defaultValue,
		onValueChange,
		search,
		onSearchChange,
		shouldFilter = true,
		loading = false,
		loadingLabel = "Loading…",
		clearable = false,
		clearLabel = "Clear selection",
		size = "md",
		placeholder = "Select option…",
		searchPlaceholder = "Search…",
		emptyLabel = "No results found.",
		disabled = false,
		open,
		defaultOpen = false,
		onOpenChange,
		label,
		id,
		"aria-invalid": ariaInvalid,
		"aria-describedby": ariaDescribedBy,
		className,
	},
	ref,
) {
	const [uncontrolledValue, setUncontrolledValue] = useState<string | string[] | undefined>(
		defaultValue,
	);
	const [uncontrolledSearch, setUncontrolledSearch] = useState("");
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const listId = useId();

	const selectedValues = normalizeSelectedValues(
		multiple,
		value,
		value === undefined ? uncontrolledValue : undefined,
	);
	const currentSearch = search ?? uncontrolledSearch;
	const expanded = (open ?? uncontrolledOpen) && !disabled;

	const selectedOptions = selectedValues.map(
		(val) => options.find((opt) => opt.value === val) ?? { value: val, label: val },
	);

	let triggerText = placeholder;
	if (selectedOptions.length > 0) {
		if (!multiple) {
			triggerText = selectedOptions[0]?.label ?? placeholder;
		} else if (selectedOptions.length <= 2) {
			triggerText = selectedOptions.map((opt) => opt.label).join(", ");
		} else {
			triggerText = `${selectedOptions.length} selected`;
		}
	}

	function setOpenState(next: boolean) {
		if (disabled) return;
		if (open === undefined) {
			setUncontrolledOpen(next);
		}
		onOpenChange?.(next);
	}

	function handleSearch(nextSearch: string) {
		if (search === undefined) {
			setUncontrolledSearch(nextSearch);
		}
		onSearchChange?.(nextSearch);
	}

	function commitNext(next: string | string[]) {
		if (value === undefined) {
			setUncontrolledValue(next);
		}
		onValueChange?.(next);
	}

	function handleSelect(option: ComboboxOption) {
		if (option.disabled || disabled) return;
		if (multiple) {
			const exists = selectedValues.includes(option.value);
			const next = exists
				? selectedValues.filter((val) => val !== option.value)
				: [...selectedValues, option.value];
			commitNext(next);
			return;
		}
		commitNext(option.value);
		setOpenState(false);
	}

	function handleClear() {
		if (disabled) return;
		commitNext(multiple ? [] : "");
	}

	const hasValue = selectedValues.length > 0;
	const accessibleName = label ?? placeholder;

	return (
		<div
			data-slot="combobox"
			data-multiple={multiple ? "true" : undefined}
			className={cn(
				BASALT_UI_CLASS,
				"relative flex w-full items-center gap-basalt-space-sm",
				className,
			)}
		>
			<Popover open={expanded} onOpenChange={setOpenState}>
				<PopoverTrigger asChild>
					<button
						ref={ref}
						id={id}
						type="button"
						role="combobox"
						aria-label={accessibleName}
						aria-expanded={expanded}
						aria-controls={expanded ? listId : undefined}
						aria-invalid={ariaInvalid}
						aria-describedby={ariaDescribedBy}
						data-state={expanded ? "open" : "closed"}
						disabled={disabled}
						className={selectTriggerClass({ size, className: "min-w-0 flex-1" })}
					>
						<span className={cn("truncate", !hasValue && "text-basalt-muted-foreground")}>
							{triggerText}
						</span>
						<ChevronDown aria-hidden="true" className={SELECT_TRIGGER_CHEVRON_CLASS} />
					</button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-[var(--radix-popover-trigger-width)] min-w-basalt-56 p-0"
				>
					<CommandPrimitive shouldFilter={shouldFilter} label={`${accessibleName}: search`}>
						<div className="flex items-center gap-basalt-space-md border-b border-basalt-border px-basalt-space-lg py-basalt-space-sm">
							<Search
								aria-hidden="true"
								className="size-basalt-icon-sm shrink-0 text-basalt-muted-foreground"
							/>
							<CommandPrimitive.Input
								value={currentSearch}
								onValueChange={handleSearch}
								placeholder={searchPlaceholder}
								className="flex h-basalt-control-sm min-w-0 flex-1 bg-transparent text-basalt-base text-basalt-foreground outline-none placeholder:text-basalt-muted-foreground"
							/>
							{loading ? (
								<Spinner size="sm" aria-hidden="true" className="text-basalt-muted-foreground" />
							) : null}
						</div>
						<CommandPrimitive.List
							id={listId}
							className="max-h-basalt-60 overflow-y-auto p-basalt-menu-inset"
						>
							{loading ? (
								<div
									role="status"
									className="flex items-center justify-center gap-basalt-space-md py-basalt-card-sm text-basalt-sm text-basalt-muted-foreground"
								>
									<Spinner size="sm" aria-hidden="true" />
									<span>{loadingLabel}</span>
								</div>
							) : (
								<>
									<CommandPrimitive.Empty className="py-basalt-card-sm text-center text-basalt-sm text-basalt-muted-foreground">
										{emptyLabel}
									</CommandPrimitive.Empty>
									<CommandPrimitive.Group>
										{options.map((option) => {
											const isSelected = selectedValues.includes(option.value);
											return (
												<CommandPrimitive.Item
													key={option.value}
													value={`${option.label} ${option.value}`}
													keywords={option.keywords ? [...option.keywords] : undefined}
													disabled={option.disabled}
													onSelect={() => handleSelect(option)}
													className="relative flex cursor-pointer select-none items-center gap-basalt-row-gap rounded-basalt-sm px-basalt-menu-x py-basalt-menu-y text-basalt-base text-basalt-popover-foreground outline-none data-[selected=true]:bg-basalt-hover data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
												>
													{option.leading ? (
														<span className="flex shrink-0 items-center text-basalt-muted-foreground">
															{option.leading}
														</span>
													) : null}
													<span className="min-w-0 flex-1">
														<span className="block truncate">{option.label}</span>
														{option.description ? (
															<span className="block truncate text-basalt-xs text-basalt-muted-foreground">
																{option.description}
															</span>
														) : null}
													</span>
													<Check
														aria-hidden="true"
														className={cn(
															"ms-auto size-basalt-icon shrink-0 text-basalt-foreground",
															isSelected ? "opacity-100" : "opacity-0",
														)}
													/>
												</CommandPrimitive.Item>
											);
										})}
									</CommandPrimitive.Group>
								</>
							)}
						</CommandPrimitive.List>
					</CommandPrimitive>
				</PopoverContent>
			</Popover>
			{clearable && hasValue && !disabled ? (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					icon={<X />}
					aria-label={clearLabel}
					onClick={handleClear}
				/>
			) : null}
		</div>
	);
});

Combobox.displayName = "Combobox";
