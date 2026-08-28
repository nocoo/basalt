import { LineChart } from "./line";
import type { XYPoint } from "./sample";

export function CustomChart({
	data,
	ariaLabel = "Custom chart",
	className,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
}) {
	return <LineChart data={data} ariaLabel={ariaLabel} className={className} />;
}
