import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Meter } from "@nocoo/basalt/components/meter";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Car, Check, Home, Plane, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ActionGridCard } from "@/components/dashboard/ActionGridCard";
import { AreaChartCard } from "@/components/dashboard/AreaChartCard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { BulletChartCard } from "@/components/dashboard/BulletChartCard";
import { DonutChartCard } from "@/components/dashboard/DonutChartCard";
import { FunnelChartCard } from "@/components/dashboard/FunnelChartCard";
import { GaugeCard } from "@/components/dashboard/GaugeCard";
import { GroupedBarCard } from "@/components/dashboard/GroupedBarCard";
import { HeatmapCard } from "@/components/dashboard/HeatmapCard";
import { ItemListCard } from "@/components/dashboard/ItemListCard";
import { MiniDonutCard } from "@/components/dashboard/MiniDonutCard";
import { MultiLineCard } from "@/components/dashboard/MultiLineCard";
import { RadarChartCard } from "@/components/dashboard/RadarChartCard";
import { RadialProgressCard } from "@/components/dashboard/RadialProgressCard";
import { RecentListCard } from "@/components/dashboard/RecentListCard";
import { SankeyCard } from "@/components/dashboard/SankeyCard";
import { SecondaryMetricCard } from "@/components/dashboard/SecondaryMetricCard";
import { SparklineCard } from "@/components/dashboard/SparklineCard";
import { StackedAreaCard } from "@/components/dashboard/StackedAreaCard";
import { StackedBarCard } from "@/components/dashboard/StackedBarCard";
import { SummaryMetricCard } from "@/components/dashboard/SummaryMetricCard";
import { TrendLineCard } from "@/components/dashboard/TrendLineCard";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useTargetCardsViewModel } from "@/viewmodels/useTargetCardsViewModel";

const GOAL_ICONS: Record<string, React.ElementType> = {
	shield: Shield,
	plane: Plane,
	car: Car,
	home: Home,
};

export default function ComponentsPage() {
	const { goals } = useTargetCardsViewModel();
	const { t } = useTranslation();

	return (
		<ShowcasePage
			title={t("pages.components.title")}
			description={t("pages.components.description")}
		>
			<SectionRule title={t("pages.components.metricCards")}>
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2 lg:grid-cols-4">
					<SummaryMetricCard />
					<SecondaryMetricCard />
					<TrendLineCard />
					<SparklineCard />
				</div>
			</SectionRule>

			<SectionRule title={t("pages.components.charts")}>
				<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
					<BarChartCard />
					<AreaChartCard />
					<GroupedBarCard />
					<DonutChartCard />
					<GaugeCard />
					<StackedBarCard />
					<RadarChartCard />
					<RadialProgressCard />
					<StackedAreaCard />
					<MultiLineCard />
					<BulletChartCard />
					<MiniDonutCard />
					<SankeyCard />
					<FunnelChartCard />
				</div>
			</SectionRule>

			<SectionRule title={t("pages.components.heatmaps")}>
				<div className="grid grid-cols-1 gap-basalt-layout">
					<HeatmapCard />
				</div>
			</SectionRule>

			<SectionRule title={t("pages.components.listsActions")}>
				<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
					<ActionGridCard />
					<ItemListCard />
					<RecentListCard />
				</div>
			</SectionRule>

			<SectionRule title={t("pages.components.highlights")}>
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2">
					<LayerCard>
						<p className="text-basalt-base font-medium text-foreground">
							{t("pages.components.aiReadiness")}
						</p>
						<p className="text-basalt-sm text-muted-foreground">
							{t("pages.components.aiReadinessDesc")}
						</p>
						<Button variant="secondary" size="sm" className="mt-basalt-space-lg">
							{t("common.viewModule")}
						</Button>
					</LayerCard>
					<LayerCard>
						<p className="text-basalt-base font-medium text-foreground">
							{t("pages.components.retentionModule")}
						</p>
						<p className="text-basalt-sm text-muted-foreground">
							{t("pages.components.retentionModuleDesc")}
						</p>
						<Button variant="secondary" size="sm" className="mt-basalt-space-lg">
							{t("common.viewModule")}
						</Button>
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.components.targets")}>
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2">
					{goals.map((goal) => {
						const Icon = GOAL_ICONS[goal.icon] ?? Shield;
						return (
							<LayerCard key={goal.name}>
								<LayerCard.Header className="items-center justify-start">
									<div className="flex h-10 w-10 items-center justify-center rounded-basalt-md bg-primary/10">
										<Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
									</div>
									<div className="flex-1">
										<p className="text-basalt-base font-medium text-foreground">{goal.name}</p>
										<p className="text-basalt-sm text-muted-foreground">
											${goal.saved.toLocaleString()} {t("common.of")} $
											{goal.target.toLocaleString()}
										</p>
									</div>
									<span className="text-basalt-base font-semibold text-foreground">
										{goal.percent}%
									</span>
								</LayerCard.Header>
								<LayerCard.Body className="space-y-basalt-space-lg">
									<Meter
										hideValue
										value={goal.percent}
										aria-label={`${goal.name}: ${goal.percent}% of $${goal.target.toLocaleString()} saved`}
									/>
									<div className="flex flex-wrap items-center gap-basalt-space-lg">
										<span className="text-basalt-sm text-muted-foreground">
											{t("pages.components.monthlyTarget")} ${goal.monthlyTarget.toLocaleString()}
										</span>
										{goal.onTrack && (
											<span className="flex items-center gap-basalt-space-sm text-basalt-sm text-success">
												<Check className="h-3 w-3" strokeWidth={2} />{" "}
												{t("pages.components.onTrack")}
											</span>
										)}
									</div>
								</LayerCard.Body>
							</LayerCard>
						);
					})}
				</div>
			</SectionRule>
		</ShowcasePage>
	);
}
