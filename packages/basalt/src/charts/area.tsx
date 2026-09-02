import { Area, CartesianGrid, AreaChart as RechartsArea, Tooltip, XAxis, YAxis } from "recharts";
import {
	ANIMATION_PROPS,
	CHART_PLOT_MARGIN,
	CHART_PLOT_MARGIN_BARE,
	CHART_TYPE,
	cartesianAxisProps,
	chartTooltipProps,
	GRID_PROPS,
	seriesColor,
} from "./config";
import { ChartShell } from "./frame";
import { ChartLegend } from "./legend";
import {
	resolveChartSeries,
	type XYPoint,
	type XYSeriesDescriptor,
	xyFallbackKeys,
} from "./series";

export type AreaChartProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	showLegend?: boolean;
	stacked?: boolean;
	valueFormatter?: (value: number) => string;
};

export function AreaChart({
	data,
	series,
	ariaLabel = "Area chart",
	className,
	showAxes = false,
	showLegend = false,
	stacked = false,
	valueFormatter,
}: AreaChartProps) {
	const areas = resolveChartSeries(series, xyFallbackKeys(data));
	const stackId = stacked ? "stack" : undefined;
	return (
		<ChartShell
			ariaLabel={ariaLabel}
			className={className}
			legend={showLegend ? <ChartLegend items={areas} shape="area" /> : undefined}
		>
			<RechartsArea data={data} margin={showAxes ? CHART_PLOT_MARGIN : CHART_PLOT_MARGIN_BARE}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "line" })} />
				{areas.map((item, index) => {
					const fill = seriesColor(item, index);
					return (
						<Area
							key={item.key}
							dataKey={item.key}
							name={item.label ?? item.key}
							stackId={stackId}
							stroke={fill}
							fill={fill}
							fillOpacity={CHART_TYPE.areaFillAlpha}
							{...ANIMATION_PROPS}
						/>
					);
				})}
			</RechartsArea>
		</ChartShell>
	);
}
