import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";
import { Activity, BarChart3 } from "lucide-react";
import { AreaChart } from "@/components/charts/area";
import { BarChart } from "@/components/charts/bar";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatUsd } from "@/lib/format";
import { useFlowComparisonViewModel } from "@/viewmodels/useFlowComparisonViewModel";

export default function FlowComparisonPage() {
	const { summary, flowData, netFlowData } = useFlowComparisonViewModel();

	return (
		<ShowcasePage
			title="Care funding flow"
			description="Compare care funding, treatment spending, and monthly balances. Sample data, not a live service."
		>
			<StatGrid columns={3} className="grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]">
				<StatCard title="Total Inflow" value={`$${summary.totalInflow.toLocaleString()}`} />
				<StatCard title="Total Outflow" value={`$${summary.totalOutflow.toLocaleString()}`} />
				<StatCard title="Net Cash Flow" value={`$${summary.netFlow.toLocaleString()}`} />
			</StatGrid>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<Activity className="size-basalt-icon-lg text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						Cash Flow Over Time
					</h2>
				</LayerCard.Header>
				<LayerCard.Body>
					<AreaChart
						data={flowData.map((row) => ({
							x: row.month,
							y: row.inflow,
							y2: row.outflow,
						}))}
						series={[
							{ key: "y", label: "Inflow" },
							{ key: "y2", label: "Outflow" },
						]}
						ariaLabel="Cash flow over time area chart showing inflow and outflow"
						className="h-[12.5rem] w-full md:h-[15rem]"
						showAxes
						showLegend
						valueFormatter={formatUsd}
					/>
				</LayerCard.Body>
			</LayerCard>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<BarChart3 className="size-basalt-icon-lg text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						Net Cash Flow by Month
					</h2>
				</LayerCard.Header>
				<LayerCard.Body>
					<BarChart
						data={netFlowData.map((row) => ({
							x: row.month,
							y: row.net,
						}))}
						series={[{ key: "y", label: "Net" }]}
						ariaLabel="Net cash flow by month bar chart"
						className="h-[10rem] w-full md:h-[11.25rem]"
						showAxes
						valueFormatter={formatUsd}
					/>
				</LayerCard.Body>
			</LayerCard>
		</ShowcasePage>
	);
}
