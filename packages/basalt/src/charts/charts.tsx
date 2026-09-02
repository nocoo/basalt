import { LineChart } from "./line";
import type { ChartSeriesDescriptor, XYPoint } from "./series";

export type ChartsProps = {
	data: XYPoint[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
};

export function Charts({ data, series, ariaLabel = "Charts", className }: ChartsProps) {
	return <LineChart data={data} series={series} ariaLabel={ariaLabel} className={className} />;
}
