import { StatCard, StatGrid } from "@nocoo/basalt/charts/stat-card";
import { useTranslation } from "react-i18next";
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

export default function DashboardPage() {
	const { t } = useTranslation();
	const { stats } = useStatsOverviewViewModel();

	return (
		<ShowcasePage
			title={t("pages.dashboard.title")}
			description={t("pages.dashboard.description")}
			size="lg"
		>
			{/* Row 0: analytics stat cards */}
			<StatGrid>
				{stats.map((s) => (
					<StatCard
						key={s.label}
						label={s.label}
						value={s.value}
						trendContent={<span className={`font-medium ${s.changeColorClass}`}>{s.change}</span>}
					/>
				))}
			</StatGrid>

			{/* Row 1: 3 summary cards */}
			<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2 lg:grid-cols-3">
				<SummaryMetricCard />
				<SecondaryMetricCard />
				<TrendLineCard />
			</div>

			{/* Row 2: wide bar chart + donut */}
			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<div className="lg:col-span-2">
					<BarChartCard />
				</div>
				<DonutChartCard />
			</div>

			{/* Row 3: wide area chart + 2 radial cards */}
			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<div className="lg:col-span-2">
					<AreaChartCard />
				</div>
				<div className="flex flex-col gap-basalt-layout">
					<RadialProgressCard />
					<GaugeCard />
				</div>
			</div>

			{/* Row 4: wide grouped bar chart + transactions */}
			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<div className="lg:col-span-2">
					<GroupedBarCard />
				</div>
				<RecentListCard />
			</div>

			{/* Row 5: quick actions + accounts */}
			<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2 lg:grid-cols-3">
				<ActionGridCard />
				<ItemListCard />
			</div>
		</ShowcasePage>
	);
}
