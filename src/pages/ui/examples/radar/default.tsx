import { RadarChart } from "@nocoo/basalt/charts/radar";

const data = [
	{ subject: "Speed", value: 80 },
	{ subject: "Quality", value: 92 },
	{ subject: "Coverage", value: 76 },
	{ subject: "Reliability", value: 88 },
	{ subject: "Support", value: 70 },
];

export default function RadarDefault() {
	return <RadarChart data={data} />;
}
