import { DonutChart } from "@nocoo/basalt/charts/donut";
import { cn } from "@/lib/utils";

export interface PieChartDataPoint {
	label: string;
	value: number;
	color?: string;
}

export interface PieChartWidgetProps {
	data: PieChartDataPoint[];
	height?: number;
	innerRadius?: number;
	outerRadius?: number;
	showLegend?: boolean;
	showLabels?: boolean;
	valueFormatter?: (value: number) => string;
	className?: string;
}

export function PieChartWidget({ data, height = 200, className }: PieChartWidgetProps) {
	return (
		<div className={cn("w-full", className)} style={{ height }}>
			<DonutChart
				data={data.map((point) => ({ name: point.label, value: point.value }))}
				ariaLabel="Donut chart"
				className="h-full w-full"
			/>
		</div>
	);
}

export function DonutChartWidget(props: PieChartWidgetProps) {
	return <PieChartWidget {...props} />;
}
