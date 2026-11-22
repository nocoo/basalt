import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { ArrowUpDown } from "lucide-react";
import { GroupedBarChart } from "@/components/charts/grouped-bar";
import { formatUsd } from "@/lib/format";

const data = [
	{ x: "Jul", y: 4200, y2: 3100 },
	{ x: "Aug", y: 4800, y2: 3600 },
	{ x: "Sep", y: 4500, y2: 3900 },
	{ x: "Oct", y: 5100, y2: 3400 },
	{ x: "Nov", y: 4700, y2: 4100 },
	{ x: "Dec", y: 5500, y2: 3800 },
];

export function GroupedBarCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<ArrowUpDown className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						Reimbursements vs care spending
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<GroupedBarChart
					data={data}
					series={[
						{ key: "y", label: "Care reimbursements" },
						{ key: "y2", label: "Care spending" },
					]}
					ariaLabel="Grouped bar chart comparing monthly care reimbursements and care spending from July to December"
					className="min-h-[12.5rem] w-full flex-1"
					showAxes
					showLegend
					valueFormatter={formatUsd}
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
