import { LineChart } from "@nocoo/basalt/charts/line";

const data = [
	{ x: "Mon", y: 120 },
	{ x: "Tue", y: 185 },
	{ x: "Wed", y: 95 },
	{ x: "Thu", y: 220 },
	{ x: "Fri", y: 150 },
	{ x: "Sat", y: 205 },
	{ x: "Sun", y: 165 },
];

export default function LineAccessibleData() {
	return (
		<div className="w-full max-w-xl">
			<LineChart
				data={data}
				showAxes
				ariaLabel="Weekly active request trends"
				className="h-48 w-full"
				summary="Active requests peaked on Thursday at 220, with a weekly low of 95 on Wednesday. Keyboard exploration available: use Tab to focus the plot and arrow keys to navigate points."
				dataAlternative={
					<details className="mt-2 text-xs">
						<summary className="cursor-pointer font-medium text-basalt-foreground hover:underline">
							View request data table
						</summary>
						<table
							aria-label="Weekly request data"
							className="mt-2 w-full border-collapse text-left text-xs text-basalt-muted-foreground"
						>
							<thead>
								<tr className="border-b border-basalt-border">
									<th scope="col" className="py-1 font-medium text-basalt-foreground">
										Day
									</th>
									<th
										scope="col"
										className="py-1 text-right font-medium text-basalt-foreground tabular-nums"
									>
										Requests
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
