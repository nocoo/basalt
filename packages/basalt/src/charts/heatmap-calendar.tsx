import { useMemo } from "react";
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

type HeatmapCalendarShared = {
	colorScale?: readonly string[];
	valueFormatter?: (value: number, date: string) => string;
	metricLabel?: string;
	cellSize?: number;
	cellGap?: number;
	locale?: string;
	weekdayLabels?: string[];
	monthLabels?: string[];
	lessLabel?: string;
	moreLabel?: string;
	ariaLabel?: string;
	className?: string;
};

export type HeatmapCalendarValuesProps = HeatmapCalendarShared & { values: number[] };
export type HeatmapCalendarYearProps = HeatmapCalendarShared & {
	data: HeatmapDataPoint[];
	year: number;
};
export type HeatmapCalendarProps = HeatmapCalendarValuesProps | HeatmapCalendarYearProps;

export function HeatmapCalendar(props: HeatmapCalendarProps) {
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
	if ("data" in props) {
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
	return (
		<div className={cn("grid grid-cols-7 gap-1", className)} role="img" aria-label={ariaLabel}>
			{props.values.map((value, index) => (
				<span
					key={index}
					className="h-3 w-3 rounded-sm bg-basalt-primary"
					style={{ opacity: 0.2 + Math.min(4, Math.max(0, value)) * 0.15 }}
				/>
			))}
		</div>
	);
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
	const { weeks, dataMap, maxValue, labels } = useMemo(() => {
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
		return { weeks, dataMap, maxValue, labels };
	}, [data, months, year]);
	const labelWidth = 30;
	return (
		<div className={cn("overflow-x-auto", className)} role="img" aria-label={ariaLabel}>
			<TooltipProvider>
				<div className="inline-block">
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
							className="mr-1 flex flex-col text-xs text-basalt-muted-foreground"
							style={{ width: labelWidth }}
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
										const value = dataMap.get(dateStr) ?? 0;
										const isCurrentYear = date.getFullYear() === year;
										const colorIndex = getColorIndex(value, maxValue, colorScale);
										if (!isCurrentYear) {
											return (
												<div
													key={dayIndex}
													style={{
														width: cellSize,
														height: cellSize,
														visibility: "hidden",
													}}
												/>
											);
										}
										return (
											<Tooltip key={dayIndex}>
												<TooltipTrigger asChild>
													<div
														className="cursor-pointer rounded-sm transition-colors hover:ring-1 hover:ring-basalt-foreground"
														style={{
															width: cellSize,
															height: cellSize,
															backgroundColor: colorScale[colorIndex],
														}}
													/>
												</TooltipTrigger>
												<TooltipContent>
													<div className="text-sm">
														<div className="font-medium">{dateStr}</div>
														<div className="text-basalt-muted-foreground">
															{metricLabel}: {valueFormatter(value, dateStr)}
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
					<div className="mt-2 flex items-center justify-end gap-1 text-xs text-basalt-muted-foreground">
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
