import { LineChart } from "./line";
import type { XYPoint, XYSeriesDescriptor } from "./series";

export type CustomChartProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
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
