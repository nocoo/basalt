import { useMemo, useState } from "react";
import { cn } from "../utils/cn";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function isoDate(date: Date, timeZone?: string) {
	if (timeZone) {
		return new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(date);
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function parseIso(value: string) {
	const [year, month, day] = value.split("-").map(Number);
	if (!year || !month || !day) {
		return null;
	}
	return new Date(year, month - 1, day);
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
	const today = isoDate(new Date(), timeZone);
	const cursor = selectedDate ?? parseIso(today) ?? new Date();
	const [month, setMonth] = useState(new Date(cursor.getFullYear(), cursor.getMonth(), 1));

	const weekdayLabels = useMemo(() => {
		const formatter = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone });
		return Array.from({ length: 7 }, (_, index) => {
			const day = new Date(Date.UTC(2024, 0, 7 + ((index + weekStartsOn) % 7)));
			return formatter.format(day);
		});
	}, [locale, timeZone, weekStartsOn]);

	const days = useMemo(() => {
		const first = new Date(month.getFullYear(), month.getMonth(), 1);
		const startOffset = (first.getDay() - weekStartsOn + 7) % 7;
		const start = new Date(first);
		start.setDate(first.getDate() - startOffset);
		return Array.from({ length: 42 }, (_, index) => {
			const date = new Date(start);
			date.setDate(start.getDate() + index);
			return date;
		});
	}, [month, weekStartsOn]);

	const label = selectedDate
		? (formatDate?.(selectedDate) ??
			new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone }).format(selectedDate))
		: "Pick a date";

	function commit(next: string) {
		if (value === undefined) {
			setUncontrolled(next);
		}
		onChange?.(next);
	}

	return (
		<Popover>
			{name ? <input type="hidden" name={name} value={selected} /> : null}
			<input
				type="date"
				className="sr-only"
				value={selected}
				readOnly
				aria-hidden="true"
				tabIndex={-1}
			/>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					aria-label={ariaLabel ?? "Date"}
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
						onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
					>
						Prev
					</button>
					<span>
						{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone }).format(
							month,
						)}
					</span>
					<button
						type="button"
						onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
					>
						Next
					</button>
				</div>
				<div className="grid grid-cols-7 gap-1 text-center text-xs text-basalt-muted-foreground">
					{weekdayLabels.map((day, index) => (
						<span key={`${day}-${index}`}>{day}</span>
					))}
					{days.map((date) => {
						const iso = isoDate(date, timeZone);
						const inMonth = date.getMonth() === month.getMonth();
						return (
							<button
								type="button"
								key={iso}
								className={cn(
									"h-7 rounded-basalt-sm text-xs",
									inMonth ? "text-basalt-foreground" : "text-basalt-muted-foreground",
									iso === selected && "bg-basalt-primary text-basalt-primary-foreground",
								)}
								onClick={() => commit(iso)}
							>
								{date.getDate()}
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
