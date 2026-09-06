import { HeatmapMatrix } from "@nocoo/basalt/charts/heatmap-matrix";
import {
	ChartTooltipDivider,
	ChartTooltipRow,
	ChartTooltipSummary,
} from "@nocoo/basalt/charts/tooltip";
import { Button } from "@nocoo/basalt/components/button";
import { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

// 7 rows x 24 cols realistic response-time / throughput activity matrix
const INITIAL_VALUES: (number | null)[][] = [
	// Mon
	[
		12, 10, 8, 9, 15, 28, 45, 82, 110, 125, 130, 118, 95, 105, 115, 128, 140, 135, 98, 75, 52, 38,
		25, 16,
	],
	// Tue
	[
		14, 11, 7, 8, 18, 32, 50, 95, 130, 145, 150, 140, 110, 120, 135, 155, 165, 150, 112, 85, 60, 42,
		28, 18,
	],
	// Wed
	[
		15,
		12,
		9,
		10,
		20,
		35,
		55,
		102,
		138,
		152,
		160,
		148,
		null,
		125,
		142,
		160,
		172,
		158,
		118,
		90,
		65,
		45,
		30,
		20,
	],
	// Thu
	[
		16, 13, 8, 9, 19, 34, 52, 98, 132, 148, 155, 142, 115, 122, 138, 158, 168, 152, 115, 88, 62, 44,
		29, 19,
	],
	// Fri
	[
		18, 14, 10, 11, 22, 38, 58, 108, 142, 158, 165, 150, 120, 130, 145, 162, 170, 145, 105, 78, 55,
		40, 32, 22,
	],
	// Sat
	[20, 15, 12, 10, 14, 18, 25, 42, 60, 75, 85, 80, 70, 72, 78, 82, 85, 78, 65, 52, 45, 38, 30, 24],
	// Sun (includes planned maintenance window with nulls)
	[
		18,
		14,
		11,
		9,
		12,
		15,
		22,
		35,
		50,
		62,
		70,
		68,
		null,
		null,
		65,
		72,
		75,
		68,
		58,
		48,
		40,
		35,
		28,
		22,
	],
];

export default function HeatmapMatrixHourSchedule() {
	const [activeDays, setActiveDays] = useState<number>(7);

	const visibleRows = DAYS.slice(0, activeDays);
	const visibleValues = INITIAL_VALUES.slice(0, activeDays);

	return (
		<div className="w-full space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-2 text-xs">
				<div className="flex flex-wrap items-center gap-1.5">
					<span className="font-medium text-basalt-foreground">Scope:</span>
					<Button
						size="sm"
						variant={activeDays === 7 ? "default" : "outline"}
						onClick={() => setActiveDays(7)}
					>
						Full Week (7d)
					</Button>
					<Button
						size="sm"
						variant={activeDays === 5 ? "default" : "outline"}
						onClick={() => setActiveDays(5)}
					>
						Workdays Only (5d)
					</Button>
				</div>
				<span className="text-basalt-muted-foreground">
					24-hour horizontal scrolling view with keyboard navigation
				</span>
			</div>

			<HeatmapMatrix
				rowLabels={visibleRows}
				columnLabels={HOURS}
				values={visibleValues}
				metricLabel="Origin Throughput"
				ariaLabel="Weekly hourly traffic density"
				cellSize={18}
				columnWidth={38}
				cellGap={3}
				valueFormatter={(v) => `${v} req/s`}
				renderTooltip={(cell) => (
					<div data-testid="chart-custom-tooltip" className="p-1">
						<div className="font-semibold text-basalt-popover-foreground mb-1">
							{cell.rowLabel} at {cell.columnLabel}
						</div>
						<ChartTooltipRow
							label="Throughput"
							value={cell.value}
							unit="req/s"
							color={cell.isMissing ? undefined : "hsl(var(--basalt-chart-1))"}
						/>
						<ChartTooltipDivider />
						<ChartTooltipSummary
							label="Status"
							value={cell.isMissing ? "Maintenance window" : "Operational"}
						/>
					</div>
				)}
			/>
		</div>
	);
}
