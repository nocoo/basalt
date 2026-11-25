import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PiggyBank } from "lucide-react";
import { BarChart } from "@/components/charts/bar";
import { formatUsd } from "@/lib/format";

const data = [
	{ x: "Jan", y: 12000 },
	{ x: "Feb", y: 15000 },
	{ x: "Mar", y: 11000 },
	{ x: "Apr", y: 18000 },
	{ x: "May", y: 14000 },
	{ x: "Jun", y: 20000 },
	{ x: "Jul", y: 16000 },
	{ x: "Aug", y: 22000 },
	{ x: "Sep", y: 13000 },
	{ x: "Oct", y: 17000 },
	{ x: "Nov", y: 25000 },
	{ x: "Dec", y: 19000 },
];

export function BarChartCard() {
	const total = formatUsd(data.reduce((sum, row) => sum + row.y, 0));

	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col items-start">
				<div className="flex items-center gap-basalt-space-lg">
					<PiggyBank className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						Monthly care spending
					</h2>
				</div>
				<div className="flex items-baseline gap-basalt-space-lg">
					<p className="text-basalt-3xl font-semibold text-basalt-foreground font-basalt-display tabular-nums tracking-tight">
						{total}
					</p>
					<span className="text-basalt-lg font-semibold text-basalt-foreground">
						total for Jan–Dec
					</span>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<BarChart
					data={data}
					series={[{ key: "y", label: "Spend" }]}
					ariaLabel={`Monthly care spending from January to December, totaling ${total}`}
					className="min-h-[12.5rem] w-full flex-1"
					showAxes
					valueFormatter={formatUsd}
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
