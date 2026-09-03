import { AreaChart } from "@nocoo/basalt/charts/area";

const data = [
	{ x: "Mon", y: 12, y2: 8 },
	{ x: "Tue", y: 18, y2: 11 },
	{ x: "Wed", y: 9, y2: 14 },
	{ x: "Thu", y: 22, y2: 16 },
	{ x: "Fri", y: 15, y2: 10 },
	{ x: "Sat", y: 20, y2: 13 },
	{ x: "Sun", y: 16, y2: 9 },
];

export default function AreaDefault() {
	return <AreaChart data={data} showAxes />;
}
