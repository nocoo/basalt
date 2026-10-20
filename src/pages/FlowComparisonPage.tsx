import { AreaChart } from "@nocoo/basalt/charts/area";
import { BarChart } from "@nocoo/basalt/charts/bar";
import { StatCard, StatGrid } from "@nocoo/basalt/charts/stat-card";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Activity, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatUsd } from "@/lib/format";
import { useFlowComparisonViewModel } from "@/viewmodels/useFlowComparisonViewModel";

export default function FlowComparisonPage() {
	const { t } = useTranslation();
	const { summary, flowData, netFlowData } = useFlowComparisonViewModel();

	return (
		<ShowcasePage
			title={t("pages.flowComparison.title")}
			description={t("pages.flowComparison.description")}
		>
			<StatGrid columns={3}>
				<StatCard
					title={t("pages.flowComparison.totalInflow")}
					value={`$${summary.totalInflow.toLocaleString()}`}
				/>
				<StatCard
					title={t("pages.flowComparison.totalOutflow")}
					value={`$${summary.totalOutflow.toLocaleString()}`}
				/>
				<StatCard
					title={t("pages.flowComparison.netCashFlow")}
					value={`$${summary.netFlow.toLocaleString()}`}
				/>
			</StatGrid>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base text-muted-foreground">
						{t("pages.flowComparison.cashFlowOverTime")}
					</h2>
				</LayerCard.Header>
				<LayerCard.Body>
					<AreaChart
						data={flowData.map((row) => ({ x: row.month, y: row.inflow, y2: row.outflow }))}
						series={[
							{ key: "y", label: t("pages.flowComparison.inflow") },
							{ key: "y2", label: t("pages.flowComparison.outflow") },
						]}
						ariaLabel={t("pages.flowComparison.cashFlowOverTimeAria")}
						className="h-[12.5rem] w-full md:h-[15rem]"
						showAxes
						showLegend
						valueFormatter={formatUsd}
					/>
				</LayerCard.Body>
			</LayerCard>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base text-muted-foreground">
						{t("pages.flowComparison.netCashFlowByMonth")}
					</h2>
				</LayerCard.Header>
				<LayerCard.Body>
					<BarChart
						data={netFlowData.map((row) => ({ x: row.month, y: row.net }))}
						series={[{ key: "y", label: t("pages.flowComparison.net") }]}
						ariaLabel={t("pages.flowComparison.netCashFlowByMonthAria")}
						className="h-[10rem] w-full md:h-[11.25rem]"
						showAxes
						valueFormatter={formatUsd}
					/>
				</LayerCard.Body>
			</LayerCard>
		</ShowcasePage>
	);
}
