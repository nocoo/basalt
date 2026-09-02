import { Bar, BarChart as RechartsBar, Tooltip, XAxis, YAxis } from "recharts";
import { ANIMATION_PROPS, cartesianAxisProps, chartTooltipProps, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import type { BulletPoint, ChartSeriesDescriptor } from "./series";

export type BulletChartProps = {
	data: BulletPoint[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	valueFormatter?: (value: number) => string;
};

export function BulletChart({
	data,
	series,
	ariaLabel = "Bullet chart",
	className,
	showAxes = true,
	valueFormatter,
}: BulletChartProps) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data} layout="vertical">
				<XAxis type="number" {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<YAxis type="category" dataKey="name" {...cartesianAxisProps(!showAxes)} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "bar" })} />
				<Bar
					dataKey="target"
					name={series?.[1]?.label ?? "target"}
					fill={seriesColor(series?.[1], 6)}
					barSize={10}
					{...ANIMATION_PROPS}
				/>
				<Bar
					dataKey="value"
					name={series?.[0]?.label ?? "value"}
					fill={seriesColor(series?.[0], 1)}
					barSize={6}
					{...ANIMATION_PROPS}
				/>
			</RechartsBar>
		</ChartFrame>
	);
}
