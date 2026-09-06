import { HeatmapCalendar, heatmapColorScales } from "@nocoo/basalt/charts/heatmap-calendar";
import { Button } from "@nocoo/basalt/components/button";
import { useState } from "react";

function isLeapYear(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function generateYearData(year: number) {
	const totalDays = isLeapYear(year) ? 366 : 365;
	return Array.from({ length: totalDays }, (_, day) => {
		const date = new Date(year, 0, 1 + day);
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const dateNum = String(date.getDate()).padStart(2, "0");
		const weekend = date.getDay() === 0 || date.getDay() === 6;
		const wave = 10 + 8 * Math.sin(day / 20);
		const commits = weekend ? 0 : Math.max(1, Math.round(wave + (day % 7)));
		return { date: `${year}-${month}-${dateNum}`, value: commits };
	});
}

export default function HeatmapCalendarAccessibleYear() {
	const [year, setYear] = useState(2026);
	const data = generateYearData(year);

	return (
		<div className="w-full max-w-4xl space-y-3">
			<div className="flex flex-wrap items-center gap-3">
				<span className="text-xs font-medium text-basalt-muted-foreground">Select Year:</span>
				<Button
					size="sm"
					variant={year === 2024 ? "default" : "outline"}
					onClick={() => setYear(2024)}
				>
					2024 (Leap)
				</Button>
				<Button
					size="sm"
					variant={year === 2025 ? "default" : "outline"}
					onClick={() => setYear(2025)}
				>
					2025
				</Button>
				<Button
					size="sm"
					variant={year === 2026 ? "default" : "outline"}
					onClick={() => setYear(2026)}
				>
					2026
				</Button>
			</div>

			<p className="text-xs text-basalt-muted-foreground">
				Keyboard navigation: Press <kbd className="rounded border px-1">Tab</kbd> to enter the
				calendar. Use <kbd className="rounded border px-1">↑</kbd>/
				<kbd className="rounded border px-1">↓</kbd> to navigate days (±1 day vertically), and{" "}
				<kbd className="rounded border px-1">←</kbd>/<kbd className="rounded border px-1">→</kbd> to
				navigate weeks (±7 days horizontally). <kbd className="rounded border px-1">Home</kbd>/
				<kbd className="rounded border px-1">End</kbd> jump to the first/last day of the year.{" "}
				<kbd className="rounded border px-1">Escape</kbd> dismisses the tooltip. Press{" "}
				<kbd className="rounded border px-1">Tab</kbd> once to exit the entire calendar.
			</p>

			<HeatmapCalendar
				data={data}
				year={year}
				colorScale={heatmapColorScales.blue}
				metricLabel="Commits"
				ariaLabel={`${year} Annual repository commit activity`}
				valueFormatter={(value) => `${value} commits`}
			/>
		</div>
	);
}
