import { LineChart } from "@nocoo/basalt/charts/line";
import { cn } from "@/lib/utils";

export interface LineChartDataPoint {
	label: string;
	value: number;
}

export interface LineChartSeries {
	data: LineChartDataPoint[];
	color?: string;
	name?: string;
}

export interface LineChartProps {
	/** Single series data (use this or series, not both) */
	data?: LineChartDataPoint[];
	/** Multiple series (use this or data, not both) */
	series?: LineChartSeries[];
	/** Chart height in pixels */
	height?: number;
	/** Line color (for single series) */
	color?: string;
	/** Show grid lines */
	showGrid?: boolean;
	/** Show X axis */
	showXAxis?: boolean;
	/** Show Y axis */
	showYAxis?: boolean;
	/** Show dots on line */
	showDots?: boolean;
	/** Curved line */
	curved?: boolean;
	/** Show area fill under line */
	showArea?: boolean;
	/** Reference line value (horizontal) */
	referenceLine?: number;
	/** Reference line label */
	referenceLineLabel?: string;
	/** Value formatter for tooltip */
	valueFormatter?: (value: number) => string;
	/** Additional class name */
	className?: string;
}

export function LineChartWidget({ data, series, height = 200, className }: LineChartProps) {
	const primary = series?.[0]?.data ?? data ?? [];
	const secondary = series?.[1]?.data;
	const tertiary = series?.[2]?.data;
	const points = primary.map((point, index) => ({
		x: point.label,
		y: point.value,
		y2: secondary?.[index]?.value,
		y3: tertiary?.[index]?.value,
	}));
	if (points.length === 0) {
		return null;
	}
	return (
		<div className={cn("w-full", className)} style={{ height }}>
			<LineChart data={points} ariaLabel="Line chart" showAxes className="h-full w-full" />
		</div>
	);
}
