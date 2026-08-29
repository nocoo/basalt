import { BarChart } from "@nocoo/basalt/charts/bar";
import { cn } from "@/lib/utils";

export interface BarChartDataPoint {
	label: string;
	value: number;
}

export interface BarChartWidgetProps {
	data: BarChartDataPoint[];
	height?: number;
	color?: string;
	valueFormatter?: (value: number) => string;
	className?: string;
}

export function BarChartWidget({
	data,
	height = 200,
	color,
	valueFormatter,
	className,
}: BarChartWidgetProps) {
	return (
		<div className={cn("w-full", className)} style={{ height }}>
			<BarChart
				data={data.map((point) => ({ x: point.label, y: point.value }))}
				ariaLabel="Bar chart"
				showAxes
				color={color}
				valueFormatter={valueFormatter}
				className="h-full w-full"
			/>
		</div>
	);
}
