import { SankeyChart } from "@nocoo/basalt/charts/sankey";

const data = {
	nodes: [
		{ name: "Visits" },
		{ name: "Signup" },
		{ name: "Activate" },
		{ name: "Upgrade" },
		{ name: "Churn" },
	],
	links: [
		{ source: 0, target: 1, value: 1200 },
		{ source: 0, target: 4, value: 400 },
		{ source: 1, target: 2, value: 620 },
		{ source: 1, target: 4, value: 180 },
		{ source: 2, target: 3, value: 240 },
	],
};

export default function SankeyDefault() {
	return <SankeyChart data={data} />;
}
