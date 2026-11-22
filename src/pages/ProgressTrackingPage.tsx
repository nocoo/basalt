import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";
import { BarChart3, LayoutGrid } from "lucide-react";
import { GroupedBarChart } from "@/components/charts/grouped-bar";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatUsd } from "@/lib/format";
import { useProgressTrackingViewModel } from "@/viewmodels/useProgressTrackingViewModel";

export default function ProgressTrackingPage() {
	const { summary, categories, comparisonData } = useProgressTrackingViewModel();

	return (
		<ShowcasePage
			title="Care budget tracking"
			description="Track care expenses against nutrition, therapy, and wellness budgets. Sample data, not a live service."
		>
			<StatGrid columns={3} className="grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]">
				<StatCard title="Total Budget" value={`$${summary.totalLimit.toLocaleString()}`} />
				<StatCard title="Spent So Far" value={`$${summary.totalSpent.toLocaleString()}`} />
				<StatCard title="Remaining" value={`$${summary.remaining.toLocaleString()}`} />
			</StatGrid>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<LayoutGrid className="size-basalt-icon-lg text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Category Budgets</h2>
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
					<BarChart3 className="size-basalt-icon-lg text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Budget vs Actual</h2>
				</LayerCard.Header>
				<LayerCard.Body>
					<GroupedBarChart
						data={comparisonData.map((row) => ({
							x: row.month,
							y: row.budget,
							y2: row.actual,
						}))}
						series={[
							{ key: "y", label: "Budget" },
							{ key: "y2", label: "Actual" },
						]}
						ariaLabel="Budget vs actual spending grouped bar chart by month"
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
