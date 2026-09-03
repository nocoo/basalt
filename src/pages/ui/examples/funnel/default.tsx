import { FunnelChart } from "@nocoo/basalt/charts/funnel";

const data = [
	{ name: "Visits", value: 2400 },
	{ name: "Signup", value: 820 },
	{ name: "Activate", value: 420 },
	{ name: "Upgrade", value: 180 },
];

export default function FunnelDefault() {
	return <FunnelChart data={data} />;
}
