import { useEffect, useMemo, useState } from "react";
import { cn } from "../utils/cn";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type Civil = { y: number; m: number; d: number };

function pad(value: number) {
	return String(value).padStart(2, "0");
}

function formatIso(date: Civil) {
	return `${date.y}-${pad(date.m)}-${pad(date.d)}`;
}

function parseIso(value: string): Civil | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return null;
	}
	const [year, month, day] = value.split("-").map(Number);
	const utc = new Date(Date.UTC(year, month - 1, day));
	if (
		utc.getUTCFullYear() !== year ||
		utc.getUTCMonth() + 1 !== month ||
		utc.getUTCDate() !== day
	) {
		return null;
	}
	return { y: year, m: month, d: day };
}

function utcDate(date: Civil) {
	return new Date(Date.UTC(date.y, date.m - 1, date.d));
}

function civilDate(date: Civil) {
	return new Date(date.y, date.m - 1, date.d);
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
	const selected = value ?? uncontrolled;
	const selectedDate = selected ? parseIso(selected) : null;
	const cursor = selectedDate ?? todayCivil(timeZone);
	const [month, setMonth] = useState<Civil>({ y: cursor.y, m: cursor.m, d: 1 });

	useEffect(() => {
		const next = selected ? parseIso(selected) : null;
		if (!next) {
			return;
		}
		setMonth({ y: next.y, m: next.m, d: 1 });
	}, [selected]);

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

	const label = selectedDate
		? (formatDate?.(civilDate(selectedDate)) ??
			formatCivil(selectedDate, locale, { dateStyle: "medium" }))
		: "Pick a date";

	function commit(next: string) {
		if (value === undefined) {
			setUncontrolled(next);
		}
		onChange?.(next);
	}

	return (
		<Popover>
			{name ? <input type="hidden" name={name} value={selected} disabled={disabled} /> : null}
			<input
				type="date"
				className="sr-only mb-2 h-7"
				style={{
					position: "absolute",
					width: 1,
					height: 1,
					overflow: "hidden",
					clip: "rect(0, 0, 0, 0)",
				}}
				value={selected}
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
			<PopoverContent className="w-64 p-3">
				<div className="mb-2 flex items-center justify-between text-sm">
					<button
						type="button"
						className={CALENDAR_BUTTON}
						onClick={() =>
							setMonth(
								month.m === 1
									? { y: month.y - 1, m: 12, d: 1 }
									: { y: month.y, m: month.m - 1, d: 1 },
							)
						}
					>
						Prev
					</button>
					<span>{formatCivil(month, locale, { month: "long", year: "numeric" })}</span>
					<button
						type="button"
						className={CALENDAR_BUTTON}
						onClick={() =>
							setMonth(
								month.m === 12
									? { y: month.y + 1, m: 1, d: 1 }
									: { y: month.y, m: month.m + 1, d: 1 },
							)
						}
					>
						Next
					</button>
				</div>
				<div className="grid grid-cols-7 gap-1 text-center text-xs text-basalt-muted-foreground">
					{weekdayLabels.map((day, index) => (
						<span key={`${day}-${index}`}>{day}</span>
					))}
					{days.map((date) => {
						const iso = formatIso(date);
						const inMonth = date.m === month.m;
						return (
							<button
								type="button"
								key={iso}
								aria-label={iso}
								aria-pressed={iso === selected}
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
