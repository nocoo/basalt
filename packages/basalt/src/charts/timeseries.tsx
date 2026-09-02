import { LineChart } from "./line";
import type { XYPoint, XYSeriesDescriptor } from "./series";

export type TimeseriesProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
};

export function Timeseries({ data, series, ariaLabel = "Timeseries", className }: TimeseriesProps) {
	return <LineChart data={data} series={series} ariaLabel={ariaLabel} className={className} />;
}
