import { LineChart } from "./line";
import type { ChartSeriesDescriptor, XYPoint } from "./series";

export type TimeseriesProps = {
	data: XYPoint[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
};

export function Timeseries({ data, series, ariaLabel = "Timeseries", className }: TimeseriesProps) {
	return <LineChart data={data} series={series} ariaLabel={ariaLabel} className={className} />;
}
