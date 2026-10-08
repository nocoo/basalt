import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";
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
			description={t("pages.progressTracking.description")}
		>
			<div className="grid grid-cols-1 gap-basalt-layout md:gap-basalt-layout sm:grid-cols-3">
				<LayerCard>
					<p className="text-basalt-sm md:text-basalt-base text-muted-foreground mb-basalt-space-sm">
						{t("pages.progressTracking.totalBudget")}
					</p>
					<p className="text-basalt-2xl md:text-basalt-3xl font-semibold text-foreground font-display tracking-tight">
						${summary.totalLimit.toLocaleString()}
					</p>
				</LayerCard>
				<LayerCard>
					<p className="text-basalt-sm md:text-basalt-base text-muted-foreground mb-basalt-space-sm">
						{t("pages.progressTracking.spentSoFar")}
					</p>
					<p className="text-basalt-2xl md:text-basalt-3xl font-semibold text-foreground font-display tracking-tight">
						${summary.totalSpent.toLocaleString()}
					</p>
				</LayerCard>
				<LayerCard>
					<p className="text-basalt-sm md:text-basalt-base text-muted-foreground mb-basalt-space-sm">
						{t("pages.progressTracking.remaining")}
					</p>
					<p className="text-basalt-2xl md:text-basalt-3xl font-semibold text-success font-display tracking-tight">
						${summary.remaining.toLocaleString()}
					</p>
				</LayerCard>
			</div>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<LayoutGrid className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base text-muted-foreground">
						{t("pages.progressTracking.categoryBudgets")}
					</h2>
				</LayerCard.Header>
				<LayerCard.Body className="flex flex-col gap-basalt-space-lg">
					{categories.map((cat) => (
						<div key={cat.category}>
							<div className="flex items-center justify-between mb-basalt-space-md">
								<span className="text-basalt-base text-foreground">{cat.category}</span>
								<span className="text-basalt-sm text-muted-foreground">
									${cat.spent} / ${cat.limit}
								</span>
							</div>
							<div
								className="h-2 rounded-basalt-full bg-card"
								role="progressbar"
								aria-valuenow={cat.progress}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={`${cat.category} budget: ${cat.progress}% spent`}
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
						data={comparisonData.map((row) => ({ x: row.month, y: row.budget, y2: row.actual }))}
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
