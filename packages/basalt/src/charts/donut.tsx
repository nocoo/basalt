import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { ANIMATION_PROPS, chartLegendProps, chartTooltipProps } from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { DONUT_SAMPLE, type NamedValue } from "./sample";

export function DonutChart({
	data = DONUT_SAMPLE,
	ariaLabel = "Donut chart",
	className,
	showLegend = false,
	valueFormatter,
}: {
	data?: NamedValue[];
	ariaLabel?: string;
	className?: string;
	showLegend?: boolean;
	valueFormatter?: (value: number) => string;
}) {
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
						<Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
					))}
				</Pie>
				{showLegend ? <Legend {...chartLegendProps()} /> : null}
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: false })} />
			</PieChart>
		</ChartFrame>
	);
}
