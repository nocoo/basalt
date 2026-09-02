import { FunnelChart } from "@nocoo/basalt/charts/funnel";

export default function FunnelDefault() {
	return <FunnelChart data={[{ name: "Visits", value: 2400 }]} />;
}
