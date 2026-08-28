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

function addDays(date: Civil, days: number): Civil {
	const next = utcDate(date);
	next.setUTCDate(next.getUTCDate() + days);
	return { y: next.getUTCFullYear(), m: next.getUTCMonth() + 1, d: next.getUTCDate() };
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
	"aria-label": ariaLabel,
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
	"aria-label"?: string;
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
		const startOffset = (utcDate(first).getUTCDay() - weekStartsOn + 7) % 7;
		const start = addDays(first, -startOffset);
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
			index = days.findIndex((date) => formatIso(date) === pending);
			if (index < 0) {
				index = 0;
			}
		} else {
			const iso = selected || formatIso(todayCivil(timeZone));
			const selectedIndex = days.findIndex((date) => formatIso(date) === iso);
			if (selectedIndex >= 0 && days[selectedIndex]?.m === month.m) {
				index = selectedIndex;
			} else {
				const firstInMonth = days.findIndex((date) => date.m === month.m);
				index = firstInMonth >= 0 ? firstInMonth : 0;
			}
		}
		setFocusIndex(index);
		if (focusDay.current) {
			focusDay.current = false;
			dayRefs.current[index]?.focus();
		}
	}, [open, selected, timeZone, days, month.m]);

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
					disabled={disabled}
					aria-label={selectedDate ? `${ariaLabel ?? "Date"}: ${label}` : (ariaLabel ?? "Date")}
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
					const iso = selected || formatIso(todayCivil(timeZone));
					const selectedIndex = days.findIndex((date) => formatIso(date) === iso);
					const index =
						selectedIndex >= 0 && days[selectedIndex]?.m === month.m
							? selectedIndex
							: Math.max(
									0,
									days.findIndex((date) => date.m === month.m),
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
						disabled={disabled}
						onClick={() => {
							focusDay.current = false;
							setMonth(
								month.m === 1
									? { y: month.y - 1, m: 12, d: 1 }
									: { y: month.y, m: month.m - 1, d: 1 },
							);
						}}
					>
						Prev
					</button>
					<span>{formatCivil(month, locale, { month: "long", year: "numeric" })}</span>
					<button
						type="button"
						className={CALENDAR_BUTTON}
						disabled={disabled}
						onClick={() => {
							focusDay.current = false;
							setMonth(
								month.m === 12
									? { y: month.y + 1, m: 1, d: 1 }
									: { y: month.y, m: month.m + 1, d: 1 },
							);
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
							if (next.y !== month.y || next.m !== month.m) {
								pendingFocusIso.current = formatIso(next);
								focusDay.current = true;
								setMonth({ y: next.y, m: next.m, d: 1 });
								return;
							}
							const index = days.findIndex((date) => formatIso(date) === formatIso(next));
							if (index >= 0) {
								setFocusIndex(index);
								dayRefs.current[index]?.focus();
							}
							return;
						}
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							commit(formatIso(current));
						}
					}}
				>
					{weekdayLabels.map((day, index) => (
						<span key={`${day}-${index}`}>{day}</span>
					))}
					{days.map((date, index) => {
						const iso = formatIso(date);
						const inMonth = date.m === month.m;
						return (
							<button
								type="button"
								key={iso}
								ref={(node) => {
									dayRefs.current[index] = node;
								}}
								tabIndex={index === focusIndex ? 0 : -1}
								aria-label={iso}
								aria-pressed={iso === selected}
								disabled={disabled}
								className={cn(
									CALENDAR_BUTTON,
									"h-7 rounded-basalt-sm text-xs",
									inMonth ? "text-basalt-foreground" : "text-basalt-muted-foreground",
									iso === selected && "bg-basalt-primary text-basalt-primary-foreground",
								)}
								onClick={() => commit(iso)}
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
