import { StatStrip } from "@nocoo/basalt/components/stat-strip";

export default function OverviewExample() {
	return (
		<StatStrip
			items={[
				{ label: "Projects", value: "24" },
				{ label: "Deploys", value: "128" },
				{ label: "Incidents", value: "3" },
				{ label: "Uptime", value: "99.9%" },
			]}
		/>
	);
}
