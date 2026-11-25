import { Button } from "@nocoo/basalt/components/button";
import { chart } from "@nocoo/basalt/components/chart";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";
import { Textarea } from "@nocoo/basalt/components/textarea";
import {
	Activity,
	AlertTriangle,
	Brain,
	CheckCircle2,
	Droplet,
	Flame,
	Footprints,
	Heart,
	MessageSquare,
	Moon,
	ShieldCheck,
	Sparkles,
	Zap,
} from "lucide-react";
import { HeatmapCalendar, heatmapColorScales } from "@/components/charts/heatmap-calendar";
import { SlotBarChart } from "@/components/charts/slot-bar";
import { Timeline } from "@/components/charts/timeline";
import { DashboardTemplateAnatomy } from "@/components/DashboardTemplateAnatomy";
import { BarChartWidget } from "@/components/dashboard/BarChartWidget";
import { LineChartWidget } from "@/components/dashboard/LineChartWidget";
import { DonutChartWidget } from "@/components/dashboard/PieChartWidget";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatPercent } from "@/lib/format";

const weeklySteps = [
	{ label: "Mon", value: 7800 },
	{ label: "Tue", value: 8200 },
	{ label: "Wed", value: 9600 },
	{ label: "Thu", value: 10120 },
	{ label: "Fri", value: 8900 },
	{ label: "Sat", value: 11200 },
	{ label: "Sun", value: 9840 },
];

const monthlySleep = [
	{ label: "Week 1", value: 6.8 },
	{ label: "Week 2", value: 7.1 },
	{ label: "Week 3", value: 7.4 },
	{ label: "Week 4", value: 7.2 },
];

const activityBreakdown = [
	{ label: "Walking", value: 42 },
	{ label: "Workout", value: 28 },
	{ label: "Yoga", value: 16 },
	{ label: "Recovery", value: 14 },
];

const sleepSlots = Array.from({ length: 24 }).map((_, i) => ({
	color:
		i < 6
			? "bg-basalt-primary/60"
			: i < 10
				? "bg-basalt-primary"
				: i < 16
					? "bg-basalt-success"
					: "bg-basalt-warning",
}));

const heartRateSlots = Array.from({ length: 24 }).map((_, i) => ({
	color:
		i < 8
			? "bg-basalt-success"
			: i < 16
				? "bg-basalt-warning/60"
				: i < 20
					? "bg-basalt-warning"
					: "bg-basalt-danger-solid",
}));

const heatmapData = Array.from({ length: 365 }).map((_, i) => {
	const date = new Date(Date.UTC(2026, 0, 1 + i));
	const noise = Math.sin(i * 17.13 + 3.1) * 100000;
	const random = noise - Math.floor(noise);
	const value = Math.max(1, Math.round(2 + random * 9));
	return {
		date: date.toISOString().slice(0, 10),
		value,
	};
});

const readinessTrend = [
	{ label: "Mon", value: 78 },
	{ label: "Tue", value: 82 },
	{ label: "Wed", value: 84 },
	{ label: "Thu", value: 88 },
	{ label: "Fri", value: 86 },
	{ label: "Sat", value: 90 },
	{ label: "Sun", value: 92 },
];

const recommendationImpact = [
	{ label: "Sleep", value: 22 },
	{ label: "Nutrition", value: 18 },
	{ label: "Movement", value: 28 },
	{ label: "Recovery", value: 14 },
	{ label: "Focus", value: 20 },
];

const statCards = [
	{
		title: "Steps",
		value: "9,840",
		subtitle: "Daily target 12k",
		icon: <Footprints />,
		trend: { value: 6.2, label: "vs last week" },
	},
	{
		title: "Calories",
		value: "2,130",
		subtitle: "Daily burn",
		icon: <Flame />,
		trend: { value: -1.4, label: "vs yesterday" },
	},
	{
		title: "Hydration",
		value: "2.4L",
		subtitle: "Goal 3.0L",
		icon: <Droplet />,
		trend: { value: 8.3, label: "vs last week" },
	},
	{
		title: "Sleep",
		value: "7h 24m",
		subtitle: "Consistency 82%",
		icon: <Moon />,
		trend: { value: 2.1, label: "vs last week" },
	},
];

const aiStatCards = [
	{
		title: "Insight Score",
		value: "92",
		subtitle: "Quality tier A",
		icon: <Brain />,
		trend: { value: 4.2, label: "vs last week" },
	},
	{
		title: "Risk Alerts",
		value: "3",
		subtitle: "2 resolved",
		icon: <AlertTriangle />,
		trend: { value: -1.5, label: "vs last week" },
	},
	{
		title: "Automation",
		value: "68%",
		subtitle: "Tasks handled",
		icon: <Zap />,
		trend: { value: 6.8, label: "vs last month" },
	},
];

const timelineEvents = [
	{ id: "t1", time: "06:30", title: "Wake up", subtitle: "Rested" },
	{ id: "t2", time: "07:10", title: "Hydration", subtitle: "400ml" },
	{ id: "t3", time: "12:20", title: "Walk", subtitle: "3.2km" },
	{ id: "t4", time: "18:10", title: "Workout", subtitle: "Strength 45m" },
	{ id: "t5", time: "21:40", title: "Wind down", subtitle: "Stretching" },
] as const;

const insightTimeline = [
	{ id: "i1", time: "07:30", title: "Sleep debt detected", subtitle: "Recommend early wind down" },
	{ id: "i2", time: "09:10", title: "Hydration dip", subtitle: "Add 400ml before noon" },
	{ id: "i3", time: "13:20", title: "Focus window", subtitle: "Schedule deep work block" },
	{ id: "i4", time: "17:40", title: "Recovery needed", subtitle: "Light movement recommended" },
] as const;

const recommendations = [
	{ title: "Shift bedtime by 30 minutes", status: "New" },
	{ title: "Add a 20-minute walk", status: "Active" },
	{ title: "Reduce caffeine after 3 PM", status: "Active" },
	{ title: "Plan protein-forward lunch", status: "Queued" },
] as const;

export default function HealthPage() {
	return (
		<ShowcasePage
			title="Health telemetry"
			description="Sample sleep, heart rate, activity, and insight data."
		>
			<SectionRule
				title="Sample day"
				actions={
					<span className="text-basalt-base text-basalt-muted-foreground">
						{new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(new Date(2026, 1, 13))}
					</span>
				}
			/>

			<StatGrid columns={4} className="grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]">
				{statCards.map((stat) => (
					<StatCard
						key={stat.title}
						title={stat.title}
						value={stat.value}
						subtitle={stat.subtitle}
						icon={stat.icon}
						trend={stat.trend}
					/>
				))}
			</StatGrid>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Moon className="size-basalt-icon-lg text-basalt-link" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Sleep stages</h2>
						<span className="ml-auto text-basalt-base font-semibold text-basalt-link">7h 24m</span>
					</LayerCard.Header>
					<LayerCard.Body className="space-y-basalt-card-sm">
						<SlotBarChart
							items={sleepSlots.map((item, index) => ({
								...item,
								label: `Sample slot ${index + 1}`,
							}))}
							ariaLabel="Illustrative sleep stages, not actual measurements"
						/>
						<p className="text-basalt-sm text-basalt-muted-foreground">
							Illustrative colors, not actual measurements
						</p>
					</LayerCard.Body>
				</LayerCard>
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Heart className="size-basalt-icon-lg text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
							Heart rate zones
						</h2>
						<span className="ml-auto text-basalt-base font-semibold text-basalt-foreground">
							72 bpm
						</span>
					</LayerCard.Header>
					<LayerCard.Body className="space-y-basalt-card-sm">
						<SlotBarChart
							items={heartRateSlots.map((item, index) => ({
								...item,
								label: `Sample slot ${index + 1}`,
							}))}
							ariaLabel="Illustrative heart rate zones, not actual measurements"
						/>
						<p className="text-basalt-sm text-basalt-muted-foreground">
							Illustrative colors, not actual measurements
						</p>
					</LayerCard.Body>
				</LayerCard>
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Footprints className="size-basalt-icon-lg text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Weekly steps</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<BarChartWidget
							data={weeklySteps}
							ariaLabel="Weekly steps"
							height={200}
							color={chart.green}
						/>
					</LayerCard.Body>
				</LayerCard>
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Sparkles className="size-basalt-icon-lg text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
							Monthly sleep trend
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<LineChartWidget
							data={monthlySleep}
							ariaLabel="Monthly sleep trend"
							height={200}
							color={chart.indigo}
							valueFormatter={(v) => `${v}h`}
						/>
					</LayerCard.Body>
				</LayerCard>
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Activity className="size-basalt-icon-lg text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
							Activity breakdown
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<DonutChartWidget
							data={activityBreakdown}
							ariaLabel="Activity breakdown"
							height={220}
							showLegend
							valueFormatter={formatPercent}
						/>
					</LayerCard.Body>
				</LayerCard>
				<LayerCard className="lg:col-span-2">
					<LayerCard.Header className="items-center justify-start">
						<Activity className="size-basalt-icon-lg text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Daily timeline</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<Timeline
							ariaLabel="Daily timeline"
							items={timelineEvents.map((event) => ({
								id: event.id,
								at: event.time,
								title: `${event.title} · ${event.subtitle}`,
							}))}
						/>
					</LayerCard.Body>
				</LayerCard>
			</div>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<Activity className="size-basalt-icon-lg text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						Activity heatmap — 2026
					</h2>
				</LayerCard.Header>
				<LayerCard.Body>
					<HeatmapCalendar
						ariaLabel="Activity heatmap — 2026"
						data={heatmapData}
						year={2026}
						colorScale={heatmapColorScales.green}
						metricLabel="Activities"
						locale="en-US"
						lessLabel="Less"
						moreLabel="More"
					/>
				</LayerCard.Body>
			</LayerCard>

			<SectionRule title="Life.ai Insights">
				<p className="text-basalt-base text-basalt-muted-foreground">
					Example insights, not medical advice.
				</p>
				<StatGrid columns={3} className="grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]">
					{aiStatCards.map((stat) => (
						<StatCard
							key={stat.title}
							title={stat.title}
							value={stat.value}
							subtitle={stat.subtitle}
							icon={stat.icon}
							trend={stat.trend}
						/>
					))}
				</StatGrid>

				<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<ShieldCheck className="size-basalt-icon-lg text-basalt-muted-foreground" />
							<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
								AI readiness trend
							</h2>
						</LayerCard.Header>
						<LayerCard.Body>
							<LineChartWidget
								data={readinessTrend}
								ariaLabel="AI readiness trend"
								height={200}
								color={chart.primary}
								valueFormatter={formatPercent}
							/>
						</LayerCard.Body>
					</LayerCard>
					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<Zap className="size-basalt-icon-lg text-basalt-muted-foreground" />
							<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
								Recommendation impact
							</h2>
						</LayerCard.Header>
						<LayerCard.Body>
							<BarChartWidget
								data={recommendationImpact}
								ariaLabel="Recommendation impact"
								height={200}
								color={chart.teal}
							/>
						</LayerCard.Body>
					</LayerCard>
				</div>

				<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<MessageSquare className="size-basalt-icon-lg text-basalt-muted-foreground" />
							<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Prompt studio</h2>
						</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card">
							<p className="text-basalt-sm text-basalt-muted-foreground">
								Demo only. Insight generation is unavailable.
							</p>
							<Textarea rows={5} placeholder="Enter a sample prompt" aria-label="Prompt studio" />
							<div className="flex flex-wrap gap-basalt-space-lg">
								{["Summarize week", "Improve sleep", "Boost focus", "Plan recovery"].map((chip) => (
									<Button
										variant="ghost"
										type="button"
										key={chip}
										className="text-basalt-muted-foreground"
										disabled
									>
										{chip}
									</Button>
								))}
							</div>
							<Button className="w-full" disabled>
								Generate insight
							</Button>
						</LayerCard.Body>
					</LayerCard>

					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<CheckCircle2 className="size-basalt-icon-lg text-basalt-muted-foreground" />
							<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
								Recommended actions
							</h2>
						</LayerCard.Header>
						<LayerCard.Body className="divide-y divide-basalt-border/60">
							{recommendations.map((item) => (
								<div key={item.title} className="py-basalt-card-sm first:pt-0 last:pb-0">
									<p className="text-basalt-base text-basalt-foreground">{item.title}</p>
									<span className="text-basalt-sm text-basalt-muted-foreground">{item.status}</span>
								</div>
							))}
						</LayerCard.Body>
					</LayerCard>

					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<Brain className="size-basalt-icon-lg text-basalt-muted-foreground" />
							<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
								Insight timeline
							</h2>
						</LayerCard.Header>
						<LayerCard.Body>
							<Timeline
								ariaLabel="Insight timeline"
								items={insightTimeline.map((event) => ({
									id: event.id,
									at: event.time,
									title: `${event.title} · ${event.subtitle}`,
								}))}
							/>
						</LayerCard.Body>
					</LayerCard>
				</div>
			</SectionRule>
			<DashboardTemplateAnatomy
				patternSummary="Daily slot bars, 365-day activity heatmap, weekly telemetry charts, timeline stream, and prompt studio."
				layoutNote="SectionRule anchors divide telemetry, trends, and insights cleanly with responsive 12/16/24px card spacing."
				components={["stat-card", "section-rule", "layer-card", "chart", "textarea", "button"]}
			/>
		</ShowcasePage>
	);
}
