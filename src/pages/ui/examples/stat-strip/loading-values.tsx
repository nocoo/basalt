import { StatStrip } from "@nocoo/basalt/components/stat-strip";

export default function LoadingValuesExample() {
	return (
		<StatStrip
			loading
			items={[
				{ label: "Care plans", value: "24" },
				{ label: "Check-ins", value: "128" },
				{ label: "Incidents", value: "3" },
				{ label: "Uptime", value: "99.9%" },
			]}
		/>
	);
}
