import { Meter } from "../components/meter";

export function Gauge({
	value = 72,
	ariaLabel = "Gauge",
	className,
}: {
	value?: number;
	ariaLabel?: string;
	className?: string;
}) {
	return <Meter value={value} label={ariaLabel} aria-label={ariaLabel} className={className} />;
}
