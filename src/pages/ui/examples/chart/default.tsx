import {
	ChartFrame,
	ChartLegend,
	cartesianAxisProps,
	chartTooltipProps,
} from "@nocoo/basalt/components/chart";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
	{ month: "Jan", value: 12 },
	{ month: "Feb", value: 18 },
	{ month: "Mar", value: 15 },
];
const series = [{ key: "value", label: "Requests", color: "hsl(var(--basalt-chart-1))" }];

export default function ChartDefault() {
	return (
		<ChartFrame
			ariaLabel="Requests by month"
			size="h-basalt-56 w-full"
			summary="Requests rose from 12 in January to 15 in March."
			legend={<ChartLegend items={series} shape="bar" />}
		>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data}>
					<XAxis dataKey="month" {...cartesianAxisProps()} />
					<YAxis {...cartesianAxisProps()} />
					<Tooltip {...chartTooltipProps()} />
					<Bar dataKey="value" fill={series[0].color} />
				</BarChart>
			</ResponsiveContainer>
		</ChartFrame>
	);
}
