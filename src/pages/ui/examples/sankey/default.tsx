import { SankeyChart } from "@nocoo/basalt/charts/sankey";

export default function SankeyDefault() {
	return (
		<SankeyChart
			data={{
				nodes: [{ name: "In" }, { name: "Out" }],
				links: [{ source: 0, target: 1, value: 10 }],
			}}
		/>
	);
}
