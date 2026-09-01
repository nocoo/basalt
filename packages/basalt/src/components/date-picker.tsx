import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type Civil = { y: number; m: number; d: number };

function pad(value: number) {
	return String(value).padStart(2, "0");
}

function formatIso(date: Civil) {
	return `${String(date.y).padStart(4, "0")}-${pad(date.m)}-${pad(date.d)}`;
}

function utcDate(date: Civil) {
	const next = new Date(Date.UTC(date.y, date.m - 1, date.d));
	next.setUTCFullYear(date.y);
	return next;
}

function civilDate(date: Civil) {
	const next = new Date(date.y, date.m - 1, date.d);
	next.setFullYear(date.y);
	return next;
}

function parseIso(value: string): Civil | null {
	const match = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) {
		return null;
	}
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	if (year < 1) {
		return null;
	}
	const utc = utcDate({ y: year, m: month, d: day });
	if (
		utc.getUTCFullYear() !== year ||
		utc.getUTCMonth() + 1 !== month ||
		utc.getUTCDate() !== day
	) {
		return null;
	}
	return { y: year, m: month, d: day };
}

const CALENDAR_BUTTON =
	"appearance-none border-0 bg-transparent p-0 font-inherit text-inherit cursor-pointer";

function todayCivil(timeZone?: string): Civil {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date());
	const read = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((part) => part.type === type)?.value);
	return { y: read("year"), m: read("month"), d: read("day") };
}

function formatCivil(date: Civil, locale: string, options: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat(locale, {
		...options,
		timeZone: "UTC",
		calendar: "gregory",
	}).format(utcDate(date));
}

function formatTriggerLabel({
	mode,
	selectedDate,
	rangeFrom,
	rangeTo,
	locale,
	formatDate,
}: {
	mode: "single" | "range";
	selectedDate: Civil | null;
	rangeFrom: string;
	rangeTo?: string;
	locale: string;
	formatDate?: (date: Date) => string;
}) {
	function one(iso: string) {
		const date = parseIso(iso);
		if (!date) {
			return iso;
		}
		return formatDate?.(civilDate(date)) ?? formatCivil(date, locale, { dateStyle: "medium" });
	}
	if (mode === "range") {
		if (!rangeFrom) {
			return "Pick a date";
		}
		if (!rangeTo) {
			return `${one(rangeFrom)} – …`;
		}
		return `${one(rangeFrom)} – ${one(rangeTo)}`;
	}
	return selectedDate
		? (formatDate?.(civilDate(selectedDate)) ??
				formatCivil(selectedDate, locale, { dateStyle: "medium" }))
		: "Pick a date";
}

function compareCivil(left: Civil, right: Civil) {
	if (left.y !== right.y) {
		return left.y - right.y;
	}
	if (left.m !== right.m) {
		return left.m - right.m;
	}
	return left.d - right.d;
}

function withinBounds(iso: string, min?: string, max?: string) {
	const date = parseIso(iso);
	const minDate = min ? parseIso(min) : null;
	const maxDate = max ? parseIso(max) : null;
	if (!date) {
		return false;
	}
	if (minDate && compareCivil(date, minDate) < 0) {
		return false;
	}
	if (maxDate && compareCivil(date, maxDate) > 0) {
		return false;
	}
	return true;
}

function dateSelectable(
	iso: string,
	min?: string,
	max?: string,
	isDisabledDate?: (iso: string) => boolean,
) {
	return withinBounds(iso, min, max) && !isDisabledDate?.(iso);
}

export type DatePickerRange = { from: string; to?: string };

export type DatePickerPreset = {
	label: string;
	value: string | { from: string; to: string };
};

export type DatePickerProps = Omit<
	ComponentProps<"input">,
	| "value"
	| "defaultValue"
	| "onChange"
	| "type"
	| "children"
	| "disabled"
	| "name"
	| "required"
	| "min"
	| "max"
> & {
	/**
	 * The controlled ISO date in single mode.
	 */
	value?: string;
	/**
	 * The uncontrolled initial ISO date in single mode.
	 */
	defaultValue?: string;
	/**
	 * Called with the ISO date in single mode.
	 */
	onChange?: (value: string) => void;
	/**
	 * Selection mode.
	 * @default single
	 */
	mode?: "single" | "range";
	/**
	 * The controlled range in range mode.
	 */
	rangeValue?: DatePickerRange;
	/**
	 * The uncontrolled initial range in range mode.
	 */
	defaultRangeValue?: DatePickerRange;
	/**
	 * Called when the range changes.
	 */
	onRangeChange?: (value: DatePickerRange) => void;
	/**
	 * Additional dates that cannot be selected.
	 */
	isDisabledDate?: (iso: string) => boolean;
	/**
	 * Shortcut values shown above the calendar.
	 */
	presets?: DatePickerPreset[];
	/**
	 * Locale used to format the trigger and weekday labels.
	 * @default en-US
	 */
	locale?: string;
	/**
	 * First day of the week. 0 is Sunday.
	 * @default 0
	 */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	/**
	 * IANA time zone used to resolve today.
	 */
	timeZone?: string;
	/**
	 * Custom formatter for the trigger label.
	 */
	formatDate?: (date: Date) => string;
	/**
	 * Native form field name.
	 */
	name?: string;
	/**
	 * Native required constraint.
	 */
	required?: boolean;
	/**
	 * Inclusive lower ISO bound.
	 */
	min?: string;
	/**
	 * Inclusive upper ISO bound.
	 */
	max?: string;
	/**
	 * Disable the trigger and calendar.
	 */
	disabled?: boolean;
};

function clampCivil(date: Civil, min?: string, max?: string) {
	const minDate = min ? parseIso(min) : null;
	const maxDate = max ? parseIso(max) : null;
	if (minDate && compareCivil(date, minDate) < 0) {
		return minDate;
	}
	if (maxDate && compareCivil(date, maxDate) > 0) {
		return maxDate;
	}
	return date;
}

function isValidCivil(date: Civil): boolean {
	if (!Number.isFinite(date.y) || date.m < 1 || date.m > 12 || date.d < 1 || date.d > 31) {
		return false;
	}
	const utc = utcDate(date);
	return (
		!Number.isNaN(utc.getTime()) &&
		utc.getUTCFullYear() === date.y &&
		utc.getUTCMonth() + 1 === date.m &&
		utc.getUTCDate() === date.d
	);
}

function isoOf(date: Civil | null) {
	return date ? formatIso(date) : "";
}

function addDays(date: Civil, days: number): Civil | null {
	const next = utcDate(date);
	if (Number.isNaN(next.getTime())) {
		return null;
	}
	next.setUTCDate(next.getUTCDate() + days);
	if (Number.isNaN(next.getTime())) {
		return null;
	}
	const civil = { y: next.getUTCFullYear(), m: next.getUTCMonth() + 1, d: next.getUTCDate() };
	return isValidCivil(civil) ? civil : null;
}

function shiftMonth(month: Civil, delta: number): Civil | null {
	const total = month.y * 12 + (month.m - 1) + delta;
	const next = { y: Math.floor(total / 12), m: (total % 12) + 1, d: 1 };
	return isValidCivil(next) ? next : null;
}

export function DatePicker({
	value,
	defaultValue = "",
	onChange,
	mode = "single",
	rangeValue,
	defaultRangeValue,
	onRangeChange,
	isDisabledDate,
	presets,
	locale = "en-US",
	weekStartsOn = 0,
	timeZone,
	formatDate,
	name,
	required,
	min,
	max,
	disabled,
	className,
	id,
	"aria-label": ariaLabel,
	"aria-describedby": ariaDescribedBy,
	"aria-invalid": ariaInvalid,
	...inputRest
}: DatePickerProps) {
	const {
		readOnly,
		autoFocus,
		onFocus,
		onBlur,
		"aria-labelledby": ariaLabelledBy,
		...formRest
	} = inputRest;
	const [uncontrolled, setUncontrolled] = useState(defaultValue);
	const [uncontrolledRange, setUncontrolledRange] = useState<DatePickerRange>(
		defaultRangeValue ?? { from: "", to: undefined },
	);
	const [open, setOpen] = useState(false);
	const [focusIndex, setFocusIndex] = useState(0);
	const dayRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const pendingFocusIso = useRef<string | null>(null);
	const focusDay = useRef(false);
	const hiddenRef = useRef<HTMLInputElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const selected = value ?? uncontrolled;
	const selectedRange = rangeValue ?? uncontrolledRange;
	const cursorIso = mode === "range" ? selectedRange.to || selectedRange.from || "" : selected;
	const selectedDate = cursorIso ? parseIso(cursorIso) : null;
	const submitted = mode === "range" ? "" : selectedDate ? formatIso(selectedDate) : "";
	const cursor = selectedDate ?? todayCivil(timeZone);
	const [month, setMonth] = useState<Civil>({ y: cursor.y, m: cursor.m, d: 1 });
	const prevSelected = useRef(cursorIso);
	if (open && prevSelected.current !== cursorIso) {
		focusDay.current = true;
		const next = selectedDate ?? todayCivil(timeZone);
		if (month.y !== next.y || month.m !== next.m) {
			setMonth({ y: next.y, m: next.m, d: 1 });
		}
	}
	prevSelected.current = cursorIso;

	useEffect(() => {
		if (!open) {
			return;
		}
		const next = clampCivil(
			(cursorIso ? parseIso(cursorIso) : null) ?? todayCivil(timeZone),
			min,
			max,
		);
		setMonth({ y: next.y, m: next.m, d: 1 });
		if (!cursorIso) {
			focusDay.current = true;
		}
	}, [open, cursorIso, timeZone, min, max]);

	useEffect(() => {
		if (disabled) {
			setOpen(false);
		}
	}, [disabled]);

	useEffect(() => {
		if (autoFocus) {
			triggerRef.current?.focus();
		}
	}, [autoFocus]);

	useEffect(() => {
		const form = hiddenRef.current?.form;
		if (!form || (mode === "range" ? rangeValue !== undefined : value !== undefined)) {
			return;
		}
		const onReset = (event: Event) => {
			queueMicrotask(() => {
				if (event.defaultPrevented) {
					return;
				}
				setUncontrolled(defaultValue);
				setUncontrolledRange(defaultRangeValue ?? { from: "", to: undefined });
				setOpen(false);
			});
		};
		form.addEventListener("reset", onReset);
		return () => form.removeEventListener("reset", onReset);
	}, [defaultRangeValue, defaultValue, mode, rangeValue, value]);

	const weekdayLabels = useMemo(() => {
		const formatter = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
		return Array.from({ length: 7 }, (_, index) => {
			const day = new Date(Date.UTC(2024, 0, 7 + ((index + weekStartsOn) % 7)));
			return formatter.format(day);
		});
	}, [locale, weekStartsOn]);

	const days = useMemo(() => {
		const first = { y: month.y, m: month.m, d: 1 };
		if (!isValidCivil(first)) {
			return Array.from({ length: 42 }, () => null);
		}
		const startOffset = (utcDate(first).getUTCDay() - weekStartsOn + 7) % 7;
		const start = addDays(first, -startOffset);
		if (!start) {
			return Array.from({ length: 42 }, (_, index) => addDays(first, index - startOffset));
		}
		return Array.from({ length: 42 }, (_, index) => addDays(start, index));
	}, [month, weekStartsOn]);

	useLayoutEffect(() => {
		if (!open) {
			return;
		}
		const pending = pendingFocusIso.current;
		let index = 0;
		if (pending) {
			pendingFocusIso.current = null;
			index = days.findIndex((date) => isoOf(date) === pending);
			if (index < 0) {
				index = 0;
			}
		} else {
			const focused = document.activeElement;
			const focusedIso =
				!focusDay.current &&
				focused instanceof HTMLElement &&
				dayRefs.current.some((node) => node === focused)
					? focused.getAttribute("aria-label")
					: null;
			const focusedIndex = focusedIso ? days.findIndex((date) => isoOf(date) === focusedIso) : -1;
			if (focusedIndex >= 0) {
				index = focusedIndex;
			} else {
				const iso = submitted || formatIso(todayCivil(timeZone));
				const selectedIndex = days.findIndex((date) => isoOf(date) === iso);
				if (selectedIndex >= 0 && days[selectedIndex]?.m === month.m) {
					index = selectedIndex;
				} else {
					const firstInMonth = days.findIndex((date) => date?.m === month.m);
					index = firstInMonth >= 0 ? firstInMonth : 0;
				}
			}
		}
		const enabled = (date: Civil | null) =>
			Boolean(date && date.y >= 1 && dateSelectable(formatIso(date), min, max, isDisabledDate));
		if (!enabled(days[index] ?? null)) {
			const inMonth = days.findIndex((date) => date?.m === month.m && enabled(date));
			const any = days.findIndex((date) => enabled(date));
			index = inMonth >= 0 ? inMonth : any >= 0 ? any : index;
		}
		setFocusIndex(index);
		if (focusDay.current) {
			focusDay.current = false;
			dayRefs.current[index]?.focus();
		}
	}, [open, submitted, timeZone, days, month.m, min, max, isDisabledDate]);

	const previousMonth = shiftMonth(month, -1);
	const followingMonth = shiftMonth(month, 1);
	const rangeFrom = mode === "range" ? selectedRange.from : "";
	const rangeTo = mode === "range" ? selectedRange.to : undefined;
	const label = formatTriggerLabel({
		mode,
		selectedDate,
		rangeFrom,
		rangeTo,
		locale,
		formatDate,
	});

	function selectable(iso: string) {
		return dateSelectable(iso, min, max, isDisabledDate);
	}

	function commit(next: string) {
		if (disabled || readOnly || !selectable(next)) {
			return;
		}
		if (mode === "range") {
			const current = rangeValue ?? uncontrolledRange;
			const nextRange =
				!current.from || current.to
					? { from: next }
					: compareCivil(
								parseIso(next) ?? { y: 1, m: 1, d: 1 },
								parseIso(current.from) ?? { y: 1, m: 1, d: 1 },
							) < 0
						? { from: next, to: current.from }
						: { from: current.from, to: next };
			if (rangeValue === undefined) {
				setUncontrolledRange(nextRange);
			}
			onRangeChange?.(nextRange);
			if (nextRange.to) {
				setOpen(false);
			}
			return;
		}
		if (value === undefined) {
			setUncontrolled(next);
		}
		setOpen(false);
		onChange?.(next);
	}

	function applyPreset(preset: DatePickerPreset) {
		if (disabled || readOnly) {
			return;
		}
		if (typeof preset.value === "string") {
			if (mode === "range") {
				if (!selectable(preset.value)) {
					return;
				}
				const nextRange = { from: preset.value, to: preset.value };
				if (rangeValue === undefined) {
					setUncontrolledRange(nextRange);
				}
				onRangeChange?.(nextRange);
				setOpen(false);
				return;
			}
			commit(preset.value);
			return;
		}
		if (mode === "range") {
			if (!selectable(preset.value.from) || !selectable(preset.value.to)) {
				return;
			}
			if (rangeValue === undefined) {
				setUncontrolledRange(preset.value);
			}
			onRangeChange?.(preset.value);
			setOpen(false);
		}
	}

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (next && disabled) {
					return;
				}
				if (next) {
					const synced = (cursorIso ? parseIso(cursorIso) : null) ?? todayCivil(timeZone);
					setMonth({ y: synced.y, m: synced.m, d: 1 });
					focusDay.current = true;
				}
				setOpen(next);
			}}
		>
			<input
				ref={hiddenRef}
				type={mode === "range" ? "text" : "date"}
				name={name}
				required={required}
				min={mode === "range" ? undefined : min}
				max={mode === "range" ? undefined : max}
				className="sr-only mb-2 h-7"
				style={{
					position: "absolute",
					width: 1,
					height: 1,
					overflow: "hidden",
					clip: "rect(0, 0, 0, 0)",
				}}
				value={
					mode === "range" ? (rangeFrom && rangeTo ? `${rangeFrom}/${rangeTo}` : "") : submitted
				}
				onChange={() => undefined}
				disabled={disabled}
				aria-hidden="true"
				tabIndex={-1}
				{...formRest}
			/>
			<PopoverTrigger asChild>
				<Button
					type="button"
					ref={triggerRef}
					id={id}
					variant="outline"
					disabled={disabled}
					onFocus={onFocus as ComponentProps<"button">["onFocus"]}
					onBlur={onBlur as ComponentProps<"button">["onBlur"]}
					aria-labelledby={ariaLabelledBy}
					aria-label={
						ariaLabel ? (label === "Pick a date" ? ariaLabel : `${ariaLabel}: ${label}`) : undefined
					}
					aria-describedby={ariaDescribedBy}
					aria-invalid={ariaInvalid}
					className={cn("justify-start font-normal", className)}
				>
					{label}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				arrow={false}
				className="w-64 p-3"
				aria-label={ariaLabel ? `${ariaLabel} calendar` : "Date calendar"}
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					const iso = submitted || formatIso(todayCivil(timeZone));
					const selectedIndex = days.findIndex((date) => isoOf(date) === iso);
					const enabled = (date: Civil | null) =>
						Boolean(
							date && date.y >= 1 && dateSelectable(formatIso(date), min, max, isDisabledDate),
						);
					let index =
						selectedIndex >= 0 && days[selectedIndex]?.m === month.m
							? selectedIndex
							: Math.max(
									0,
									days.findIndex((date) => date?.m === month.m),
								);
					if (!enabled(days[index] ?? null)) {
						const inMonth = days.findIndex((date) => date?.m === month.m && enabled(date));
						const any = days.findIndex((date) => enabled(date));
						index = inMonth >= 0 ? inMonth : any >= 0 ? any : index;
					}
					queueMicrotask(() => {
						dayRefs.current[index]?.focus();
					});
				}}
			>
				{presets && presets.length > 0 ? (
					<div className="mb-2 flex flex-wrap gap-1">
						{presets.map((preset) => (
							<Button
								key={preset.label}
								type="button"
								variant="ghost"
								className="h-7 px-2 text-xs"
								disabled={disabled || readOnly}
								onClick={() => applyPreset(preset)}
							>
								{preset.label}
							</Button>
						))}
					</div>
				) : null}
				<div className="mb-2 flex items-center justify-between gap-2">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						icon={<ChevronLeft />}
						aria-label="Prev"
						className="size-8"
						disabled={disabled || !previousMonth || previousMonth.y < 1}
						onClick={() => {
							if (!previousMonth || previousMonth.y < 1) {
								return;
							}
							focusDay.current = false;
							setMonth(previousMonth);
						}}
					/>
					<span className="text-sm font-medium">
						{formatCivil(month, locale, { month: "long", year: "numeric" })}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						icon={<ChevronRight />}
						aria-label="Next"
						className="size-8"
						disabled={disabled || !followingMonth}
						onClick={() => {
							if (!followingMonth) {
								return;
							}
							focusDay.current = false;
							setMonth(followingMonth);
						}}
					/>
				</div>
				<div
					className="grid grid-cols-7 gap-1 text-center"
					onKeyDown={(event) => {
						const current = days[focusIndex];
						if (!current) {
							return;
						}
						if (
							event.key === "ArrowRight" ||
							event.key === "ArrowLeft" ||
							event.key === "ArrowDown" ||
							event.key === "ArrowUp"
						) {
							event.preventDefault();
							const delta =
								event.key === "ArrowRight"
									? 1
									: event.key === "ArrowLeft"
										? -1
										: event.key === "ArrowDown"
											? 7
											: -7;
							let next = addDays(current, delta);
							for (
								let step = 0;
								next && next.y >= 1 && !selectable(formatIso(next)) && step < 42;
								step += 1
							) {
								next = addDays(next, delta);
							}
							if (!next || next.y < 1 || !selectable(formatIso(next))) {
								return;
							}
							if (next.y !== month.y || next.m !== month.m) {
								pendingFocusIso.current = formatIso(next);
								focusDay.current = true;
								setMonth({ y: next.y, m: next.m, d: 1 });
								return;
							}
							const index = days.findIndex((date) => isoOf(date) === formatIso(next));
							if (index >= 0) {
								setFocusIndex(index);
								dayRefs.current[index]?.focus();
							}
							return;
						}
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							const iso = formatIso(current);
							if (current.y >= 1 && selectable(iso)) {
								commit(iso);
							}
						}
					}}
				>
					{weekdayLabels.map((day, index) => (
						<span
							key={`${day}-${index}`}
							className="flex h-8 items-center justify-center text-xs font-medium text-basalt-muted-foreground"
						>
							{day}
						</span>
					))}
					{days.map((date, index) => {
						if (!date) {
							return (
								<span
									key={`empty-${index}`}
									className="h-8"
									ref={() => {
										dayRefs.current[index] = null;
									}}
								/>
							);
						}
						const iso = formatIso(date);
						const inMonth = date.m === month.m;
						const inRange = date.y >= 1 && selectable(iso);
						const fromDate = rangeFrom ? parseIso(rangeFrom) : null;
						const toDate = rangeTo ? parseIso(rangeTo) : null;
						const thisDate = parseIso(iso);
						const inSelectedRange = Boolean(
							fromDate &&
								toDate &&
								thisDate &&
								compareCivil(thisDate, fromDate) >= 0 &&
								compareCivil(thisDate, toDate) <= 0,
						);
						const isRangeEdge = iso === rangeFrom || iso === rangeTo;
						return (
							<button
								type="button"
								key={iso}
								ref={(node) => {
									dayRefs.current[index] = node;
								}}
								tabIndex={index === focusIndex ? 0 : -1}
								aria-label={iso}
								aria-pressed={
									mode === "range"
										? iso === rangeFrom || iso === rangeTo
										: Boolean(submitted) && iso === submitted
								}
								disabled={disabled || readOnly || !inRange}
								className={cn(
									CALENDAR_BUTTON,
									"flex h-8 w-8 items-center justify-center rounded-basalt-md text-sm",
									inMonth ? "text-basalt-foreground" : "text-basalt-muted-foreground",
									inRange && "hover:bg-basalt-accent",
									inSelectedRange && !isRangeEdge && "bg-basalt-accent",
									inRange &&
										(mode === "range" ? isRangeEdge : iso === submitted) &&
										"bg-basalt-primary text-basalt-primary-foreground hover:bg-basalt-primary/90",
								)}
								onClick={() => inRange && commit(iso)}
							>
								{date.d}
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
