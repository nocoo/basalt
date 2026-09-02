import { LineChart } from "./line";
import type { XYPoint, XYSeriesDescriptor } from "./series";

export type ChartsProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
};

export function Charts({ data, series, ariaLabel = "Charts", className }: ChartsProps) {
	return <LineChart data={data} series={series} ariaLabel={ariaLabel} className={className} />;
}
