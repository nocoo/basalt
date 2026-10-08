import { FunnelChart } from "@nocoo/basalt/charts/funnel";

const data = [
	{ name: "Check-ins", value: 2400 },
	{ name: "Intake", value: 820 },
	{ name: "Care plan", value: 420 },
	{ name: "Follow-up", value: 180 },
];

export default function FunnelDefault() {
	return <FunnelChart data={data} />;
}
