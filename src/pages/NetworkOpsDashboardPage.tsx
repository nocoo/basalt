import { StatCard, StatGrid } from "@nocoo/basalt/charts/stat-card";
import { Timeline } from "@nocoo/basalt/charts/timeline";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { AlertTriangle, Clock, Router, Server, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HeatmapCard } from "@/components/dashboard/HeatmapCard";
import { LineChartWidget } from "@/components/dashboard/LineChartWidget";
import { RadarChartCard } from "@/components/dashboard/RadarChartCard";
import { SankeyCard } from "@/components/dashboard/SankeyCard";
import { StackedAreaCard } from "@/components/dashboard/StackedAreaCard";
import { StackedBarCard } from "@/components/dashboard/StackedBarCard";
import { ShowcasePage } from "@/components/ShowcasePage";
import { chart } from "@/lib/palette";

const latencyTrend = [
	{ label: "00", value: 18 },
	{ label: "04", value: 16 },
	{ label: "08", value: 21 },
	{ label: "12", value: 19 },
	{ label: "16", value: 23 },
	{ label: "20", value: 17 },
];

const incidents = [
	{
		id: "i1",
		time: "02:10",
		titleKey: "pages.networkOps.incidentRouter",
		subtitleKey: "pages.networkOps.incidentRouterDetail",
	},
	{
		id: "i2",
		time: "08:45",
		titleKey: "pages.networkOps.incidentLoss",
		subtitleKey: "pages.networkOps.incidentLossDetail",
	},
	{
		id: "i3",
		time: "15:30",
		titleKey: "pages.networkOps.incidentBgp",
		subtitleKey: "pages.networkOps.incidentBgpDetail",
	},
];

export default function NetworkOpsDashboardPage() {
	const { t } = useTranslation();

	const statCards = [
		{
			title: t("pages.networkOps.uptime"),
			value: "99.98%",
			subtitle: t("pages.networkOps.days30"),
			icon: Server,
			trend: { value: 0.02, label: t("common.vsLastMonth") },
		},
		{
			title: t("pages.networkOps.latency"),
			value: "18 ms",
			subtitle: t("pages.networkOps.avgRtt"),
			icon: Wifi,
			trend: { value: -4.2, label: t("common.vsLastWeek") },
		},
		{
			title: t("pages.networkOps.packetLoss"),
			value: "0.12%",
			subtitle: t("pages.networkOps.regionAvg"),
			icon: AlertTriangle,
			trend: { value: -0.04, label: t("common.vsLastWeek") },
		},
		{
			title: t("pages.networkOps.throughput"),
			value: "4.8 Gbps",
			subtitle: t("pages.networkOps.peakToday"),
			icon: Router,
			trend: { value: 6.4, label: t("common.vsLastWeek") },
		},
	];

	return (
		<ShowcasePage
			title={t("pages.networkOps.title")}
			description={`${t("pages.networkOps.description")} ${t("demo.analyticsData")}`}
		>
			<StatGrid columns={4} className="grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]">
				{statCards.map((stat) => (
					<StatCard key={stat.title} {...stat} />
				))}
			</StatGrid>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Wifi className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.networkOps.latencyTrend")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<LineChartWidget
							data={latencyTrend}
							ariaLabel={t("pages.networkOps.latencyTrend")}
							height={220}
							color={chart.teal}
							valueFormatter={(v) => `${v}ms`}
						/>
					</LayerCard.Body>
				</LayerCard>
				<StackedAreaCard />
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<StackedBarCard />
				<SankeyCard />
				<RadarChartCard />
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<HeatmapCard />
				<LayerCard className="lg:col-span-2">
					<LayerCard.Header className="items-center justify-start">
						<Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.networkOps.incidentTimeline")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<Timeline
							ariaLabel={t("pages.networkOps.incidentTimeline")}
							items={incidents.map((event) => ({
								id: event.id,
								at: event.time,
								title: `${t(event.titleKey)} · ${t(event.subtitleKey)}`,
							}))}
						/>
					</LayerCard.Body>
				</LayerCard>
			</div>
		</ShowcasePage>
	);
}
