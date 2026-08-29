import { LineChart } from "@nocoo/basalt/charts/line";
import { cn } from "@/lib/utils";

export interface LineChartDataPoint {
	label: string;
	value: number;
}

export interface LineChartSeries {
	data: LineChartDataPoint[];
	color?: string;
	name?: string;
}

export interface LineChartProps {
	data?: LineChartDataPoint[];
	series?: LineChartSeries[];
	height?: number;
	color?: string;
	valueFormatter?: (value: number) => string;
	className?: string;
}

export function LineChartWidget({
	data,
	series,
	height = 200,
	color,
	valueFormatter,
	className,
}: LineChartProps) {
	const primary = series?.[0]?.data ?? data ?? [];
	const secondary = series?.[1]?.data;
	const tertiary = series?.[2]?.data;
	const points = primary.map((point, index) => ({
		x: point.label,
		y: point.value,
		y2: secondary?.[index]?.value,
		y3: tertiary?.[index]?.value,
	}));
	if (points.length === 0) {
		return null;
	}
	return (
		<div className={cn("w-full", className)} style={{ height }}>
			<LineChart
				data={points}
				ariaLabel="Line chart"
				showAxes
				color={color}
				valueFormatter={valueFormatter}
				className="h-full w-full"
			/>
		</div>
	);
}
