import { Bar, CartesianGrid, BarChart as RechartsBar, Tooltip, XAxis, YAxis } from "recharts";
import {
	ANIMATION_PROPS,
	BAR_RADIUS,
	CHART_PLOT_MARGIN,
	CHART_PLOT_MARGIN_BARE,
	cartesianAxisProps,
	chartTooltipProps,
	GRID_PROPS,
	seriesColor,
} from "./config";
import { ChartShell } from "./frame";
import { ChartLegend } from "./legend";
import { resolveChartSeries, type XYPoint, type XYSeriesDescriptor } from "./series";

export type BarChartProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	showLegend?: boolean;
	color?: string;
	valueFormatter?: (value: number) => string;
};

export function BarChart({
	data,
	series,
	ariaLabel = "Bar chart",
	className,
	showAxes = false,
	showLegend = false,
	color,
	valueFormatter,
}: BarChartProps) {
	const bars = resolveChartSeries(series, ["y"]);
	return (
		<ChartShell
			ariaLabel={ariaLabel}
			className={className}
			legend={showLegend ? <ChartLegend items={bars} shape="bar" /> : undefined}
		>
			<RechartsBar data={data} margin={showAxes ? CHART_PLOT_MARGIN : CHART_PLOT_MARGIN_BARE}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "bar" })} />
				{bars.map((item, index) => (
					<Bar
						key={item.key}
						dataKey={item.key}
						name={item.label ?? item.key}
						fill={index === 0 && color ? color : seriesColor(item, index)}
						radius={BAR_RADIUS.vertical}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsBar>
		</ChartShell>
	);
}
