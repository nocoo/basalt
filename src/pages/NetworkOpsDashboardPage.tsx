import { chart } from "@nocoo/basalt/components/chart";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";
import { AlertTriangle, Clock, Router, Server, Wifi } from "lucide-react";
import { Timeline } from "@/components/charts/timeline";
import { DashboardTemplateAnatomy } from "@/components/DashboardTemplateAnatomy";
import { HeatmapCard } from "@/components/dashboard/HeatmapCard";
import { LineChartWidget } from "@/components/dashboard/LineChartWidget";
import { RadarChartCard } from "@/components/dashboard/RadarChartCard";
import { SankeyCard } from "@/components/dashboard/SankeyCard";
import { StackedAreaCard } from "@/components/dashboard/StackedAreaCard";
import { StackedBarCard } from "@/components/dashboard/StackedBarCard";
import { ShowcasePage } from "@/components/ShowcasePage";

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
		title: "Edge router spike",
		subtitle: "latency +12 ms",
	},
	{
		id: "i2",
		time: "08:45",
		title: "Packet loss",
		subtitle: "0.6% in us-east",
	},
	{
		id: "i3",
		time: "15:30",
		title: "BGP reconvergence",
		subtitle: "reroute complete",
	},
];

export default function NetworkOpsDashboardPage() {
	const statCards = [
		{
			title: "Uptime",
			value: "99.98%",
			subtitle: "30 days",
			icon: <Server />,
			trend: { value: 0.02, label: "vs last month" },
		},
		{
			title: "Latency",
			value: "18 ms",
			subtitle: "Avg RTT",
			icon: <Wifi />,
			trend: { value: -4.2, label: "vs last week" },
		},
		{
			title: "Packet Loss",
			value: "0.12%",
			subtitle: "Region avg",
			icon: <AlertTriangle />,
			trend: { value: -0.04, label: "vs last week" },
		},
		{
			title: "Throughput",
			value: "4.8 Gbps",
			subtitle: "Peak today",
			icon: <Router />,
			trend: { value: 6.4, label: "vs last week" },
		},
	];

	return (
		<ShowcasePage
			title="Network operations"
			description="Latency trends, traffic topology, service health, and recent incidents. Sample data, not a live service."
		>
			<StatGrid columns={4} className="grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]">
				{statCards.map((stat) => (
					<StatCard key={stat.title} {...stat} />
				))}
			</StatGrid>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Wifi className="size-basalt-icon-lg text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Latency trend</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<LineChartWidget
							data={latencyTrend}
							ariaLabel="Latency trend"
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
						<Clock className="size-basalt-icon-lg text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
							Incident timeline
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<Timeline
							ariaLabel="Incident timeline"
							items={incidents.map((event) => ({
								id: event.id,
								at: event.time,
								title: `${event.title} · ${event.subtitle}`,
							}))}
						/>
					</LayerCard.Body>
				</LayerCard>
			</div>

			<DashboardTemplateAnatomy
				patternSummary="Observability cockpit pairing latency series, Stacked Area/Bar throughput, Sankey routing, Radar profile, and 2-column Timeline."
				layoutNote="All chart figures use ChartFrame chrome so Recharts surfaces resize cleanly whenever the host sidebar toggles."
				components={["stat-card", "layer-card", "chart"]}
			/>
		</ShowcasePage>
	);
}
