import { AreaChart } from "@nocoo/basalt/charts/area";
import { BarChart } from "@nocoo/basalt/charts/bar";
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
			<div className="grid grid-cols-1 gap-basalt-layout md:gap-basalt-layout sm:grid-cols-3">
				<LayerCard>
					<p className="text-basalt-sm md:text-basalt-base text-muted-foreground mb-basalt-space-sm">
						{t("pages.flowComparison.totalInflow")}
					</p>
					<p className="text-basalt-2xl md:text-basalt-3xl font-semibold text-success font-display tracking-tight">
						${summary.totalInflow.toLocaleString()}
					</p>
				</LayerCard>
				<LayerCard>
					<p className="text-basalt-sm md:text-basalt-base text-muted-foreground mb-basalt-space-sm">
						{t("pages.flowComparison.totalOutflow")}
					</p>
					<p className="text-basalt-2xl md:text-basalt-3xl font-semibold text-destructive font-display tracking-tight">
						${summary.totalOutflow.toLocaleString()}
					</p>
				</LayerCard>
				<LayerCard>
					<p className="text-basalt-sm md:text-basalt-base text-muted-foreground mb-basalt-space-sm">
						{t("pages.flowComparison.netCashFlow")}
					</p>
					<p className="text-basalt-2xl md:text-basalt-3xl font-semibold text-foreground font-display tracking-tight">
						${summary.netFlow.toLocaleString()}
					</p>
				</LayerCard>
			</div>

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
