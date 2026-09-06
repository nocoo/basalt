import type { ReactNode } from "react";
import { LineChart } from "./line";
import type { XYPoint, XYSeriesDescriptor } from "./series";

export type TimeseriesProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	/**
	 * Textual summary describing key insights, highs, lows, and keyboard exploration instructions.
	 * Associated with the chart via useId and aria-describedby.
	 */
	summary?: ReactNode;
	/**
	 * Accessible tabular or structured data alternative rendered outside the plot area.
	 */
	dataAlternative?: ReactNode;
	/**
	 * Whether the interactive accessibility layer is enabled on the underlying Recharts graphic.
	 * Enables keyboard exploration with Tab and arrow keys where supported by the underlying chart type.
	 * Non-interactive compact or decorative charts without tooltip navigation should provide summary or dataAlternative.
	 * @default true
	 */
	accessibilityLayer?: boolean;
};

export function Timeseries({
	data,
	series,
	ariaLabel = "Timeseries",
	className,
	summary,
	dataAlternative,
	accessibilityLayer,
}: TimeseriesProps) {
	return (
		<LineChart
			data={data}
			series={series}
			ariaLabel={ariaLabel}
			className={className}
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		/>
	);
}
