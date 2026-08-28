import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const DATA = [
	{ name: "A", value: 40 },
	{ name: "B", value: 25 },
	{ name: "C", value: 35 },
];

export function DonutChart() {
	return (
		<div className="h-36 w-36">
			<ResponsiveContainer>
				<PieChart>
					<Pie data={DATA} dataKey="value" innerRadius={24} outerRadius={48} stroke="none">
						{DATA.map((entry) => (
							<Cell key={entry.name} fill="currentColor" fillOpacity={entry.value / 50} />
						))}
					</Pie>
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}
