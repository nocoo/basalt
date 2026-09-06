import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/tooltip";
import { cn } from "../utils/cn";

export type HeatmapDataPoint = { date: string; value: number };

export const heatmapColorScales = {
	green: [
		"hsl(var(--basalt-muted))",
		"hsl(var(--basalt-heatmap-green-1))",
		"hsl(var(--basalt-heatmap-green-2))",
		"hsl(var(--basalt-heatmap-green-3))",
		"hsl(var(--basalt-heatmap-green-4))",
	],
	red: [
		"hsl(var(--basalt-muted))",
		"hsl(var(--basalt-heatmap-red-1))",
		"hsl(var(--basalt-heatmap-red-2))",
		"hsl(var(--basalt-heatmap-red-3))",
		"hsl(var(--basalt-heatmap-red-4))",
	],
	blue: [
		"hsl(var(--basalt-muted))",
		"hsl(var(--basalt-heatmap-blue-1))",
		"hsl(var(--basalt-heatmap-blue-2))",
		"hsl(var(--basalt-heatmap-blue-3))",
		"hsl(var(--basalt-heatmap-blue-4))",
	],
	orange: [
		"hsl(var(--basalt-muted))",
		"hsl(var(--basalt-heatmap-orange-1))",
		"hsl(var(--basalt-heatmap-orange-2))",
		"hsl(var(--basalt-heatmap-orange-3))",
		"hsl(var(--basalt-heatmap-orange-4))",
	],
} as const;

function weekdayNames(locale: string) {
	return Array.from({ length: 7 }, (_, index) =>
		new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2023, 0, 1 + index)),
	);
}

function monthNames(locale: string) {
	return Array.from({ length: 12 }, (_, index) =>
		new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2023, index, 1)),
	);
}

function getYearWeeks(year: number): Date[][] {
	const weeks: Date[][] = [];
	const startDate = new Date(year, 0, 1);
	const endDate = new Date(year, 11, 31);
	const firstDay = new Date(startDate);
	firstDay.setDate(firstDay.getDate() - firstDay.getDay());
	let currentDate = new Date(firstDay);
	let currentWeek: Date[] = [];
	while (currentDate <= endDate || currentWeek.length > 0) {
		if (currentWeek.length === 7) {
			weeks.push(currentWeek);
			currentWeek = [];
		}
		if (currentDate > endDate) {
			break;
		}
		currentWeek.push(new Date(currentDate));
		currentDate = new Date(currentDate);
		currentDate.setDate(currentDate.getDate() + 1);
	}
	if (currentWeek.length > 0) {
		weeks.push(currentWeek);
	}
	return weeks;
}

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function getColorIndex(value: number, maxValue: number, colorScale: readonly string[]): number {
	if (value === 0) {
		return 0;
	}
	const levels = colorScale.length - 1;
	const normalized = Math.min(value / maxValue, 1);
	return Math.ceil(normalized * levels);
}

export type HeatmapCalendarValuesProps = {
	/**
	 * Numeric values sequence to display in a compact 7-column grid.
	 */
	values: number[];
	/**
	 * Accessible name describing the heatmap purpose or data.
	 * @default "Heatmap calendar"
	 */
	ariaLabel?: string;
	/**
	 * Additional CSS class names for the outer container.
	 */
	className?: string;
};

export type HeatmapCalendarYearProps = {
	/**
	 * Dataset of daily metrics with ISO date strings ("YYYY-MM-DD") and numeric values.
	 */
	data: HeatmapDataPoint[];
	/**
	 * Calendar year to render.
	 */
	year: number;
	/**
	 * Array of color values forming the intensity gradient from lowest to highest.
	 * @default heatmapColorScales.green
	 */
	colorScale?: readonly string[];
	/**
	 * Formatter for tooltip value display and accessible label.
	 * @default (value) => value.toLocaleString()
	 */
	valueFormatter?: (value: number, date: string) => string;
	/**
	 * Name of the metric for accessible labeling and tooltips.
	 * @default "Value"
	 */
	metricLabel?: string;
	/**
	 * Pixel width and height of each day cell.
	 * @default 12
	 */
	cellSize?: number;
	/**
	 * Pixel gap between adjacent cells.
	 * @default 2
	 */
	cellGap?: number;
	/**
	 * BCP 47 locale tag used for weekday and month label formatting.
	 * @default "en-US"
	 */
	locale?: string;
	/**
	 * Explicit custom weekday labels override.
	 */
	weekdayLabels?: string[];
	/**
	 * Explicit custom month labels override.
	 */
	monthLabels?: string[];
	/**
	 * Label text for the lower end of the color scale legend.
	 * @default "Less"
	 */
	lessLabel?: string;
	/**
	 * Label text for the upper end of the color scale legend.
	 * @default "More"
	 */
	moreLabel?: string;
	/**
	 * Accessible name describing the yearly heatmap dataset.
	 * @default "Heatmap calendar"
	 */
	ariaLabel?: string;
	/**
	 * Additional CSS class names for the outer scrollable container.
	 */
	className?: string;
};

export type HeatmapCalendarProps = HeatmapCalendarValuesProps | HeatmapCalendarYearProps;

export function HeatmapCalendar(props: HeatmapCalendarProps) {
	if ("data" in props) {
		const {
			colorScale = heatmapColorScales.green,
			valueFormatter = (value) => value.toLocaleString(),
			metricLabel = "Value",
			cellSize = 12,
			cellGap = 2,
			locale = "en-US",
			weekdayLabels,
			monthLabels,
			lessLabel = "Less",
			moreLabel = "More",
			ariaLabel = "Heatmap calendar",
			className,
		} = props;
		return (
			<YearHeatmap
				data={props.data}
				year={props.year}
				colorScale={colorScale}
				valueFormatter={valueFormatter}
				metricLabel={metricLabel}
				cellSize={cellSize}
				cellGap={cellGap}
				locale={locale}
				weekdayLabels={weekdayLabels}
				monthLabels={monthLabels}
				lessLabel={lessLabel}
				moreLabel={moreLabel}
				ariaLabel={ariaLabel}
				className={className}
			/>
		);
	}
	const { ariaLabel = "Heatmap calendar", className } = props;
	return <ValuesHeatmap values={props.values} ariaLabel={ariaLabel} className={className} />;
}

function ValuesHeatmap({
	values,
	ariaLabel,
	className,
}: {
	values: number[];
	ariaLabel: string;
	className?: string;
}) {
	const [activeIdx, setActiveIdx] = useState(0);
	const [openTooltipIdx, setOpenTooltipIdx] = useState<number | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const isFocusedInsideRef = useRef(false);

	// When values array shrinks or empties: if an item currently held focus,
	// restore focus to the new valid index or empty container without stealing focus from outside.
	useEffect(() => {
		const hadFocus = isFocusedInsideRef.current;
		if (values.length === 0) {
			setActiveIdx(0);
			setOpenTooltipIdx(null);
			if (hadFocus) {
				containerRef.current?.focus();
			}
		} else if (activeIdx >= values.length) {
			const next = values.length - 1;
			setActiveIdx(next);
			if (hadFocus) {
				cellRefs.current[next]?.focus();
			}
		}
	}, [values.length, activeIdx]);

	const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
		if (values.length === 0) return;

		if (e.key === "Escape") {
			setOpenTooltipIdx(null);
			return;
		}

		let nextIdx = currentIndex;
		if (e.key === "ArrowRight") {
			nextIdx = Math.min(values.length - 1, currentIndex + 1);
		} else if (e.key === "ArrowLeft") {
			nextIdx = Math.max(0, currentIndex - 1);
		} else if (e.key === "ArrowDown") {
			nextIdx = Math.min(values.length - 1, currentIndex + 7);
		} else if (e.key === "ArrowUp") {
			nextIdx = Math.max(0, currentIndex - 7);
		} else if (e.key === "Home") {
			nextIdx = 0;
		} else if (e.key === "End") {
			nextIdx = values.length - 1;
		} else {
			return;
		}

		e.preventDefault();
		setActiveIdx(nextIdx);
		setOpenTooltipIdx(nextIdx);
		cellRefs.current[nextIdx]?.focus();
	};

	if (values.length === 0) {
		return (
			<div
				ref={containerRef}
				tabIndex={-1}
				role="region"
				aria-label={ariaLabel}
				onFocus={() => {
					isFocusedInsideRef.current = true;
				}}
				onBlur={(e) => {
					if (!e.currentTarget.contains(e.relatedTarget)) {
						isFocusedInsideRef.current = false;
					}
				}}
				className={cn("grid grid-cols-7 gap-1 p-0.5 outline-none", className)}
			/>
		);
	}

	return (
		<TooltipProvider>
			<div
				ref={containerRef}
				tabIndex={-1}
				role="region"
				aria-label={ariaLabel}
				onFocus={() => {
					isFocusedInsideRef.current = true;
				}}
				onBlur={(e) => {
					if (!e.currentTarget.contains(e.relatedTarget)) {
						isFocusedInsideRef.current = false;
					}
				}}
				className={cn("grid grid-cols-7 gap-1 p-0.5 outline-none", className)}
			>
				{values.map((value, index) => {
					const isCurrent = index === activeIdx;
					const isOpen = openTooltipIdx === index;
					return (
						<Tooltip
							key={index}
							open={isOpen}
							onOpenChange={(next) => {
								if (next) {
									setOpenTooltipIdx(index);
								} else {
									setOpenTooltipIdx((curr) => {
										if (curr !== index) return curr;
										// If this cell currently holds document focus, ignore scroll dismiss
										const isCellFocused =
											cellRefs.current[index] !== null &&
											document.activeElement === cellRefs.current[index];
										return isCellFocused ? curr : null;
									});
								}
							}}
						>
							<TooltipTrigger asChild>
								<button
									ref={(el) => {
										cellRefs.current[index] = el;
									}}
									type="button"
									tabIndex={isCurrent ? 0 : -1}
									onFocus={() => {
										setActiveIdx(index);
										setOpenTooltipIdx(index);
									}}
									onBlur={() => {
										setOpenTooltipIdx((curr) => (curr === index ? null : curr));
									}}
									onKeyDown={(e) => handleKeyDown(e, index)}
									aria-label={`Position ${index + 1}: ${value}`}
									className="box-border m-0 h-3 w-3 cursor-pointer rounded-sm border-0 p-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-basalt-ring"
									style={{
										backgroundColor: `hsl(var(--basalt-primary) / ${0.2 + Math.min(4, Math.max(0, value)) * 0.15})`,
									}}
								/>
							</TooltipTrigger>
							<TooltipContent>
								<div className="text-xs">
									Position {index + 1}: {value}
								</div>
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>
		</TooltipProvider>
	);
}

interface YearDayCell {
	dateStr: string;
	value: number;
	weekIndex: number;
	dayIndex: number;
	colorIndex: number;
}

function YearHeatmap({
	data,
	year,
	colorScale,
	valueFormatter,
	metricLabel,
	cellSize,
	cellGap,
	locale,
	weekdayLabels,
	monthLabels,
	lessLabel,
	moreLabel,
	ariaLabel,
	className,
}: {
	data: HeatmapDataPoint[];
	year: number;
	colorScale: readonly string[];
	valueFormatter: (value: number, date: string) => string;
	metricLabel: string;
	cellSize: number;
	cellGap: number;
	locale: string;
	weekdayLabels?: string[];
	monthLabels?: string[];
	lessLabel: string;
	moreLabel: string;
	ariaLabel: string;
	className?: string;
}) {
	const weekdays = weekdayLabels ?? weekdayNames(locale);
	const months = monthLabels ?? monthNames(locale);
	const calendarId = useId();
	const scrollRegionRef = useRef<HTMLDivElement | null>(null);

	const { weeks, dataMap, maxValue, labels, validDays, dateToValidIndex } = useMemo(() => {
		const weeks = getYearWeeks(year);
		const dataMap = new Map<string, number>();
		let maxValue = 0;
		for (const point of data) {
			dataMap.set(point.date, point.value);
			if (point.value > maxValue) {
				maxValue = point.value;
			}
		}

		const labels: { month: string; weekIndex: number }[] = [];
		let lastMonth = -1;
		weeks.forEach((week, weekIndex) => {
			const firstDayOfWeek = week.find((date) => date.getFullYear() === year);
			if (firstDayOfWeek) {
				const month = firstDayOfWeek.getMonth();
				if (month !== lastMonth) {
					labels.push({ month: months[month], weekIndex });
					lastMonth = month;
				}
			}
		});

		const validDays: YearDayCell[] = [];
		const dateToValidIndex = new Map<string, number>();

		weeks.forEach((week, weekIndex) => {
			week.forEach((date, dayIndex) => {
				if (date.getFullYear() === year) {
					const dateStr = formatDate(date);
					const value = dataMap.get(dateStr) ?? 0;
					const colorIndex = getColorIndex(value, maxValue, colorScale);
					dateToValidIndex.set(dateStr, validDays.length);
					validDays.push({
						dateStr,
						value,
						weekIndex,
						dayIndex,
						colorIndex,
					});
				}
			});
		});

		return { weeks, dataMap, maxValue, labels, validDays, dateToValidIndex };
	}, [data, months, year, colorScale]);

	const [activeDate, setActiveDate] = useState<string>(() => {
		return validDays[0]?.dateStr ?? `${year}-01-01`;
	});
	const [openTooltipDate, setOpenTooltipDate] = useState<string | null>(null);

	const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
	const isYearFocusedInsideRef = useRef(false);

	// If year or validDays change: if a cell held focus, restore focus to the clamped
	// active date or scroll container; if focus was outside, do NOT steal focus.
	useEffect(() => {
		const hadFocus = isYearFocusedInsideRef.current;
		if (validDays.length === 0) {
			setActiveDate("");
			setOpenTooltipDate(null);
			if (hadFocus) {
				scrollRegionRef.current?.focus();
			}
		} else if (!dateToValidIndex.has(activeDate)) {
			const nextDate = validDays[0]?.dateStr ?? "";
			setActiveDate(nextDate);
			if (hadFocus) {
				cellRefs.current.get(nextDate)?.focus();
			}
		}
	}, [validDays, dateToValidIndex, activeDate]);

	const activeDay = useMemo(() => {
		const idx = dateToValidIndex.get(activeDate);
		return idx !== undefined ? validDays[idx] : validDays[0];
	}, [activeDate, dateToValidIndex, validDays]);

	const navigateToDay = (targetDay: YearDayCell | undefined) => {
		if (!targetDay) return;
		setActiveDate(targetDay.dateStr);
		setOpenTooltipDate(targetDay.dateStr);
		const btn = cellRefs.current.get(targetDay.dateStr);
		btn?.focus();
	};

	const handleCellKeyDown = (e: KeyboardEvent<HTMLButtonElement>, cell: YearDayCell) => {
		if (validDays.length === 0) return;

		const currentIdx = dateToValidIndex.get(cell.dateStr) ?? 0;

		if (e.key === "Escape") {
			setOpenTooltipDate(null);
			return;
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			// Visually next day (down in the column)
			const nextDay = validDays[currentIdx + 1];
			if (nextDay) {
				navigateToDay(nextDay);
			}
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			// Visually previous day (up in the column)
			const prevDay = validDays[currentIdx - 1];
			if (prevDay) {
				navigateToDay(prevDay);
			}
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			// Visually next week (right in the row: +7 days by index)
			const targetIdx = currentIdx + 7;
			if (targetIdx < validDays.length) {
				navigateToDay(validDays[targetIdx]);
			} else {
				navigateToDay(validDays[validDays.length - 1]);
			}
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			// Visually previous week (left in the row: -7 days by index)
			const targetIdx = currentIdx - 7;
			if (targetIdx >= 0) {
				navigateToDay(validDays[targetIdx]);
			} else {
				navigateToDay(validDays[0]);
			}
		} else if (e.key === "Home") {
			e.preventDefault();
			navigateToDay(validDays[0]);
		} else if (e.key === "End") {
			e.preventDefault();
			navigateToDay(validDays[validDays.length - 1]);
		}
	};

	const labelWidth = 30;

	return (
		<div
			ref={scrollRegionRef}
			tabIndex={-1}
			role="region"
			aria-label={`${ariaLabel} scrollable view`}
			onFocus={() => {
				isYearFocusedInsideRef.current = true;
			}}
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget)) {
					isYearFocusedInsideRef.current = false;
				}
			}}
			className={cn(
				"overflow-x-auto rounded-md outline-none focus-visible:ring-1 focus-visible:ring-basalt-ring",
				className,
			)}
		>
			<TooltipProvider>
				<div className="inline-block p-1" role="group" aria-label={ariaLabel}>
					<div
						className="relative mb-1 h-4 text-xs text-basalt-muted-foreground"
						style={{ marginLeft: labelWidth }}
					>
						{labels.map((label) => (
							<div
								key={`${label.month}-${label.weekIndex}`}
								className="absolute"
								style={{ left: label.weekIndex * (cellSize + cellGap) }}
							>
								{label.month}
							</div>
						))}
					</div>
					<div className="flex">
						<div
							className="mr-1 flex flex-col text-xs text-basalt-muted-foreground select-none"
							style={{ width: labelWidth }}
							aria-hidden="true"
						>
							{weekdays.map((day, index) => (
								<div
									key={`${day}-${index}`}
									style={{
										height: cellSize + cellGap,
										lineHeight: `${cellSize + cellGap}px`,
										visibility: index % 2 === 1 ? "visible" : "hidden",
									}}
								>
									{day}
								</div>
							))}
						</div>
						<div className="flex" style={{ gap: cellGap }}>
							{weeks.map((week, weekIndex) => (
								<div key={weekIndex} className="flex flex-col" style={{ gap: cellGap }}>
									{week.map((date, dayIndex) => {
										const dateStr = formatDate(date);
										const isCurrentYear = date.getFullYear() === year;
										if (!isCurrentYear) {
											return (
												<div
													key={dayIndex}
													style={{
														width: cellSize,
														height: cellSize,
														visibility: "hidden",
													}}
													aria-hidden="true"
												/>
											);
										}

										const value = dataMap.get(dateStr) ?? 0;
										const colorIndex = getColorIndex(value, maxValue, colorScale);
										const isSelected = activeDay?.dateStr === dateStr;
										const formattedValue = valueFormatter(value, dateStr);
										const labelText = `${dateStr}, ${metricLabel}: ${formattedValue}`;
										const isOpen = openTooltipDate === dateStr;
										const currentCell: YearDayCell = {
											dateStr,
											value,
											weekIndex,
											dayIndex,
											colorIndex,
										};

										return (
											<Tooltip
												key={dayIndex}
												open={isOpen}
												onOpenChange={(next) => {
													if (next) {
														setOpenTooltipDate(dateStr);
													} else {
														setOpenTooltipDate((curr) => {
															if (curr !== dateStr) return curr;
															// If this cell currently holds document focus, ignore scroll dismiss
															const isCellFocused =
																document.activeElement === cellRefs.current.get(dateStr);
															return isCellFocused ? curr : null;
														});
													}
												}}
											>
												<TooltipTrigger asChild>
													<button
														ref={(el) => {
															if (el) {
																cellRefs.current.set(dateStr, el);
															} else {
																cellRefs.current.delete(dateStr);
															}
														}}
														type="button"
														aria-label={labelText}
														tabIndex={isSelected ? 0 : -1}
														onFocus={() => {
															setActiveDate(dateStr);
															setOpenTooltipDate(dateStr);
														}}
														onBlur={() => {
															setOpenTooltipDate((curr) => (curr === dateStr ? null : curr));
														}}
														onKeyDown={(e) => handleCellKeyDown(e, currentCell)}
														className="box-border m-0 cursor-pointer rounded-sm border-0 p-0 transition-colors hover:ring-1 hover:ring-basalt-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-basalt-ring"
														style={{
															width: cellSize,
															height: cellSize,
															backgroundColor: colorScale[colorIndex],
														}}
													/>
												</TooltipTrigger>
												<TooltipContent id={`${calendarId}-${dateStr}`}>
													<div className="text-sm">
														<div className="font-medium">{dateStr}</div>
														<div className="text-basalt-muted-foreground">
															{metricLabel}: {formattedValue}
														</div>
													</div>
												</TooltipContent>
											</Tooltip>
										);
									})}
								</div>
							))}
						</div>
					</div>
					<div
						className="mt-2 flex items-center justify-end gap-1 text-xs text-basalt-muted-foreground select-none"
						aria-hidden="true"
					>
						<span>{lessLabel}</span>
						{colorScale.map((color) => (
							<div
								key={color}
								className="rounded-sm"
								style={{
									width: cellSize,
									height: cellSize,
									backgroundColor: color,
								}}
							/>
						))}
						<span>{moreLabel}</span>
					</div>
				</div>
			</TooltipProvider>
		</div>
	);
}
