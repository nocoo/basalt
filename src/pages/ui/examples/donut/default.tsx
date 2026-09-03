import { DonutChart } from "@nocoo/basalt/charts/donut";

const data = [
	{ name: "Walking", value: 42 },
	{ name: "Training", value: 28 },
	{ name: "Yoga", value: 18 },
	{ name: "Recovery", value: 12 },
];

export default function DonutDefault() {
	return <DonutChart data={data} />;
}
