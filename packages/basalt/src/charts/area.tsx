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
import { ChartFrame } from "./frame";
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
	stacked?: boolean;
};

export function AreaChart({
	data,
	series,
	ariaLabel = "Area chart",
	className,
	showAxes = false,
	stacked = false,
}: AreaChartProps) {
	const areas = resolveChartSeries(series, xyFallbackKeys(data));
	const stackId = stacked ? "stack" : undefined;
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsArea data={data} margin={showAxes ? CHART_PLOT_MARGIN : CHART_PLOT_MARGIN_BARE}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} />
				<Tooltip {...chartTooltipProps({ cursor: "line" })} />
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
		</ChartFrame>
	);
}
