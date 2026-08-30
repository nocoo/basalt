import { CartesianGrid, Line, LineChart as RechartsLine, Tooltip, XAxis, YAxis } from "recharts";
import { ANIMATION_PROPS, cartesianAxisProps, chartTooltipProps, GRID_PROPS } from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function LineChart({
	data = SAMPLE,
	ariaLabel = "Line chart",
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
	const dual = data.some((point) => point.y2 != null);
	const triple = data.some((point) => point.y3 != null);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsLine data={data}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "line" })} />
				<Line
					type="monotone"
					dataKey="y"
					stroke={color ?? CHART_COLORS[0]}
					dot={false}
					{...ANIMATION_PROPS}
				/>
				{dual ? (
					<Line
						type="monotone"
						dataKey="y2"
						stroke={CHART_COLORS[2]}
						dot={false}
						{...ANIMATION_PROPS}
					/>
				) : null}
				{triple ? (
					<Line
						type="monotone"
						dataKey="y3"
						stroke={CHART_COLORS[4]}
						dot={false}
						{...ANIMATION_PROPS}
					/>
				) : null}
			</RechartsLine>
		</ChartFrame>
	);
}
