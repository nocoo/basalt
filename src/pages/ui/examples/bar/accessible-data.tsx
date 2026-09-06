import { BarChart } from "@nocoo/basalt/charts/bar";

const data = [
	{ x: "Q1", y: 450 },
	{ x: "Q2", y: 620 },
	{ x: "Q3", y: 580 },
	{ x: "Q4", y: 810 },
];

export default function BarAccessibleData() {
	return (
		<div className="w-full max-w-xl">
			<BarChart
				data={data}
				showAxes
				ariaLabel="Quarterly revenue breakdown"
				className="h-48 w-full"
				summary="Quarterly revenue grew from 450k in Q1 to a peak of 810k in Q4. Press Tab to focus the chart surface and explore quarters with arrow keys."
				dataAlternative={
					<details className="mt-2 text-xs">
						<summary className="cursor-pointer font-medium text-basalt-foreground hover:underline">
							View quarterly revenue table
						</summary>
						<table
							aria-label="Quarterly revenue data"
							className="mt-2 w-full border-collapse text-left text-xs text-basalt-muted-foreground"
						>
							<thead>
								<tr className="border-b border-basalt-border">
									<th scope="col" className="py-1 font-medium text-basalt-foreground">
										Quarter
									</th>
									<th
										scope="col"
										className="py-1 text-right font-medium text-basalt-foreground tabular-nums"
									>
										Revenue ($k)
									</th>
								</tr>
							</thead>
							<tbody>
								{data.map((row) => (
									<tr key={row.x} className="border-b border-basalt-border/50">
										<td className="py-1">{row.x}</td>
										<td className="py-1 text-right tabular-nums">{row.y}</td>
									</tr>
								))}
							</tbody>
						</table>
					</details>
				}
			/>
		</div>
	);
}
