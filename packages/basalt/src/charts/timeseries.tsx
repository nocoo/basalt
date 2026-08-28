import { LineChart } from "./line";
import type { XYPoint } from "./sample";

export function Timeseries({
	data,
	ariaLabel = "Timeseries",
	className,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
}) {
	return <LineChart data={data} ariaLabel={ariaLabel} className={className} />;
}
