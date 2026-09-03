import { CustomChart } from "@nocoo/basalt/charts/custom-chart";

const data = [
	{ x: "Mon", y: 12 },
	{ x: "Tue", y: 18 },
	{ x: "Wed", y: 9 },
	{ x: "Thu", y: 22 },
	{ x: "Fri", y: 15 },
	{ x: "Sat", y: 20 },
	{ x: "Sun", y: 16 },
];

export default function CustomChartDefault() {
	return <CustomChart data={data} />;
}
