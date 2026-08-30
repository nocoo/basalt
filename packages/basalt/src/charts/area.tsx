import { Area, CartesianGrid, AreaChart as RechartsArea, Tooltip, XAxis, YAxis } from "recharts";
import {
	ANIMATION_PROPS,
	CHART_TYPE,
	cartesianAxisProps,
	chartTooltipProps,
	GRID_PROPS,
} from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function AreaChart({
	data = SAMPLE,
	ariaLabel = "Area chart",
	className,
	showAxes = false,
	stacked = false,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	stacked?: boolean;
}) {
	const dual = data.some((point) => point.y2 != null);
	const triple = data.some((point) => point.y3 != null);
	const stackId = stacked ? "stack" : undefined;
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsArea data={data}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} />
				<Tooltip {...chartTooltipProps({ cursor: "line" })} />
				<Area
					dataKey="y"
					stackId={stackId}
					stroke={CHART_COLORS[0]}
					fill={CHART_COLORS[0]}
					fillOpacity={CHART_TYPE.areaFillAlpha}
					{...ANIMATION_PROPS}
				/>
				{dual ? (
					<Area
						dataKey="y2"
						stackId={stackId}
						stroke={CHART_COLORS[2]}
						fill={CHART_COLORS[2]}
						fillOpacity={CHART_TYPE.areaFillAlpha}
						{...ANIMATION_PROPS}
					/>
				) : null}
				{triple ? (
					<Area
						dataKey="y3"
						stackId={stackId}
						stroke={CHART_COLORS[4]}
						fill={CHART_COLORS[4]}
						fillOpacity={CHART_TYPE.areaFillAlpha}
						{...ANIMATION_PROPS}
					/>
				) : null}
			</RechartsArea>
		</ChartFrame>
	);
}
