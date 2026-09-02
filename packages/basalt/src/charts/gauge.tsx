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
};

export function Gauge({
	value,
	max = 100,
	series,
	ariaLabel = "Gauge",
	className,
	hideValue = false,
	valueFormatter,
}: GaugeProps) {
	const percent = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
	const display = valueFormatter ? valueFormatter(value) : String(value);
	return (
		<div className={cn("relative h-36 w-36", className)}>
			<ChartFrame ariaLabel={ariaLabel} className="h-full w-full" size="h-full w-full">
				<RadialBarChart
					cx="50%"
					cy="50%"
					innerRadius="75%"
					outerRadius="95%"
					startAngle={90}
					endAngle={-270}
					data={[{ value: percent }]}
					barSize={12}
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
}
