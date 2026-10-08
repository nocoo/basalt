import { RadarChart } from "@nocoo/basalt/charts/radar";

const data = [
	{ subject: "Activity", value: 80 },
	{ subject: "Sleep", value: 92 },
	{ subject: "Nutrition", value: 76 },
	{ subject: "Recovery", value: 88 },
	{ subject: "Hydration", value: 70 },
];

export default function RadarDefault() {
	return <RadarChart data={data} />;
}
