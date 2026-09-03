import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";

const data = [
	{ x: "Jul", y: 4200, y2: 3100 },
	{ x: "Aug", y: 4800, y2: 3600 },
	{ x: "Sep", y: 4500, y2: 3900 },
	{ x: "Oct", y: 5100, y2: 3400 },
	{ x: "Nov", y: 4700, y2: 4100 },
	{ x: "Dec", y: 5500, y2: 3800 },
];

export default function GroupedBarDefault() {
	return (
		<GroupedBarChart
			data={data}
			series={[
				{ key: "y", label: "Income" },
				{ key: "y2", label: "Expense" },
			]}
			showAxes
			showLegend
		/>
	);
}
