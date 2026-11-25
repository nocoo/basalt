import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";
import { DashboardTemplateAnatomy } from "@/components/DashboardTemplateAnatomy";
import { ActionGridCard } from "@/components/dashboard/ActionGridCard";
import { AreaChartCard } from "@/components/dashboard/AreaChartCard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { DonutChartCard } from "@/components/dashboard/DonutChartCard";
import { GaugeCard } from "@/components/dashboard/GaugeCard";
import { GroupedBarCard } from "@/components/dashboard/GroupedBarCard";
import { ItemListCard } from "@/components/dashboard/ItemListCard";
import { RadialProgressCard } from "@/components/dashboard/RadialProgressCard";
import { RecentListCard } from "@/components/dashboard/RecentListCard";
import { SecondaryMetricCard } from "@/components/dashboard/SecondaryMetricCard";
import { SummaryMetricCard } from "@/components/dashboard/SummaryMetricCard";
import { TrendLineCard } from "@/components/dashboard/TrendLineCard";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useStatsOverviewViewModel } from "@/viewmodels/useStatsOverviewViewModel";

const DIRECTION_CLASSES = {
	positive: "text-basalt-success",
	negative: "text-basalt-danger-solid",
	neutral: "text-basalt-muted-foreground",
} as const;

export default function DashboardPage() {
	const { stats } = useStatsOverviewViewModel();

	return (
		<ShowcasePage
			title="Analytics overview"
			description="Metrics, trends, and the bigger picture in one place. Sample data, not a live service."
		>
			{/* Row 0: analytics stat cards */}
			<StatGrid>
				{stats.map((s) => (
					<StatCard
						key={s.label}
						label={s.label}
						value={s.value}
						trendContent={
							<>
								<span className={`font-medium tabular-nums ${DIRECTION_CLASSES[s.direction]}`}>
									{s.change}
								</span>
								{(s.change.startsWith("+") || s.change.startsWith("-")) && (
									<span className="text-basalt-muted-foreground">vs. prior 30 days</span>
								)}
							</>
						}
					/>
				))}
			</StatGrid>

			{/* Row 1: 3 summary cards */}
			<div className="grid grid-cols-1 gap-basalt-layout @[38rem]/island:grid-cols-2 @[60rem]/island:grid-cols-3">
				<SummaryMetricCard />
				<SecondaryMetricCard />
				<TrendLineCard />
			</div>

			{/* Row 2: wide bar chart + donut */}
			<div className="grid grid-cols-1 gap-basalt-layout @[56rem]/island:grid-cols-3">
				<div className="@[56rem]/island:col-span-2">
					<BarChartCard />
				</div>
				<DonutChartCard />
			</div>

			{/* Row 3: wide area chart + 2 radial cards */}
			<div className="grid grid-cols-1 gap-basalt-layout @[56rem]/island:grid-cols-3">
				<div className="@[56rem]/island:col-span-2">
					<AreaChartCard />
				</div>
				<div className="flex flex-col gap-basalt-layout">
					<RadialProgressCard />
					<GaugeCard />
				</div>
			</div>

			{/* Row 4: wide grouped bar chart + transactions */}
			<div className="grid grid-cols-1 gap-basalt-layout @[56rem]/island:grid-cols-3">
				<div className="@[56rem]/island:col-span-2">
					<GroupedBarCard />
				</div>
				<RecentListCard />
			</div>

			{/* Row 5: quick actions + accounts */}
			<div className="grid grid-cols-1 gap-basalt-layout @[44rem]/island:grid-cols-2">
				<ActionGridCard demo />
				<ItemListCard />
			</div>

			<DashboardTemplateAnatomy
				patternSummary="KPI StatGrid paired with summary Sparklines, Bar/Donut splits, Area + radial gauges, and recent activity."
				layoutNote="Container queries (@[38rem]/island, @[56rem]/island) adapt multi-column rows cleanly to sidebar collapse and narrow viewports."
				components={["stat-card", "layer-card", "chart", "badge", "button", "link"]}
			/>
		</ShowcasePage>
	);
}
