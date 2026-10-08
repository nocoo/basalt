import { DateNavigation } from "@nocoo/basalt/charts/date-navigation";
import { HeatmapCalendar, heatmapColorScales } from "@nocoo/basalt/charts/heatmap-calendar";
import { SlotBarChart } from "@nocoo/basalt/charts/slot-bar";
import { StatCard, StatGrid } from "@nocoo/basalt/charts/stat-card";
import { Timeline } from "@nocoo/basalt/charts/timeline";
import { Button } from "@nocoo/basalt/components/button";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
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
import { useTranslation } from "react-i18next";
import { BarChartWidget } from "@/components/dashboard/BarChartWidget";
import { LineChartWidget } from "@/components/dashboard/LineChartWidget";
import { DonutChartWidget } from "@/components/dashboard/PieChartWidget";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatPercent } from "@/lib/format";
import { chart } from "@/lib/palette";

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
		i < 6 ? "bg-indigo-800" : i < 10 ? "bg-indigo-500" : i < 16 ? "bg-green-600" : "bg-orange-500",
	label: `Hour ${i}`,
}));

const heartRateSlots = Array.from({ length: 24 }).map((_, i) => ({
	color:
		i < 8 ? "bg-green-600" : i < 16 ? "bg-yellow-600" : i < 20 ? "bg-orange-600" : "bg-red-600",
	label: `Hour ${i}`,
}));

const heatmapData = Array.from({ length: 365 }).map((_, i) => {
	const date = new Date(2026, 0, 1 + i);
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

export default function HealthPage() {
	const { t, i18n } = useTranslation();

	const statCards = [
		{
			title: t("pages.health.steps"),
			value: "9,840",
			subtitle: t("pages.health.dailyTarget12k"),
			icon: Footprints,
			trend: { value: 6.2, label: t("common.vsLastWeek") },
		},
		{
			title: t("pages.health.calories"),
			value: "2,130",
			subtitle: t("pages.health.burnedToday"),
			icon: Flame,
			trend: { value: -1.4, label: t("common.vsYesterday") },
		},
		{
			title: t("pages.health.hydration"),
			value: "2.4L",
			subtitle: t("pages.health.goal3L"),
			icon: Droplet,
			trend: { value: 8.3, label: t("common.vsLastWeek") },
		},
		{
			title: t("pages.health.sleep"),
			value: "7h 24m",
			subtitle: t("pages.health.consistency82"),
			icon: Moon,
			trend: { value: 2.1, label: t("common.vsLastWeek") },
		},
	];

	const aiStatCards = [
		{
			title: t("pages.health.insightScore"),
			value: "92",
			subtitle: t("pages.health.qualityTierA"),
			icon: Brain,
			trend: { value: 4.2, label: t("common.vsLastWeek") },
		},
		{
			title: t("pages.health.riskAlerts"),
			value: "3",
			subtitle: t("pages.health.resolved2"),
			icon: AlertTriangle,
			trend: { value: -1.5, label: t("common.vsLastWeek") },
		},
		{
			title: t("pages.health.automation"),
			value: "68%",
			subtitle: t("pages.health.tasksHandled"),
			icon: Zap,
			trend: { value: 6.8, label: t("common.vsLastMonth") },
		},
	];

	const timelineEvents = [
		{
			id: "t1",
			time: "06:30",
			title: t("pages.health.wakeUp"),
			subtitle: t("pages.health.rested"),
			color: "bg-indigo-500",
		},
		{
			id: "t2",
			time: "07:10",
			title: t("pages.health.hydration"),
			subtitle: "400ml",
			color: "bg-blue-500",
		},
		{
			id: "t3",
			time: "12:20",
			title: t("pages.health.walk"),
			subtitle: "3.2km",
			color: "bg-green-600",
		},
		{
			id: "t4",
			time: "18:10",
			title: t("pages.health.workout"),
			subtitle: t("pages.health.strength45m"),
			color: "bg-orange-500",
		},
		{
			id: "t5",
			time: "21:40",
			title: t("pages.health.windDown"),
			subtitle: t("pages.health.stretching"),
			color: "bg-indigo-400",
		},
	];

	const insightTimeline = [
		{
			id: "i1",
			time: "07:30",
			title: t("pages.health.sleepDebtDetected"),
			subtitle: t("pages.health.recommendEarlyWindDown"),
			color: "bg-indigo-500",
		},
		{
			id: "i2",
			time: "09:10",
			title: t("pages.health.hydrationDip"),
			subtitle: t("pages.health.add400mlBeforeNoon"),
			color: "bg-blue-500",
		},
		{
			id: "i3",
			time: "13:20",
			title: t("pages.health.focusWindow"),
			subtitle: t("pages.health.scheduleDeepWorkBlock"),
			color: "bg-green-600",
		},
		{
			id: "i4",
			time: "17:40",
			title: t("pages.health.recoveryNeeded"),
			subtitle: t("pages.health.lightMovementRecommended"),
			color: "bg-orange-500",
		},
	];

	const recommendations = [
		{ title: t("pages.health.shiftBedtime"), status: t("pages.health.new") },
		{ title: t("pages.health.addWalk"), status: t("pages.health.active") },
		{ title: t("pages.health.reduceCaffeine"), status: t("pages.health.active") },
		{ title: t("pages.health.planProteinLunch"), status: t("pages.health.queued") },
	];

	return (
		<ShowcasePage title={t("pages.health.title")} description={t("pages.health.description")}>
			<SectionRule
				title={t("pages.health.today")}
				actions={
					<DateNavigation
						selectedDate={new Date(2026, 1, 13)}
						onPrevDay={() => {}}
						onNextDay={() => {}}
						onToday={() => {}}
						todayLabel={t("common.today")}
						previousDayLabel={t("common.previousDay")}
						nextDayLabel={t("common.nextDay")}
						locale={i18n.language}
					/>
				}
			/>

			<StatGrid columns={4}>
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
						<Moon className="h-4 w-4 text-indigo-500" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.health.sleepStages")}
						</h2>
						<span className="ml-auto text-basalt-base font-semibold text-indigo-500">7h 24m</span>
					</LayerCard.Header>
					<LayerCard.Body>
						<SlotBarChart items={sleepSlots} />
					</LayerCard.Body>
				</LayerCard>
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Heart className="h-4 w-4 text-red-500" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.health.heartRateZones")}
						</h2>
						<span className="ml-auto text-basalt-base font-semibold text-red-500">72 bpm</span>
					</LayerCard.Header>
					<LayerCard.Body>
						<SlotBarChart items={heartRateSlots} />
					</LayerCard.Body>
				</LayerCard>
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Footprints className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.health.weeklySteps")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<BarChartWidget data={weeklySteps} height={200} color={chart.green} />
					</LayerCard.Body>
				</LayerCard>
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Sparkles className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.health.monthlySleepTrend")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<LineChartWidget
							data={monthlySleep}
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
						<Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.health.activityBreakdown")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<DonutChartWidget
							data={activityBreakdown}
							height={220}
							showLegend
							valueFormatter={formatPercent}
						/>
					</LayerCard.Body>
				</LayerCard>
				<LayerCard className="lg:col-span-2 max-h-[25rem] overflow-y-auto">
					<LayerCard.Header className="items-center justify-start">
						<Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.health.dailyTimeline")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<Timeline events={timelineEvents} />
					</LayerCard.Body>
				</LayerCard>
			</div>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base text-muted-foreground">
						{t("pages.health.activityHeatmap2026")}
					</h2>
				</LayerCard.Header>
				<LayerCard.Body>
					<HeatmapCalendar
						data={heatmapData}
						year={2026}
						colorScale={heatmapColorScales.green}
						metricLabel={t("pages.health.activities")}
						locale={i18n.language}
						lessLabel={t("common.less")}
						moreLabel={t("common.more")}
					/>
				</LayerCard.Body>
			</LayerCard>

			<SectionRule title={t("pages.health.lifeAiInsights")}>
				<StatGrid columns={3}>
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
							<ShieldCheck className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
							<h2 className="text-basalt-base text-muted-foreground">
								{t("pages.health.aiReadinessTrend")}
							</h2>
						</LayerCard.Header>
						<LayerCard.Body>
							<LineChartWidget
								data={readinessTrend}
								height={200}
								color={chart.primary}
								valueFormatter={formatPercent}
							/>
						</LayerCard.Body>
					</LayerCard>
					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<Zap className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
							<h2 className="text-basalt-base text-muted-foreground">
								{t("pages.health.recommendationImpact")}
							</h2>
						</LayerCard.Header>
						<LayerCard.Body>
							<BarChartWidget data={recommendationImpact} height={200} color={chart.teal} />
						</LayerCard.Body>
					</LayerCard>
				</div>

				<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<MessageSquare className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
							<h2 className="text-basalt-base text-muted-foreground">
								{t("pages.health.promptStudio")}
							</h2>
						</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-space-lg">
							<InputArea
								rows={5}
								placeholder={t("pages.health.promptPlaceholder")}
								aria-label={t("pages.health.promptStudio")}
							/>
							<div className="flex flex-wrap gap-basalt-space-lg">
								{[
									t("pages.health.summarizeWeek"),
									t("pages.health.improveSleep"),
									t("pages.health.boostFocus"),
									t("pages.health.planRecovery"),
								].map((chip) => (
									<Button
										variant="ghost"
										type="button"
										key={chip}
										className="text-muted-foreground"
									>
										{chip}
									</Button>
								))}
							</div>
							<Button className="w-full">{t("pages.health.generateInsight")}</Button>
						</LayerCard.Body>
					</LayerCard>

					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<CheckCircle2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
							<h2 className="text-basalt-base text-muted-foreground">
								{t("pages.health.recommendedActions")}
							</h2>
						</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-space-lg">
							{recommendations.map((item) => (
								<LayerCard key={item.title}>
									<p className="text-basalt-base text-foreground">{item.title}</p>
									<span className="text-basalt-sm text-muted-foreground">{item.status}</span>
								</LayerCard>
							))}
						</LayerCard.Body>
					</LayerCard>

					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<Brain className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
							<h2 className="text-basalt-base text-muted-foreground">
								{t("pages.health.insightTimeline")}
							</h2>
						</LayerCard.Header>
						<LayerCard.Body>
							<Timeline events={insightTimeline} />
						</LayerCard.Body>
					</LayerCard>
				</div>
			</SectionRule>
		</ShowcasePage>
	);
}
