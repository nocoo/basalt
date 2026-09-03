import { BarChart } from "@nocoo/basalt/charts/bar";

const data = [
	{ x: "Mon", y: 12 },
	{ x: "Tue", y: 18 },
	{ x: "Wed", y: 9 },
	{ x: "Thu", y: 22 },
	{ x: "Fri", y: 15 },
	{ x: "Sat", y: 20 },
	{ x: "Sun", y: 16 },
];

export default function BarDefault() {
	return <BarChart data={data} showAxes />;
}
