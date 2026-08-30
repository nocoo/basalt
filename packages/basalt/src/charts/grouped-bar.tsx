import { Bar, CartesianGrid, BarChart as RechartsBar, Tooltip, XAxis, YAxis } from "recharts";
import {
	ANIMATION_PROPS,
	BAR_RADIUS,
	cartesianAxisProps,
	chartTooltipProps,
	GRID_PROPS,
} from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function GroupedBarChart({
	data = SAMPLE,
	ariaLabel = "Grouped bar chart",
	className,
	showAxes = false,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} />
				<Tooltip {...chartTooltipProps({ cursor: "bar" })} />
				<Bar dataKey="y" fill={CHART_COLORS[0]} radius={BAR_RADIUS.vertical} {...ANIMATION_PROPS} />
				<Bar
					dataKey="y2"
					fill={CHART_COLORS[2]}
					radius={BAR_RADIUS.vertical}
					{...ANIMATION_PROPS}
				/>
			</RechartsBar>
		</ChartFrame>
	);
}
