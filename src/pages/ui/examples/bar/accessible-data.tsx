import { BarChart } from "@nocoo/basalt/charts/bar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";

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
				ariaLabel="Quarterly patient visits breakdown"
				className="h-48 w-full"
				summary="Quarterly patient visits grew from 450 in Q1 to a peak of 810 in Q4. Press Tab to focus the chart surface and explore quarters with arrow keys."
				dataAlternative={
					<Collapsible className="mt-basalt-layout-sm text-basalt-sm">
						<CollapsibleTrigger>View quarterly patient-visit table</CollapsibleTrigger>
						<CollapsibleContent unstyled>
							<table
								aria-label="Quarterly patient visits data"
								className="mt-basalt-layout-sm w-full border-collapse text-left text-basalt-sm text-basalt-muted-foreground"
							>
								<thead>
									<tr className="border-b border-basalt-border">
										<th
											scope="col"
											className="py-basalt-space-sm font-medium text-basalt-foreground"
										>
											Quarter
										</th>
										<th
											scope="col"
											className="py-basalt-space-sm text-right font-medium text-basalt-foreground tabular-nums"
										>
											Patients served
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
