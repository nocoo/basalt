import { LineChart } from "@nocoo/basalt/charts/line";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";

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
				ariaLabel="Weekly patient visit trends"
				className="h-48 w-full"
				summary="Patient visits peaked on Thursday at 220, with a weekly low of 95 on Wednesday. Keyboard exploration available: use Tab to focus the plot and arrow keys to navigate points."
				dataAlternative={
					<Collapsible className="mt-basalt-layout-sm text-basalt-sm">
						<CollapsibleTrigger>View patient visit data table</CollapsibleTrigger>
						<CollapsibleContent unstyled>
							<table
								aria-label="Weekly patient visit data"
								className="mt-basalt-layout-sm w-full border-collapse text-left text-basalt-sm text-basalt-muted-foreground"
							>
								<thead>
									<tr className="border-b border-basalt-border">
										<th
											scope="col"
											className="py-basalt-space-sm font-medium text-basalt-foreground"
										>
											Day
										</th>
										<th
											scope="col"
											className="py-basalt-space-sm text-right font-medium text-basalt-foreground tabular-nums"
										>
											Visits
										</th>
									</tr>
								</thead>
								<tbody>
									{data.map((row) => (
										<tr key={row.x} className="border-b border-basalt-border/50">
											<td className="py-basalt-space-sm">{row.x}</td>
											<td className="py-basalt-space-sm text-right tabular-nums">{row.y}</td>
										</tr>
									))}
								</tbody>
							</table>
						</CollapsibleContent>
					</Collapsible>
				}
			/>
		</div>
	);
}
