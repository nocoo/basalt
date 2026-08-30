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

export function BarChart({
	data = SAMPLE,
	ariaLabel = "Bar chart",
	className,
	showAxes = false,
	color,
	valueFormatter,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	color?: string;
	valueFormatter?: (value: number) => string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "bar" })} />
				<Bar
					dataKey="y"
					fill={color ?? CHART_COLORS[0]}
					radius={BAR_RADIUS.vertical}
					{...ANIMATION_PROPS}
				/>
			</RechartsBar>
		</ChartFrame>
	);
}
