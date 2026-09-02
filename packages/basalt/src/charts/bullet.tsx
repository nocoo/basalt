import { Bar, BarChart as RechartsBar, Tooltip, XAxis, YAxis } from "recharts";
import { ANIMATION_PROPS, cartesianAxisProps, chartTooltipProps, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import { type BulletPoint, type ChartSeriesDescriptor, resolveChartSeries } from "./series";

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
	const bars = resolveChartSeries(series, ["target", "value"]);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data} layout="vertical">
				<XAxis type="number" {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<YAxis type="category" dataKey="name" {...cartesianAxisProps(!showAxes)} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "bar" })} />
				{bars.map((item, index) => (
					<Bar
						key={item.key}
						dataKey={item.key}
						name={item.label ?? item.key}
						fill={seriesColor(item, item.key === "target" ? 6 : index === 0 ? 6 : 1)}
						barSize={item.key === "target" ? 10 : 6}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsBar>
		</ChartFrame>
	);
}
