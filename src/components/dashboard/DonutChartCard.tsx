import { CHART_COLORS } from "@nocoo/basalt/components/chart";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Target } from "lucide-react";
import { DonutChart } from "@/components/charts/donut";
import { formatPercent } from "@/lib/format";

const data = [
	{ name: "Nutrition", value: 35 },
	{ name: "Mobility", value: 20 },
	{ name: "Medical supplies", value: 25 },
	{ name: "Lab services", value: 20 },
].map((item, index) => ({ ...item, fill: CHART_COLORS[index] }));

export function DonutChartCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col items-start">
				<div className="flex items-center gap-basalt-space-lg">
					<Target className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						Care Spend Breakdown
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex flex-1 flex-col items-center min-h-0">
					<div className="flex min-h-0 w-full flex-1 items-center justify-center">
						<DonutChart
							data={data}
							ariaLabel="Care spending breakdown: Nutrition 35%, Medical supplies 25%, Mobility 20%, Lab services 20%"
							className="aspect-square h-full max-h-[11.25rem] min-h-[6.25rem]"
							valueFormatter={formatPercent}
						/>
					</div>
					<div className="mt-basalt-card-sm grid w-full grid-cols-2 gap-basalt-card-sm">
						{data.map((item, i) => (
							<div key={item.name} className="flex flex-col items-center gap-basalt-space-xs">
								<span className="text-basalt-base font-medium tabular-nums text-basalt-foreground font-basalt-display">
									{item.value}%
								</span>
								<div className="flex items-center gap-basalt-space-md">
									<div
										className="h-2 w-2 rounded-basalt-full"
										style={{ background: CHART_COLORS[i] }}
									/>
									<span className="text-basalt-sm text-basalt-muted-foreground">{item.name}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
