import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
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
	locale = "en-US",
	weekStartsOn = 0,
	timeZone,
	formatDate,
	name,
	disabled,
	className,
	id,
	"aria-label": ariaLabel,
	"aria-describedby": ariaDescribedBy,
	"aria-invalid": ariaInvalid,
}: {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	locale?: string;
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	timeZone?: string;
	formatDate?: (date: Date) => string;
	name?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
	"aria-label"?: string;
	"aria-describedby"?: string;
	"aria-invalid"?: boolean | "true" | "false";
}) {
	const [uncontrolled, setUncontrolled] = useState(defaultValue);
	const [open, setOpen] = useState(false);
	const [focusIndex, setFocusIndex] = useState(0);
	const dayRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const pendingFocusIso = useRef<string | null>(null);
	const focusDay = useRef(false);
	const hiddenRef = useRef<HTMLInputElement>(null);
	const selected = value ?? uncontrolled;
	const selectedDate = selected ? parseIso(selected) : null;
	const submitted = selectedDate ? formatIso(selectedDate) : "";
	const cursor = selectedDate ?? todayCivil(timeZone);
	const [month, setMonth] = useState<Civil>({ y: cursor.y, m: cursor.m, d: 1 });
	const prevSelected = useRef(selected);
	if (open && prevSelected.current !== selected) {
		focusDay.current = true;
		const next = selectedDate ?? todayCivil(timeZone);
		if (month.y !== next.y || month.m !== next.m) {
			setMonth({ y: next.y, m: next.m, d: 1 });
		}
	}
	prevSelected.current = selected;

	useEffect(() => {
		if (!open) {
			return;
		}
		const next = (selected ? parseIso(selected) : null) ?? todayCivil(timeZone);
		setMonth({ y: next.y, m: next.m, d: 1 });
		if (!selected) {
			focusDay.current = true;
		}
	}, [open, selected, timeZone]);

	useEffect(() => {
		if (disabled) {
			setOpen(false);
		}
	}, [disabled]);

	useEffect(() => {
		const form = hiddenRef.current?.form;
		if (!form || value !== undefined) {
			return;
		}
		const onReset = (event: Event) => {
			queueMicrotask(() => {
				if (event.defaultPrevented) {
					return;
				}
				setUncontrolled(defaultValue);
				setOpen(false);
			});
		};
		form.addEventListener("reset", onReset);
		return () => form.removeEventListener("reset", onReset);
	}, [defaultValue, value]);

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
		setFocusIndex(index);
		if (focusDay.current) {
			focusDay.current = false;
			dayRefs.current[index]?.focus();
		}
	}, [open, submitted, timeZone, days, month.m]);

	const previousMonth = shiftMonth(month, -1);
	const followingMonth = shiftMonth(month, 1);
	const label = selectedDate
		? (formatDate?.(civilDate(selectedDate)) ??
			formatCivil(selectedDate, locale, { dateStyle: "medium" }))
		: "Pick a date";

	function commit(next: string) {
		if (disabled) {
			return;
		}
		if (value === undefined) {
			setUncontrolled(next);
		}
		setOpen(false);
		onChange?.(next);
	}

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (next && disabled) {
					return;
				}
				if (next) {
					const synced = (selected ? parseIso(selected) : null) ?? todayCivil(timeZone);
					setMonth({ y: synced.y, m: synced.m, d: 1 });
					focusDay.current = true;
				}
				setOpen(next);
			}}
		>
			{name ? <input type="hidden" name={name} value={submitted} disabled={disabled} /> : null}
			<input
				ref={hiddenRef}
				type="date"
				className="sr-only mb-2 h-7"
				style={{
					position: "absolute",
					width: 1,
					height: 1,
					overflow: "hidden",
					clip: "rect(0, 0, 0, 0)",
				}}
				value={submitted}
				readOnly
				disabled={disabled}
				aria-hidden="true"
				tabIndex={-1}
			/>
			<PopoverTrigger asChild>
				<button
					type="button"
					id={id}
					disabled={disabled}
					aria-label={ariaLabel ? (selectedDate ? `${ariaLabel}: ${label}` : ariaLabel) : undefined}
					aria-describedby={ariaDescribedBy}
					aria-invalid={ariaInvalid}
					className={cn(
						"flex h-9 rounded-basalt-md border border-basalt-border bg-basalt-secondary px-3 text-sm",
						className,
					)}
				>
					{label}
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-64 p-3"
				aria-label={ariaLabel ? `${ariaLabel} calendar` : "Date calendar"}
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					const iso = submitted || formatIso(todayCivil(timeZone));
					const selectedIndex = days.findIndex((date) => isoOf(date) === iso);
					const index =
						selectedIndex >= 0 && days[selectedIndex]?.m === month.m
							? selectedIndex
							: Math.max(
									0,
									days.findIndex((date) => date?.m === month.m),
								);
					queueMicrotask(() => {
						dayRefs.current[index]?.focus();
					});
				}}
			>
				<div className="mb-2 flex items-center justify-between text-sm">
					<button
						type="button"
						className={CALENDAR_BUTTON}
						disabled={disabled || !previousMonth || previousMonth.y < 1}
						onClick={() => {
							if (!previousMonth || previousMonth.y < 1) {
								return;
							}
							focusDay.current = false;
							setMonth(previousMonth);
						}}
					>
						Prev
					</button>
					<span>{formatCivil(month, locale, { month: "long", year: "numeric" })}</span>
					<button
						type="button"
						className={CALENDAR_BUTTON}
						disabled={disabled || !followingMonth}
						onClick={() => {
							if (!followingMonth) {
								return;
							}
							focusDay.current = false;
							setMonth(followingMonth);
						}}
					>
						Next
					</button>
				</div>
				<div
					className="grid grid-cols-7 gap-1 text-center text-xs text-basalt-muted-foreground"
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
							const next = addDays(current, delta);
							if (!next || next.y < 1) {
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
							if (current.y >= 1) {
								commit(formatIso(current));
							}
						}
					}}
				>
					{weekdayLabels.map((day, index) => (
						<span key={`${day}-${index}`}>{day}</span>
					))}
					{days.map((date, index) => {
						if (!date) {
							return (
								<span
									key={`empty-${index}`}
									className="h-7"
									ref={() => {
										dayRefs.current[index] = null;
									}}
								/>
							);
						}
						const iso = formatIso(date);
						const inMonth = date.m === month.m;
						const inRange = date.y >= 1;
						return (
							<button
								type="button"
								key={iso}
								ref={(node) => {
									dayRefs.current[index] = node;
								}}
								tabIndex={index === focusIndex ? 0 : -1}
								aria-label={iso}
								aria-pressed={Boolean(submitted) && iso === submitted}
								disabled={disabled || !inRange}
								className={cn(
									CALENDAR_BUTTON,
									"h-7 rounded-basalt-sm text-xs",
									inMonth ? "text-basalt-foreground" : "text-basalt-muted-foreground",
									inRange &&
										iso === submitted &&
										"bg-basalt-primary text-basalt-primary-foreground",
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
