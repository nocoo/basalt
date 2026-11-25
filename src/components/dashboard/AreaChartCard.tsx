import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { BarChart3 } from "lucide-react";
import { AreaChart } from "@/components/charts/area";
import { formatUsd } from "@/lib/format";

const data = [
	{ x: "Mon", y: 420, y2: 320 },
	{ x: "Tue", y: 380, y2: 450 },
	{ x: "Wed", y: 510, y2: 280 },
	{ x: "Thu", y: 620, y2: 390 },
	{ x: "Fri", y: 480, y2: 520 },
	{ x: "Sat", y: 350, y2: 180 },
	{ x: "Sun", y: 290, y2: 150 },
];

export function AreaChartCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col items-start">
				<div className="flex items-center gap-basalt-space-lg">
					<BarChart3 className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Weekly Activity</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<AreaChart
					data={data}
					series={[
						{ key: "y", label: "Care reimbursements" },
						{ key: "y2", label: "Care spending" },
					]}
					ariaLabel="Weekly activity area chart comparing income and expense from Monday to Sunday"
					className="min-h-[12.5rem] w-full flex-1"
					showAxes
					showLegend
					valueFormatter={formatUsd}
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
