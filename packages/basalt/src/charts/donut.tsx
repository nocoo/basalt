import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { ANIMATION_PROPS, chartLegendProps, chartTooltipProps, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import type { ChartSeriesDescriptor, NamedValue } from "./series";

export type DonutChartProps = {
	data: NamedValue[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showLegend?: boolean;
	valueFormatter?: (value: number) => string;
};

export function DonutChart({
	data,
	series,
	ariaLabel = "Donut chart",
	className,
	showLegend = false,
	valueFormatter,
}: DonutChartProps) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className} size="h-36 w-36">
			<PieChart>
				<Pie
					data={data}
					dataKey="value"
					nameKey="name"
					innerRadius={24}
					outerRadius={48}
					stroke="none"
					{...ANIMATION_PROPS}
				>
					{data.map((entry, index) => (
						<Cell key={`${entry.name}-${index}`} fill={seriesColor(series?.[index], index)} />
					))}
				</Pie>
				{showLegend ? <Legend {...chartLegendProps()} /> : null}
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: false })} />
			</PieChart>
		</ChartFrame>
	);
}
