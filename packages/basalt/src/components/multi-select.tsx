import { Check, ChevronDown, X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface MultiSelectOption {
	/** Stable identifier, independent of the display label. */
	value: string;
	/** Searchable and accessible display name. */
	label: string;
	/** Optional secondary searchable text. */
	description?: string;
	/** Caller-provided icon or avatar. */
	leading?: ReactNode;
	/** Prevent adding or removing this option. */
	disabled?: boolean;
}

export interface MultiSelectProps {
	/** Accessible field and popup name. */
	label: string;
	/** Available options; retain selected options to preserve their display labels. */
	options: readonly MultiSelectOption[];
	/** Controlled selected identifiers. */
	value?: readonly string[];
	/** Initial uncontrolled selection. @default [] */
	defaultValue?: readonly string[];
	/** Selection requests; controlled values change only when accepted by the caller. */
	onValueChange?: (value: string[]) => void;
	/** Controlled search text; asynchronous requests belong to the caller. */
	query?: string;
	/** Initial uncontrolled search text. @default "" */
	defaultQuery?: string;
	/** Search text requests. */
	onQueryChange?: (query: string) => void;
	/** Controlled popup visibility. */
	open?: boolean;
	/** Initial uncontrolled popup visibility. @default false */
	defaultOpen?: boolean;
	/** Popup visibility requests. */
	onOpenChange?: (open: boolean) => void;
	/** Use local label/description filtering; disable for server-filtered options. @default true */
	filterOptions?: boolean;
	/** Loading content replaces the option list. @default false */
	loading?: boolean;
	/** Disables the trigger, chips, and native form entries. @default false */
	disabled?: boolean;
	/** Repeated native form entry name, one entry per selected identifier. */
	name?: string;
	/** Optional external native form owner. Uncontrolled state respects uncancelled form resets. */
	form?: string;
	/** Empty selection prompt. @default "Select options" */
	placeholder?: string;
	/** Search input prompt. @default "Search options…" */
	searchPlaceholder?: string;
	/** Empty search result text. @default "No options found." */
	emptyLabel?: string;
	/** Loading announcement. @default "Loading options…" */
	loadingLabel?: string;
	/** Chip removal label prefix. @default "Remove" */
	removeLabel?: string;
	/** Show removable selection chips; disable when a FilterBar renders its own chips. @default true */
	showChips?: boolean;
	/** Selection count formatter, including localization. */
	formatSelectionCount?: (count: number) => string;
	/** Additional root classes. */
	className?: string;
}

export function MultiSelect({
	label,
	options,
	value,
	defaultValue = [],
	onValueChange,
	query,
	defaultQuery = "",
	onQueryChange,
	open,
	defaultOpen = false,
	onOpenChange,
	filterOptions = true,
	loading = false,
	disabled = false,
	name,
	form,
	placeholder = "Select options",
	searchPlaceholder = "Search options…",
	emptyLabel = "No options found.",
	loadingLabel = "Loading options…",
	removeLabel = "Remove",
	showChips = true,
	formatSelectionCount,
	className,
}: MultiSelectProps) {
	const [localValue, setLocalValue] = useState(defaultValue);
	const [localQuery, setLocalQuery] = useState(defaultQuery);
	const [localOpen, setLocalOpen] = useState(defaultOpen);
	const [active, setActive] = useState<string | null>(null);
	const input = useRef<HTMLInputElement>(null);
	const trigger = useRef<HTMLButtonElement>(null);
	const list = useRef<HTMLDivElement>(null);
	const pointer = useRef<{ x: number; y: number } | null>(null);
	const resetConfig = useRef({ value, defaultValue, query, defaultQuery, open });
	useEffect(() => {
		resetConfig.current = { value, defaultValue, query, defaultQuery, open };
	});
	// biome-ignore lint/correctness/useExhaustiveDependencies: form changes the native owner of the same trigger and requires rebinding its reset listener.
	useEffect(() => {
		const owner = trigger.current?.form;
		if (!owner) return;
		const timers = new Set<ReturnType<typeof setTimeout>>();
		function reset(event: Event) {
			const timer = setTimeout(() => {
				timers.delete(timer);
				if (event.defaultPrevented) return;
				const config = resetConfig.current;
				if (config.value === undefined) setLocalValue(config.defaultValue);
				if (config.query === undefined) setLocalQuery(config.defaultQuery);
				if (config.open === undefined) setLocalOpen(false);
				setActive(null);
			}, 0);
			timers.add(timer);
		}
		owner.addEventListener("reset", reset);
		return () => {
			for (const timer of timers) clearTimeout(timer);
			owner.removeEventListener("reset", reset);
		};
	}, [form]);
	const id = useId();
	const selected = value ?? localValue;
	const search = query ?? localQuery;
	const expanded = (open ?? localOpen) && !disabled;
	const visible = options.filter(
		(option) =>
			!filterOptions ||
			`${option.label} ${option.description ?? ""}`
				.toLocaleLowerCase()
				.includes(search.trim().toLocaleLowerCase()),
	);
	const enabled = visible.filter((option) => !option.disabled);
	const activeValue = enabled.some((option) => option.value === active)
		? active
		: enabled[0]?.value;
	const activeIndex = visible.findIndex((option) => option.value === activeValue);
	const countText = formatSelectionCount
		? formatSelectionCount(selected.length)
		: `${selected.length} selected`;

	function changeOpen(next: boolean) {
		if (disabled) return;
		if (open === undefined) setLocalOpen(next);
		onOpenChange?.(next);
	}
	function changeValue(next: string[]) {
		if (disabled) return;
		if (value === undefined) setLocalValue(next);
		onValueChange?.(next);
	}
	function toggle(option: MultiSelectOption) {
		if (option.disabled) return;
		changeValue(
			selected.includes(option.value)
				? selected.filter((item) => item !== option.value)
				: [...selected, option.value],
		);
	}
	function removeLast() {
		if (search) return;
		const item = [...selected]
			.reverse()
			.find((value) => !options.find((option) => option.value === value)?.disabled);
		if (item !== undefined) changeValue(selected.filter((value) => value !== item));
	}

	return (
		<div className={cn(BASALT_UI_CLASS, "min-w-0 space-y-2", className)}>
			{showChips && selected.length > 0 && (
				<div role="group" className="flex flex-wrap gap-1.5" aria-label={`${label}: ${countText}`}>
					{selected.map((item) => {
						const option = options.find((option) => option.value === item);
						const text = option?.label ?? item;
						return (
							<span
								key={item}
								className="inline-flex max-w-full items-center gap-1 rounded-basalt-md border border-basalt-border bg-basalt-accent py-0.5 pl-2 text-xs"
							>
								<span className="min-w-0 break-words">{text}</span>
								<button
									type="button"
									disabled={disabled || option?.disabled}
									aria-label={`${removeLabel} ${text}`}
									className="rounded p-1 focus-visible:outline-2 focus-visible:outline-basalt-ring disabled:opacity-50"
									onClick={() => changeValue(selected.filter((value) => value !== item))}
								>
									<X className="size-3" aria-hidden="true" />
								</button>
							</span>
						);
					})}
				</div>
			)}
			{!disabled &&
				name &&
				selected.map((item) => (
					<input key={item} type="hidden" name={name} form={form} value={item} />
				))}
			<Popover open={expanded} onOpenChange={changeOpen}>
				<PopoverTrigger asChild>
					<Button
						ref={trigger}
						form={form}
						variant="outline"
						disabled={disabled}
						aria-label={label}
						aria-describedby={`${id}-count`}
						className="w-full justify-between"
						onKeyDown={(event) => {
							if (event.nativeEvent.isComposing) return;
							if (event.key === "ArrowDown" || event.key === "ArrowUp") {
								event.preventDefault();
								changeOpen(true);
							}
							if (event.key === "Backspace") {
								event.preventDefault();
								removeLast();
							}
						}}
					>
						<span className="truncate">{selected.length ? countText : placeholder}</span>
						<ChevronDown aria-hidden="true" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-72 max-w-[calc(100vw-2rem)] p-2"
					aria-label={label}
					onOpenAutoFocus={(event) => {
						event.preventDefault();
						input.current?.focus();
					}}
				>
					<Input
						ref={input}
						role="combobox"
						aria-label={`${label}: search`}
						aria-expanded={expanded}
						aria-autocomplete="list"
						aria-controls={`${id}-list`}
						aria-activedescendant={
							!loading && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
						}
						placeholder={searchPlaceholder}
						value={search}
						onChange={(event) => {
							if (query === undefined) setLocalQuery(event.target.value);
							onQueryChange?.(event.target.value);
							setActive(null);
						}}
						onKeyDown={(event) => {
							if (event.nativeEvent.isComposing) return;
							if (event.key === "ArrowDown" || event.key === "ArrowUp") {
								event.preventDefault();
								if (!loading && enabled.length) {
									const index = enabled.findIndex((option) => option.value === activeValue);
									const next =
										enabled[
											(index + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) %
												enabled.length
										];
									setActive(next.value);
									list.current
										?.querySelector<HTMLElement>(`[data-option-index="${visible.indexOf(next)}"]`)
										?.scrollIntoView({ block: "nearest" });
								}
							} else if (event.key === "Enter") {
								event.preventDefault();
								const option = enabled.find((option) => option.value === activeValue);
								if (!loading && option) toggle(option);
							} else if (event.key === "Backspace" && !search) {
								event.preventDefault();
								removeLast();
							}
						}}
					/>
					<div
						ref={list}
						id={`${id}-list`}
						role="listbox"
						aria-label={label}
						aria-multiselectable="true"
						aria-busy={loading}
						className="mt-2 max-h-60 overflow-y-auto"
					>
						{!loading &&
							visible.map((option, index) => (
								<button
									type="button"
									role="option"
									id={`${id}-option-${index}`}
									data-option-index={index}
									key={option.value}
									tabIndex={-1}
									aria-selected={selected.includes(option.value)}
									aria-disabled={option.disabled || undefined}
									disabled={option.disabled}
									className={cn(
										"flex w-full items-center gap-2 rounded-basalt-md px-2 py-2 text-left text-sm disabled:opacity-40",
										activeValue === option.value && "bg-basalt-accent",
									)}
									onPointerMove={(event) => {
										const previous = pointer.current;
										if (previous?.x === event.clientX && previous.y === event.clientY) return;
										pointer.current = { x: event.clientX, y: event.clientY };
										if (!option.disabled) setActive(option.value);
									}}
									onMouseDown={(event) => event.preventDefault()}
									onClick={() => {
										toggle(option);
										input.current?.focus();
									}}
								>
									{option.leading}
									<span className="min-w-0 flex-1">
										<span className="block break-words">{option.label}</span>
										{option.description && (
											<span className="block text-xs text-basalt-muted-foreground">
												{option.description}
											</span>
										)}
									</span>
									{selected.includes(option.value) && (
										<Check className="size-4 shrink-0" aria-hidden="true" />
									)}
								</button>
							))}
					</div>
					{(loading || visible.length === 0) && (
						<p role="status" className="px-2 py-4 text-sm text-basalt-muted-foreground">
							{loading ? loadingLabel : emptyLabel}
						</p>
					)}
				</PopoverContent>
			</Popover>
			<span id={`${id}-count`} className="sr-only" aria-live="polite">
				{countText}
			</span>
		</div>
	);
}
