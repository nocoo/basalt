import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";
import { StatCard, StatGrid } from "@nocoo/basalt/charts/stat-card";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { BarChart3, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatUsd } from "@/lib/format";
import { useProgressTrackingViewModel } from "@/viewmodels/useProgressTrackingViewModel";

export default function ProgressTrackingPage() {
	const { t } = useTranslation();
	const { summary, categories, comparisonData } = useProgressTrackingViewModel();

	return (
		<ShowcasePage
			title={t("pages.progressTracking.title")}
			description={`${t("pages.progressTracking.description")} ${t("demo.analyticsData")}`}
		>
			<StatGrid columns={3} className="grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]">
				<StatCard
					title={t("pages.progressTracking.totalBudget")}
					value={`$${summary.totalLimit.toLocaleString()}`}
				/>
				<StatCard
					title={t("pages.progressTracking.spentSoFar")}
					value={`$${summary.totalSpent.toLocaleString()}`}
				/>
				<StatCard
					title={t("pages.progressTracking.remaining")}
					value={`$${summary.remaining.toLocaleString()}`}
				/>
			</StatGrid>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<LayoutGrid className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base text-muted-foreground">
						{t("pages.progressTracking.categoryBudgets")}
					</h2>
				</LayerCard.Header>
				<LayerCard.Body className="flex flex-col gap-basalt-card">
					{categories.map((cat) => (
						<div key={cat.category}>
							<div className="flex items-center justify-between mb-basalt-space-md">
								<span className="text-basalt-base text-foreground">{cat.category}</span>
								<span className="text-basalt-sm text-muted-foreground">
									{formatUsd(cat.spent)} / {formatUsd(cat.limit)}
								</span>
							</div>
							<div
								className="h-2 rounded-basalt-full bg-card"
								role="progressbar"
								aria-valuenow={cat.progress}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={t("pages.progressTracking.categoryProgressAria", {
									category: cat.category,
									percent: cat.progress,
								})}
							>
								<div
									className="h-full rounded-basalt-full transition-[width,opacity] basalt-motion"
									style={{ width: `${cat.progress}%`, background: cat.color }}
									aria-hidden="true"
								/>
							</div>
						</div>
					))}
				</LayerCard.Body>
			</LayerCard>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base text-muted-foreground">
						{t("pages.progressTracking.budgetVsActual")}
					</h2>
				</LayerCard.Header>
				<LayerCard.Body>
					<GroupedBarChart
						data={comparisonData.map((row) => ({
							x: t(`dashboard.months.${row.month.toLowerCase()}`),
							y: row.budget,
							y2: row.actual,
						}))}
						series={[
							{ key: "y", label: t("pages.progressTracking.budget") },
							{ key: "y2", label: t("pages.progressTracking.actual") },
						]}
						ariaLabel={t("pages.progressTracking.budgetVsActualAria")}
						className="h-[11.25rem] w-full md:h-[12.5rem]"
						showAxes
						showLegend
						valueFormatter={formatUsd}
					/>
				</LayerCard.Body>
			</LayerCard>
		</ShowcasePage>
	);
}
