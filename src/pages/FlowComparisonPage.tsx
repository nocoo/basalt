import { AreaChart } from "@nocoo/basalt/charts/area";
import { BarChart } from "@nocoo/basalt/charts/bar";
import { Activity, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFlowComparisonViewModel } from "@/viewmodels/useFlowComparisonViewModel";

export default function FlowComparisonPage() {
	const { t } = useTranslation();
	const { summary, flowData, netFlowData } = useFlowComparisonViewModel();

	return (
		<>
			<div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-3">
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<p className="text-xs md:text-sm text-muted-foreground mb-1">
						{t("pages.flowComparison.totalInflow")}
					</p>
					<h2 className="text-xl md:text-2xl font-semibold text-success font-display tracking-tight">
						${summary.totalInflow.toLocaleString()}
					</h2>
				</div>
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<p className="text-xs md:text-sm text-muted-foreground mb-1">
						{t("pages.flowComparison.totalOutflow")}
					</p>
					<h2 className="text-xl md:text-2xl font-semibold text-destructive font-display tracking-tight">
						${summary.totalOutflow.toLocaleString()}
					</h2>
				</div>
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<p className="text-xs md:text-sm text-muted-foreground mb-1">
						{t("pages.flowComparison.netCashFlow")}
					</p>
					<h2 className="text-xl md:text-2xl font-semibold text-foreground font-display tracking-tight">
						${summary.netFlow.toLocaleString()}
					</h2>
				</div>
			</div>

			<div className="mt-4 rounded-card bg-secondary p-4 md:p-5">
				<div className="flex items-center gap-2 mb-4">
					<Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<p className="text-sm text-muted-foreground">
						{t("pages.flowComparison.cashFlowOverTime")}
					</p>
				</div>
				<AreaChart
					data={flowData.map((row) => ({ x: row.month, y: row.inflow, y2: row.outflow }))}
					ariaLabel={t("pages.flowComparison.cashFlowOverTimeAria")}
					className="h-[200px] w-full md:h-[240px]"
					showAxes
				/>
			</div>

			<div className="mt-4 rounded-card bg-secondary p-4 md:p-5">
				<div className="flex items-center gap-2 mb-4">
					<BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<p className="text-sm text-muted-foreground">
						{t("pages.flowComparison.netCashFlowByMonth")}
					</p>
				</div>
				<BarChart
					data={netFlowData.map((row) => ({ x: row.month, y: row.net }))}
					ariaLabel={t("pages.flowComparison.netCashFlowByMonthAria")}
					className="h-[160px] w-full md:h-[180px]"
					showAxes
				/>
			</div>
		</>
	);
}
