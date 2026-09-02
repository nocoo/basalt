import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";
import { BarChart3, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatUsd } from "@/lib/format";
import { useProgressTrackingViewModel } from "@/viewmodels/useProgressTrackingViewModel";

export default function ProgressTrackingPage() {
	const { t } = useTranslation();
	const { summary, categories, comparisonData } = useProgressTrackingViewModel();

	return (
		<>
			<div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-3">
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<p className="text-xs md:text-sm text-muted-foreground mb-1">
						{t("pages.progressTracking.totalBudget")}
					</p>
					<h2 className="text-xl md:text-2xl font-semibold text-foreground font-display tracking-tight">
						${summary.totalLimit.toLocaleString()}
					</h2>
				</div>
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<p className="text-xs md:text-sm text-muted-foreground mb-1">
						{t("pages.progressTracking.spentSoFar")}
					</p>
					<h2 className="text-xl md:text-2xl font-semibold text-foreground font-display tracking-tight">
						${summary.totalSpent.toLocaleString()}
					</h2>
				</div>
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<p className="text-xs md:text-sm text-muted-foreground mb-1">
						{t("pages.progressTracking.remaining")}
					</p>
					<h2 className="text-xl md:text-2xl font-semibold text-success font-display tracking-tight">
						${summary.remaining.toLocaleString()}
					</h2>
				</div>
			</div>

			<div className="mt-4 rounded-card bg-secondary p-4 md:p-5">
				<div className="flex items-center gap-2 mb-4">
					<LayoutGrid className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<p className="text-sm text-muted-foreground">
						{t("pages.progressTracking.categoryBudgets")}
					</p>
				</div>
				<div className="flex flex-col gap-4">
					{categories.map((cat) => (
						<div key={cat.category}>
							<div className="flex items-center justify-between mb-1.5">
								<span className="text-sm text-foreground">{cat.category}</span>
								<span className="text-xs text-muted-foreground">
									${cat.spent} / ${cat.limit}
								</span>
							</div>
							<div
								className="h-2 rounded-full bg-card"
								role="progressbar"
								aria-valuenow={cat.progress}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={`${cat.category} budget: ${cat.progress}% spent`}
							>
								<div
									className="h-full rounded-full transition-all"
									style={{ width: `${cat.progress}%`, background: cat.color }}
									aria-hidden="true"
								/>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="mt-4 rounded-card bg-secondary p-4 md:p-5">
				<div className="flex items-center gap-2 mb-4">
					<BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<p className="text-sm text-muted-foreground">
						{t("pages.progressTracking.budgetVsActual")}
					</p>
				</div>
				<GroupedBarChart
					data={comparisonData.map((row) => ({ x: row.month, y: row.budget, y2: row.actual }))}
					series={[
						{ key: "y", label: t("pages.progressTracking.budget") },
						{ key: "y2", label: t("pages.progressTracking.actual") },
					]}
					ariaLabel={t("pages.progressTracking.budgetVsActualAria")}
					className="h-[180px] w-full md:h-[200px]"
					showAxes
					showLegend
					valueFormatter={formatUsd}
				/>
			</div>
		</>
	);
}
