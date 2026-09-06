import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
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

function parseIsoMonth(value: string | undefined): Civil | null {
	if (!value) {
		return null;
	}
	const match = /^(\d{4,})-(\d{2})$/.exec(value);
	if (!match) {
		return null;
	}
	const year = Number(match[1]);
	const month = Number(match[2]);
	if (year < 1 || month < 1 || month > 12) {
		return null;
	}
	const civil = { y: year, m: month, d: 1 };
	return isValidCivil(civil) ? civil : null;
}

function formatIsoMonth(date: Civil): string {
	return `${String(date.y).padStart(4, "0")}-${pad(date.m)}`;
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

function isLeapYear(y: number): boolean {
	return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInCivilMonth(y: number, m: number): number {
	if (m === 2) {
		return isLeapYear(y) ? 29 : 28;
	}
	if (m === 4 || m === 6 || m === 9 || m === 11) {
		return 30;
	}
	return 31;
}

function shiftCivilMonthClamped(current: Civil, deltaMonths: number): Civil | null {
	const total = current.y * 12 + (current.m - 1) + deltaMonths;
	const targetY = Math.floor(total / 12);
	if (targetY < 1) {
		return null;
	}
	const targetM = (((total % 12) + 12) % 12) + 1;
	const maxD = daysInCivilMonth(targetY, targetM);
	const target = { y: targetY, m: targetM, d: Math.min(current.d, maxD) };
	return isValidCivil(target) ? target : null;
}

function formatTriggerLabel({
	mode,
	selectedDate,
	rangeFrom,
	rangeTo,
	locale,
	formatDate,
	placeholder = "Pick a date",
}: {
	mode: "single" | "range";
	selectedDate: Civil | null;
	rangeFrom: string;
	rangeTo?: string;
	locale: string;
	formatDate?: (date: Date) => string;
	placeholder?: string;
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
			return placeholder;
		}
		if (!rangeTo) {
			return `${one(rangeFrom)} – …`;
		}
		return `${one(rangeFrom)} – ${one(rangeTo)}`;
	}
	return selectedDate
		? (formatDate?.(civilDate(selectedDate)) ??
				formatCivil(selectedDate, locale, { dateStyle: "medium" }))
		: placeholder;
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

export type DatePickerLabels = {
	/**
	 * Accessible label for the calendar popup container.
	 * @default "Date calendar" (or derived from `aria-label`)
	 */
	calendar?: string;
	/**
	 * Accessible label for previous month button.
	 * @default "Prev"
	 */
	previousMonth?: string;
	/**
	 * Accessible label for next month button.
	 * @default "Next"
	 */
	nextMonth?: string;
	/**
	 * Fallback label for the trigger when no date is chosen.
	 * @default "Pick a date"
	 */
	placeholder?: string;
	/**
	 * Custom validation error message displayed when form validation fails.
	 */
	validationMessage?: string;
	/**
	 * Accessible keyboard navigation instructions announced for the calendar grid.
	 */
	keyboardInstructions?: string;
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
	 * The controlled displayed month in `YYYY-MM` format (at least 4-digit positive year).
	 * If omitted or invalid, falls back smoothly to `defaultMonth`, selected date, or today.
	 */
	month?: string;
	/**
	 * The uncontrolled initial displayed month in `YYYY-MM` format (at least 4-digit positive year).
	 * If omitted or invalid, falls back smoothly to selected date or today.
	 */
	defaultMonth?: string;
	/**
	 * Called only when calendar navigation requests a month change (`YYYY-MM`).
	 * Not invoked during component render or synchronous prop synchronization.
	 */
	onMonthChange?: (month: string) => void;
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
	 * Optional localized labels for calendar dialog, navigation, and trigger placeholder.
	 */
	labels?: DatePickerLabels;
	/**
	 * Native form field name.
	 */
	name?: string;
	/**
	 * Native required constraint. When readOnly is set, native required validation is disabled.
	 * When an empty required DatePicker submits, the visible trigger receives focus and invalid state.
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
	month: controlledMonthProp,
	defaultMonth: defaultMonthProp,
	onMonthChange,
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
	labels,
	...inputRest
}: DatePickerProps) {
	const {
		ref: externalRef,
		readOnly,
		autoFocus,
		onFocus,
		onBlur,
		onInvalid: externalOnInvalid,
		"aria-labelledby": ariaLabelledBy,
		...formRest
	} = inputRest;
	const [uncontrolled, setUncontrolled] = useState(defaultValue);
	const [uncontrolledRange, setUncontrolledRange] = useState<DatePickerRange>(
		defaultRangeValue ?? { from: "", to: undefined },
	);
	const [open, setOpen] = useState(false);
	const [isInvalid, setIsInvalid] = useState(false);
	const [validationMessage, setValidationMessage] = useState("");
	const [focusIndex, setFocusIndex] = useState(0);
	const dayRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const pendingFocus = useRef<{ targetMonthKey: string; iso: string } | null>(null);
	const focusDay = useRef(false);
	const hiddenRef = useRef<HTMLInputElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const generatedErrorId = React.useId();
	const errorId = id ? `${id}-error` : generatedErrorId;
	const generatedMonthLiveId = React.useId();
	const monthLiveId = id ? `${id}-month-live` : generatedMonthLiveId;
	const generatedKeyboardInstructionsId = React.useId();
	const keyboardInstructionsId = id
		? `${id}-keyboard-instructions`
		: generatedKeyboardInstructionsId;

	const selected = value ?? uncontrolled;
	const selectedRange = rangeValue ?? uncontrolledRange;
	const selectedDate = parseIso(
		mode === "range" ? selectedRange.to || selectedRange.from || "" : selected,
	);
	const cursorIso = selectedDate ? formatIso(selectedDate) : "";

	useEffect(() => {
		if (cursorIso) {
			setIsInvalid(false);
			setValidationMessage("");
		}
	}, [cursorIso]);
	const submitted = mode === "range" ? "" : cursorIso;

	const controlledParsed = useMemo(() => parseIsoMonth(controlledMonthProp), [controlledMonthProp]);
	const isMonthControlled = controlledParsed !== null;

	const [uncontrolledMonth, setUncontrolledMonth] = useState<Civil>(() => {
		const parsedDef = parseIsoMonth(defaultMonthProp);
		if (parsedDef) {
			return parsedDef;
		}
		const initialCursor = selectedDate ?? todayCivil(timeZone);
		const clampedInitial = clampCivil(initialCursor, min, max);
		return { y: clampedInitial.y, m: clampedInitial.m, d: 1 };
	});

	const activeMonth = controlledParsed ?? uncontrolledMonth;
	const activeMonthKey = formatIsoMonth(activeMonth);

	const requestMonth = (target: Civil) => {
		const monthKey = formatIsoMonth(target);
		if (!isMonthControlled) {
			setUncontrolledMonth(target);
		}
		onMonthChange?.(monthKey);
	};

	const prevSelected = useRef(cursorIso);
	if (open && prevSelected.current !== cursorIso) {
		focusDay.current = true;
		if (controlledMonthProp === undefined && defaultMonthProp === undefined) {
			const next = selectedDate ?? todayCivil(timeZone);
			if (activeMonth.y !== next.y || activeMonth.m !== next.m) {
				setUncontrolledMonth({ y: next.y, m: next.m, d: 1 });
			}
		}
	}
	prevSelected.current = cursorIso;

	const hasExplicitMonthConfig =
		controlledMonthProp !== undefined || defaultMonthProp !== undefined;

	useEffect(() => {
		if (!open) {
			return;
		}
		if (!hasExplicitMonthConfig) {
			const next = clampCivil(
				(cursorIso ? parseIso(cursorIso) : null) ?? todayCivil(timeZone),
				min,
				max,
			);
			setUncontrolledMonth({ y: next.y, m: next.m, d: 1 });
			if (!cursorIso) {
				focusDay.current = true;
			}
		}
	}, [open, cursorIso, timeZone, min, max, hasExplicitMonthConfig]);

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

	const latestConfigRef = useRef({
		defaultValue,
		defaultRangeValue,
		mode,
		rangeValue,
		value,
	});
	useEffect(() => {
		latestConfigRef.current = {
			defaultValue,
			defaultRangeValue,
			mode,
			rangeValue,
			value,
		};
	});

	const formAttr = formRest.form;
	useEffect(() => {
		const form = hiddenRef.current?.form;
		if (!form || (formAttr && form.id !== formAttr)) {
			return;
		}
		let disposed = false;
		const timers = new Set<ReturnType<typeof setTimeout>>();
		const onReset = (event: Event) => {
			const timer = setTimeout(() => {
				timers.delete(timer);
				if (disposed || event.defaultPrevented) {
					return;
				}
				const cfg = latestConfigRef.current;
				if (cfg.mode === "range" ? cfg.rangeValue === undefined : cfg.value === undefined) {
					setUncontrolled(cfg.defaultValue);
					setUncontrolledRange(cfg.defaultRangeValue ?? { from: "", to: undefined });
				}
				setIsInvalid(false);
				setValidationMessage("");
				setOpen(false);
			}, 0);
			timers.add(timer);
		};
		form.addEventListener("reset", onReset);
		return () => {
			disposed = true;
			for (const timer of timers) {
				clearTimeout(timer);
			}
			timers.clear();
			form.removeEventListener("reset", onReset);
		};
	}, [formAttr]);

	const weekdayLabels = useMemo(() => {
		const formatter = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
		return Array.from({ length: 7 }, (_, index) => {
			const day = new Date(Date.UTC(2024, 0, 7 + ((index + weekStartsOn) % 7)));
			return formatter.format(day);
		});
	}, [locale, weekStartsOn]);

	const days = useMemo(() => {
		const first = { y: activeMonth.y, m: activeMonth.m, d: 1 };
		if (!isValidCivil(first)) {
			return Array.from({ length: 42 }, () => null);
		}
		const startOffset = (utcDate(first).getUTCDay() - weekStartsOn + 7) % 7;
		const start = addDays(first, -startOffset);
		if (!start) {
			return Array.from({ length: 42 }, (_, index) => addDays(first, index - startOffset));
		}
		return Array.from({ length: 42 }, (_, index) => addDays(start, index));
	}, [activeMonth, weekStartsOn]);

	useLayoutEffect(() => {
		if (!open) {
			return;
		}
		const pending = pendingFocus.current;
		let index = 0;
		if (pending) {
			if (pending.targetMonthKey === activeMonthKey) {
				pendingFocus.current = null;
				index = days.findIndex((date) => isoOf(date) === pending.iso);
				if (index < 0) {
					index = 0;
				}
				focusDay.current = true;
			} else {
				const focused = document.activeElement;
				const focusedIso =
					focused instanceof HTMLElement && dayRefs.current.some((node) => node === focused)
						? focused.getAttribute("aria-label")
						: null;
				const focusedIndex = focusedIso ? days.findIndex((date) => isoOf(date) === focusedIso) : -1;
				if (focusedIndex >= 0) {
					index = focusedIndex;
				} else {
					index = focusIndex;
				}
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
				const iso = cursorIso || submitted || formatIso(todayCivil(timeZone));
				const selectedIndex = days.findIndex((date) => isoOf(date) === iso);
				if (selectedIndex >= 0 && days[selectedIndex]?.m === activeMonth.m) {
					index = selectedIndex;
				} else {
					const firstInMonth = days.findIndex((date) => date?.m === activeMonth.m);
					index = firstInMonth >= 0 ? firstInMonth : 0;
				}
			}
		}
		const enabled = (date: Civil | null) =>
			Boolean(date && date.y >= 1 && dateSelectable(formatIso(date), min, max, isDisabledDate));
		if (!enabled(days[index] ?? null)) {
			const inMonth = days.findIndex((date) => date?.m === activeMonth.m && enabled(date));
			const any = days.findIndex((date) => enabled(date));
			index = inMonth >= 0 ? inMonth : any >= 0 ? any : index;
		}
		setFocusIndex(index);
		if (focusDay.current) {
			focusDay.current = false;
			dayRefs.current[index]?.focus();
		}
	}, [
		open,
		cursorIso,
		submitted,
		timeZone,
		days,
		activeMonth.m,
		activeMonthKey,
		focusIndex,
		min,
		max,
		isDisabledDate,
	]);

	const previousMonth = shiftMonth(activeMonth, -1);
	const followingMonth = shiftMonth(activeMonth, 1);
	const rangeFrom = mode === "range" ? selectedRange.from : "";
	const rangeTo = mode === "range" ? selectedRange.to : undefined;
	const label = formatTriggerLabel({
		mode,
		selectedDate,
		rangeFrom,
		rangeTo,
		locale,
		formatDate,
		placeholder: labels?.placeholder,
	});
	const calendarLabel = labels?.calendar ?? (ariaLabel ? `${ariaLabel} calendar` : "Date calendar");
	const prevMonthLabel = labels?.previousMonth ?? "Prev";
	const nextMonthLabel = labels?.nextMonth ?? "Next";

	function selectable(iso: string) {
		return dateSelectable(iso, min, max, isDisabledDate);
	}

	function commit(next: string) {
		if (disabled || readOnly || !selectable(next)) {
			return;
		}
		if (next) {
			setIsInvalid(false);
			setValidationMessage("");
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

	const handleHiddenRef = React.useCallback(
		(node: HTMLInputElement | null) => {
			hiddenRef.current = node;
			if (!externalRef) {
				return;
			}
			if (typeof externalRef === "function") {
				const cleanup = externalRef(node);
				if (typeof cleanup === "function") {
					return () => {
						hiddenRef.current = null;
						cleanup();
					};
				}
				return () => {
					hiddenRef.current = null;
					externalRef(null);
				};
			}
			(externalRef as React.RefObject<HTMLInputElement | null>).current = node;
			return () => {
				hiddenRef.current = null;
				(externalRef as React.RefObject<HTMLInputElement | null>).current = null;
			};
		},
		[externalRef],
	);

	const invalidState = ariaInvalid ?? (isInvalid || undefined);
	const hasDestructiveStyle =
		invalidState === true ||
		invalidState === "true" ||
		invalidState === "grammar" ||
		invalidState === "spelling";

	const describedBy =
		[ariaDescribedBy, isInvalid && errorId ? errorId : undefined].filter(Boolean).join(" ") ||
		undefined;

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (next && disabled) {
					return;
				}
				if (next) {
					pendingFocus.current = null;
					if (controlledMonthProp === undefined && defaultMonthProp === undefined) {
						const synced = (cursorIso ? parseIso(cursorIso) : null) ?? todayCivil(timeZone);
						setUncontrolledMonth({ y: synced.y, m: synced.m, d: 1 });
					}
					focusDay.current = true;
				} else {
					pendingFocus.current = null;
				}
				setOpen(next);
			}}
		>
			<input
				ref={handleHiddenRef}
				type={mode === "range" ? "text" : "date"}
				name={name}
				required={required}
				readOnly={readOnly}
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
				onInvalid={(event) => {
					externalOnInvalid?.(event);
					if (!event.defaultPrevented) {
						event.preventDefault();
						setIsInvalid(true);
						setValidationMessage(
							labels?.validationMessage ||
								(event.target as HTMLInputElement).validationMessage ||
								"Please fill out this field.",
						);
						triggerRef.current?.focus();
					}
				}}
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
					aria-describedby={describedBy}
					aria-invalid={invalidState}
					className={cn(
						"justify-start font-normal",
						hasDestructiveStyle && "border-basalt-destructive text-basalt-destructive",
						className,
					)}
				>
					{label}
				</Button>
			</PopoverTrigger>
			{isInvalid && validationMessage ? (
				<span id={errorId} role="alert" className="mt-1 block text-xs text-basalt-destructive">
					{validationMessage}
				</span>
			) : null}
			<PopoverContent
				arrow={false}
				className="w-64 p-3"
				aria-label={calendarLabel}
				aria-describedby={keyboardInstructionsId}
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					const iso = cursorIso || submitted || formatIso(todayCivil(timeZone));
					const selectedIndex = days.findIndex((date) => isoOf(date) === iso);
					const enabled = (date: Civil | null) =>
						Boolean(
							date && date.y >= 1 && dateSelectable(formatIso(date), min, max, isDisabledDate),
						);
					let index =
						selectedIndex >= 0 && days[selectedIndex]?.m === activeMonth.m
							? selectedIndex
							: Math.max(
									0,
									days.findIndex((date) => date?.m === activeMonth.m),
								);
					if (!enabled(days[index] ?? null)) {
						const inMonth = days.findIndex((date) => date?.m === activeMonth.m && enabled(date));
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
						aria-label={prevMonthLabel}
						className="size-8"
						disabled={disabled || !previousMonth || previousMonth.y < 1}
						onClick={() => {
							if (!previousMonth || previousMonth.y < 1) {
								return;
							}
							pendingFocus.current = null;
							focusDay.current = false;
							requestMonth(previousMonth);
						}}
					/>
					<span
						id={monthLiveId}
						aria-live="polite"
						aria-atomic="true"
						className="text-sm font-medium"
					>
						{formatCivil(activeMonth, locale, { month: "long", year: "numeric" })}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						icon={<ChevronRight />}
						aria-label={nextMonthLabel}
						className="size-8"
						disabled={disabled || !followingMonth}
						onClick={() => {
							if (!followingMonth) {
								return;
							}
							pendingFocus.current = null;
							focusDay.current = false;
							requestMonth(followingMonth);
						}}
					/>
				</div>
				<p id={keyboardInstructionsId} className="sr-only">
					{labels?.keyboardInstructions ??
						"Use arrow keys to navigate dates, PageUp and PageDown to change months, and Enter or Space to select."}
				</p>
				{/* Biome override: WAI-ARIA APG Date Picker pattern uses a semantic table with role="grid" and role="gridcell" on cells while roving tabindex focuses the child button */}
				<table
					role="grid"
					aria-labelledby={monthLiveId}
					aria-multiselectable={mode === "range" ? "true" : undefined}
					className="w-full border-collapse text-center"
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
							if (next.y !== activeMonth.y || next.m !== activeMonth.m) {
								pendingFocus.current = {
									targetMonthKey: formatIsoMonth(next),
									iso: formatIso(next),
								};
								requestMonth({ y: next.y, m: next.m, d: 1 });
								return;
							}
							const index = days.findIndex((date) => isoOf(date) === formatIso(next));
							if (index >= 0) {
								setFocusIndex(index);
								dayRefs.current[index]?.focus();
							}
							return;
						}
						if (event.key === "Home" || event.key === "End") {
							event.preventDefault();
							const dayOfWeek = utcDate(current).getUTCDay();
							const col = (dayOfWeek - weekStartsOn + 7) % 7;
							const deltaToEdge = event.key === "Home" ? -col : 6 - col;
							let next: Civil | null = addDays(current, deltaToEdge);
							const stepDir = event.key === "Home" ? 1 : -1;
							for (
								let step = 0;
								next && next.y >= 1 && !selectable(formatIso(next)) && step < 7;
								step += 1
							) {
								next = addDays(next, stepDir);
							}
							if (!next || next.y < 1 || !selectable(formatIso(next))) {
								return;
							}
							if (next.y !== activeMonth.y || next.m !== activeMonth.m) {
								pendingFocus.current = {
									targetMonthKey: formatIsoMonth(next),
									iso: formatIso(next),
								};
								requestMonth({ y: next.y, m: next.m, d: 1 });
								return;
							}
							const index = days.findIndex((date) => isoOf(date) === formatIso(next));
							if (index >= 0) {
								setFocusIndex(index);
								dayRefs.current[index]?.focus();
							}
							return;
						}
						if (event.key === "PageDown" || event.key === "PageUp") {
							event.preventDefault();
							const deltaMonths = event.shiftKey
								? event.key === "PageDown"
									? 12
									: -12
								: event.key === "PageDown"
									? 1
									: -1;
							const target = shiftCivilMonthClamped(current, deltaMonths);
							if (!target) {
								return;
							}
							let next: Civil | null = target;
							for (
								let step = 0;
								next && next.y >= 1 && !selectable(formatIso(next)) && step < 42;
								step += 1
							) {
								next = addDays(next, 1);
							}
							if (!next || next.y < 1 || !selectable(formatIso(next))) {
								next = target;
								for (
									let step = 0;
									next && next.y >= 1 && !selectable(formatIso(next)) && step < 42;
									step += 1
								) {
									next = addDays(next, -1);
								}
							}
							if (!next || next.y < 1 || !selectable(formatIso(next))) {
								return;
							}
							pendingFocus.current = {
								targetMonthKey: formatIsoMonth(next),
								iso: formatIso(next),
							};
							requestMonth({ y: next.y, m: next.m, d: 1 });
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
					<thead>
						<tr>
							{weekdayLabels.map((day, index) => (
								<th
									key={`${day}-${index}`}
									scope="col"
									className="h-8 text-center text-xs font-medium text-basalt-muted-foreground"
								>
									{day}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: 6 }, (_, weekIndex) => (
							<tr key={`week-${weekIndex}`}>
								{days.slice(weekIndex * 7, weekIndex * 7 + 7).map((date, colIndex) => {
									const index = weekIndex * 7 + colIndex;
									if (!date) {
										return (
											<td
												key={`empty-${index}`}
												role="gridcell"
												className="h-8 p-0 text-center"
												ref={() => {
													dayRefs.current[index] = null;
												}}
											/>
										);
									}
									const iso = formatIso(date);
									const inMonth = date.m === activeMonth.m;
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
									const isSelected =
										mode === "range"
											? inSelectedRange || isRangeEdge
											: Boolean(submitted) && iso === submitted;

									return (
										<td
											key={iso}
											role="gridcell"
											aria-selected={isSelected ? "true" : undefined}
											className="h-8 p-0 text-center"
										>
											<button
												type="button"
												ref={(node) => {
													dayRefs.current[index] = node;
												}}
												tabIndex={index === focusIndex ? 0 : -1}
												data-date={iso}
												aria-label={iso}
												aria-pressed={mode === "range" ? isRangeEdge : isSelected}
												disabled={disabled || readOnly || !inRange}
												className={cn(
													CALENDAR_BUTTON,
													"mx-auto flex h-8 w-8 items-center justify-center rounded-basalt-md text-sm",
													inMonth ? "text-basalt-foreground" : "text-basalt-muted-foreground",
													inRange && "hover:bg-basalt-accent",
													inSelectedRange && !isRangeEdge && "bg-basalt-accent",
													inRange &&
														(mode === "range" ? isRangeEdge : isSelected) &&
														"bg-basalt-primary text-basalt-primary-foreground hover:bg-basalt-primary/90",
												)}
												onClick={() => inRange && commit(iso)}
											>
												{date.d}
											</button>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</PopoverContent>
		</Popover>
	);
}
