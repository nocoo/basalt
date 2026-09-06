import { heatmapColorScales } from "@nocoo/basalt/charts/heatmap-calendar";
import { HeatmapMatrix } from "@nocoo/basalt/charts/heatmap-matrix";
import {
	ChartTooltipDivider,
	ChartTooltipRow,
	ChartTooltipSummary,
} from "@nocoo/basalt/charts/tooltip";
import { Button } from "@nocoo/basalt/components/button";
import { useState } from "react";

const REGIONS = ["US-East", "US-West", "EU-Central", "APAC-South", "SA-East"] as const;
const METRICS = [
	"API Gateway",
	"Auth Token",
	"Service DB",
	"Cache Cluster",
	"Search Index",
	"Queue Service",
] as const;

// Realistic service latency matrix (ms). 0 indicates local co-located ping; null indicates disconnected node
const SERVICE_MATRIX: (number | null)[][] = [
	[12, 45, 18, 0, 32, 24],
	[48, 14, 52, 28, 65, 30],
	[85, 92, 16, 74, 22, 18],
	[130, 145, 120, 110, 95, null],
	[160, 175, 150, 140, 135, 128],
];

export default function HeatmapMatrixServiceGrid() {
	const [activeScale, setActiveScale] = useState<"green" | "blue" | "red">("blue");
	const [showExtreme, setShowExtreme] = useState<boolean>(true);

	const displayedValues = showExtreme
		? SERVICE_MATRIX
		: SERVICE_MATRIX.map((row) => row.slice(0, 4));
	const displayedCols = showExtreme ? METRICS : METRICS.slice(0, 4);

	return (
		<div className="w-full space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-2 text-xs">
				<div className="flex flex-wrap items-center gap-1.5">
					<span className="font-medium text-basalt-foreground">Palette:</span>
					{(["blue", "green", "red"] as const).map((scale) => (
						<Button
							key={scale}
							size="sm"
							variant={activeScale === scale ? "default" : "outline"}
							onClick={() => setActiveScale(scale)}
						>
							{scale.charAt(0).toUpperCase() + scale.slice(1)}
						</Button>
					))}
				</div>
				<Button size="sm" variant="outline" onClick={() => setShowExtreme((prev) => !prev)}>
					{showExtreme ? "Hide Peripheral Services" : "Show All Services"}
				</Button>
			</div>

			<HeatmapMatrix
				rowLabels={REGIONS}
				columnLabels={displayedCols}
				values={displayedValues}
				domain={[0, 180]}
				colorScale={heatmapColorScales[activeScale]}
				metricLabel="Cross-Region Latency"
				ariaLabel="Inter-region service latency matrix"
				cellSize={24}
				columnWidth={82}
				cellGap={3}
				valueFormatter={(v) => `${v}ms`}
				renderTooltip={(cell) => (
					<div data-testid="chart-custom-tooltip" className="p-1">
						<div className="font-semibold text-basalt-popover-foreground mb-1">
							{cell.rowLabel} ➔ {cell.columnLabel}
						</div>
						<ChartTooltipRow
							label="Latency"
							value={cell.value}
							unit="ms"
							color={cell.isMissing ? undefined : heatmapColorScales[activeScale][3]}
						/>
						<ChartTooltipDivider />
						<ChartTooltipSummary
							label="SLA Tolerance"
							value={cell.isMissing ? "Exempt" : Number(cell.value) > 100 ? "Warning" : "Optimal"}
						/>
					</div>
				)}
			/>
		</div>
	);
}
