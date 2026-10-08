import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { Button } from "../components/button";
import { DatePicker } from "../components/date-picker";
import { cn } from "../utils/cn";

function shiftIso(value: string, delta: number) {
	const match = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(value);
	const date = match
		? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
		: new Date();
	date.setDate(date.getDate() + delta);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function civilInZone(date: Date, timeZone?: string) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const read = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((part) => part.type === type)?.value);
	return { y: read("year"), m: read("month"), d: read("day") };
}

function isSameCivil(
	left: { y: number; m: number; d: number },
	right: { y: number; m: number; d: number },
) {
	return left.y === right.y && left.m === right.m && left.d === right.d;
}

type PickerProps = ComponentProps<typeof DatePicker> & {
	ariaLabel?: string;
	selectedDate?: undefined;
};

type DisplayProps = {
	selectedDate: Date;
	onPrevDay: () => void;
	onNextDay: () => void;
	onToday: () => void;
	onToggleCalendar?: () => void;
	todayLabel?: string;
	previousDayLabel?: string;
	nextDayLabel?: string;
	formatDate?: (date: Date) => string;
	locale?: string;
	timeZone?: string;
	className?: string;
};

export type DateNavigationPickerProps = {
	ariaLabel?: string;
	className?: string;
};

export type DateNavigationDisplayProps = DisplayProps;

export function DateNavigation(props: PickerProps | DisplayProps) {
	if ("onPrevDay" in props) {
		return <DateNavigationDisplay {...props} />;
	}
	return <DateNavigationPicker {...props} />;
}

function DateNavigationPicker({
	value,
	defaultValue = "",
	onChange,
	disabled,
	ariaLabel,
	"aria-label": ariaLabelAttr,
	...props
}: PickerProps) {
	const [uncontrolled, setUncontrolled] = useState(value ?? defaultValue);
	const selected = value ?? uncontrolled;
	function commit(next: string) {
		if (value === undefined) {
			setUncontrolled(next);
		}
		onChange?.(next);
	}
	return (
		<div className="inline-flex items-center gap-basalt-space-sm">
			<Button
				variant="outline"
				size="icon"
				disabled={disabled}
				aria-label="Previous day"
				onClick={() => commit(shiftIso(selected, -1))}
			>
				<ChevronLeft />
			</Button>
			<DatePicker
				{...props}
				value={selected}
				disabled={disabled}
				onChange={commit}
				aria-label={ariaLabel ?? ariaLabelAttr ?? "Date navigation"}
			/>
			<Button
				variant="outline"
				size="icon"
				disabled={disabled}
				aria-label="Next day"
				onClick={() => commit(shiftIso(selected, 1))}
			>
				<ChevronRight />
			</Button>
		</div>
	);
}

function DateNavigationDisplay({
	selectedDate,
	onPrevDay,
	onNextDay,
	onToday,
	onToggleCalendar,
	todayLabel = "Today",
	previousDayLabel = "Previous day",
	nextDayLabel = "Next day",
	formatDate,
	locale = "en-US",
	timeZone,
	className,
}: DisplayProps) {
	const resolvedFormatDate =
		formatDate ??
		((date: Date) =>
			date.toLocaleDateString(locale, {
				weekday: "short",
				year: "numeric",
				month: "short",
				day: "numeric",
				timeZone,
			}));
	const isToday = isSameCivil(
		civilInZone(selectedDate, timeZone),
		civilInZone(new Date(), timeZone),
	);
	const formatted = resolvedFormatDate(selectedDate);
	return (
		<div className={cn("flex items-center justify-center gap-basalt-space-lg", className)}>
			<button
				type="button"
				onClick={onToday}
				disabled={isToday}
				className={cn(
					"mr-basalt-space-lg rounded-basalt-md px-basalt-space-lg py-basalt-space-md text-basalt-base font-medium transition-colors basalt-motion",
					isToday
						? "cursor-not-allowed text-basalt-muted-foreground opacity-50"
						: "bg-basalt-secondary text-basalt-foreground hover:bg-basalt-hover",
				)}
			>
				{todayLabel}
			</button>
			<button
				type="button"
				onClick={onPrevDay}
				aria-label={previousDayLabel}
				className="flex h-basalt-8 w-basalt-8 items-center justify-center rounded-basalt-md text-basalt-muted-foreground transition-colors basalt-motion hover:bg-basalt-hover hover:text-basalt-foreground"
			>
				<ChevronLeft className="h-basalt-4 w-basalt-4" strokeWidth={1.5} />
			</button>
			{onToggleCalendar ? (
				<button
					type="button"
					onClick={onToggleCalendar}
					className="flex cursor-pointer items-center gap-basalt-space-lg rounded-basalt-md px-basalt-space-lg py-basalt-space-md text-basalt-xl font-medium transition-colors basalt-motion hover:bg-basalt-hover"
				>
					<span>{formatted}</span>
					<CalendarIcon
						className="h-basalt-4 w-basalt-4 text-basalt-muted-foreground"
						strokeWidth={1.5}
					/>
				</button>
			) : (
				<span className="flex items-center gap-basalt-space-lg rounded-basalt-md px-basalt-space-lg py-basalt-space-md text-basalt-xl font-medium">
					{formatted}
				</span>
			)}
			<button
				type="button"
				onClick={onNextDay}
				aria-label={nextDayLabel}
				className="flex h-basalt-8 w-basalt-8 items-center justify-center rounded-basalt-md text-basalt-muted-foreground transition-colors basalt-motion hover:bg-basalt-hover hover:text-basalt-foreground"
			>
				<ChevronRight className="h-basalt-4 w-basalt-4" strokeWidth={1.5} />
			</button>
		</div>
	);
}
