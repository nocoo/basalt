import { Meter } from "../components/meter";

export function Gauge({ value = 72 }: { value?: number }) {
	return <Meter value={value} label="Gauge" />;
}
