import { RadarChart } from "@nocoo/basalt/charts/radar";

export default function RadarDefault() {
	return <RadarChart data={[{ subject: "Speed", value: 80 }]} />;
}
