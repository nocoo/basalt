import { LineChart } from "./line";
import type { ChartSeriesDescriptor, XYPoint } from "./series";

export type CustomChartProps = {
	data: XYPoint[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
};

export function CustomChart({
	data,
	series,
	ariaLabel = "Custom chart",
	className,
}: CustomChartProps) {
	return <LineChart data={data} series={series} ariaLabel={ariaLabel} className={className} />;
}
