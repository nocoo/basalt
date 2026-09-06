import type { ReactNode } from "react";
import { useId } from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { cn } from "../utils/cn";
import { seriesColor } from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import type { ChartSeriesDescriptor } from "./series";

export type GaugeProps = {
	value: number;
	max?: number;
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	hideValue?: boolean;
	valueFormatter?: (value: number) => string;
	/**
	 * Textual summary describing key insights, highs, lows, and keyboard exploration instructions.
	 * Associated with the chart via useId and aria-describedby.
	 */
	summary?: ReactNode;
	/**
	 * Accessible tabular or structured data alternative rendered outside the plot area.
	 */
	dataAlternative?: ReactNode;
	/**
	 * Whether the interactive accessibility layer is enabled on the underlying Recharts graphic.
	 * Enables keyboard exploration with Tab and arrow keys where supported by the underlying chart type.
	 * Non-interactive compact or decorative charts without tooltip navigation should provide summary or dataAlternative.
	 * @default true
	 */
	accessibilityLayer?: boolean;
};

export function Gauge({
	value,
	max = 100,
	series,
	ariaLabel = "Gauge",
	className,
	hideValue = false,
	valueFormatter,
	summary,
	dataAlternative,
	accessibilityLayer,
}: GaugeProps) {
	const summaryId = useId();
	const percent = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
	const display = valueFormatter ? valueFormatter(value) : String(value);
	const hasSummary = summary !== undefined && summary !== null && summary !== false;
	const hasAlternative =
		dataAlternative !== undefined && dataAlternative !== null && dataAlternative !== false;

	const plot = (
		<div className={cn("relative h-36 w-36", className)}>
			<ChartFrame
				ariaLabel={ariaLabel}
				className="h-full w-full"
				size="h-full w-full"
				accessibilityLayer={accessibilityLayer}
			>
				<RadialBarChart
					cx="50%"
					cy="50%"
					innerRadius="75%"
					outerRadius="95%"
					startAngle={90}
					endAngle={-270}
					data={[{ value: percent }]}
					barSize={12}
					{...(hasSummary ? { "aria-describedby": summaryId } : {})}
				>
					<PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
					<RadialBar
						dataKey="value"
						cornerRadius={6}
						fill={seriesColor(series?.[0], 4)}
						background={{ fill: CHART_COLORS[23] }}
					/>
				</RadialBarChart>
			</ChartFrame>
			{hideValue ? null : (
				<span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold text-basalt-foreground">
					{display}
				</span>
			)}
		</div>
	);

	if (!hasSummary && !hasAlternative) {
		return plot;
	}

	return (
		<div className="flex flex-col gap-2 min-h-0 min-w-0">
			{hasSummary ? (
				<div id={summaryId} className="text-xs text-basalt-muted-foreground">
					{summary}
				</div>
			) : null}
			{plot}
			{hasAlternative ? (
				<div className="text-xs text-basalt-muted-foreground">{dataAlternative}</div>
			) : null}
		</div>
	);
}
