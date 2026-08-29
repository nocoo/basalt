import { LineChart } from "@nocoo/basalt/charts/line";
import { cn } from "@/lib/utils";

export interface LineChartDataPoint {
	label: string;
	value: number;
}

export interface LineChartProps {
	data: LineChartDataPoint[];
	height?: number;
	color?: string;
	valueFormatter?: (value: number) => string;
	className?: string;
}

export function LineChartWidget({
	data,
	height = 200,
	color,
	valueFormatter,
	className,
}: LineChartProps) {
	const points = data.map((point) => ({
		x: point.label,
		y: point.value,
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
