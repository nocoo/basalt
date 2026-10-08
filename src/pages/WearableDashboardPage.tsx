import { DateNavigation } from "@nocoo/basalt/charts/date-navigation";
import { HeatmapCalendar, heatmapColorScales } from "@nocoo/basalt/charts/heatmap-calendar";
import { SlotBarChart } from "@nocoo/basalt/charts/slot-bar";
import { StatCard, StatGrid } from "@nocoo/basalt/charts/stat-card";
import { Timeline } from "@nocoo/basalt/charts/timeline";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Activity, Clock, Flame, Footprints, Heart, Moon, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BarChartWidget } from "@/components/dashboard/BarChartWidget";
import { LineChartWidget } from "@/components/dashboard/LineChartWidget";
import { DonutChartWidget } from "@/components/dashboard/PieChartWidget";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatPercent } from "@/lib/format";
import { chart } from "@/lib/palette";

const weeklySteps = [
	{ label: "Mon", value: 9800 },
	{ label: "Tue", value: 11200 },
	{ label: "Wed", value: 12480 },
	{ label: "Thu", value: 10600 },
	{ label: "Fri", value: 13240 },
	{ label: "Sat", value: 14800 },
	{ label: "Sun", value: 12120 },
];

const recoveryTrend = [
	{ label: "Week 1", value: 72 },
	{ label: "Week 2", value: 78 },
	{ label: "Week 3", value: 82 },
	{ label: "Week 4", value: 86 },
];

const activityBreakdown = [
	{ label: "Walking", value: 42 },
	{ label: "Training", value: 28 },
	{ label: "Yoga", value: 18 },
	{ label: "Recovery", value: 12 },
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
	const noise = Math.sin(i * 91.337) * 10000;
	const random = noise - Math.floor(noise);
	const value = Math.max(1, Math.round(2 + random * 10));
	return { date: date.toISOString().slice(0, 10), value };
});

export default function WearableDashboardPage() {
	const { t, i18n } = useTranslation();

	const statCards = [
		{
			title: t("pages.wearable.steps"),
			value: "12,480",
			subtitle: t("pages.wearable.goal14k"),
			icon: Footprints,
			trend: { value: 5.2, label: t("common.vsLastWeek") },
		},
		{
			title: t("pages.wearable.calories"),
			value: "2,460",
			subtitle: t("pages.wearable.activeBurn"),
			icon: Flame,
			trend: { value: 3.1, label: t("common.vsLastWeek") },
		},
		{
			title: t("pages.wearable.heartRate"),
			value: "68 bpm",
			subtitle: t("pages.wearable.restingAvg"),
			icon: Heart,
			trend: { value: -1.4, label: t("common.vsLastWeek") },
		},
		{
			title: t("pages.wearable.sleep"),
			value: "7h 42m",
			subtitle: t("pages.wearable.consistency84"),
			icon: Moon,
			trend: { value: 2.6, label: t("common.vsLastWeek") },
		},
	];

	const timeline = [
		{
			id: "t1",
			time: "06:10",
			title: t("pages.wearable.wakeUp"),
			subtitle: t("pages.wearable.recoveryScore86"),
			color: "bg-indigo-500",
		},
		{
			id: "t2",
			time: "07:30",
			title: t("pages.wearable.morningWalk"),
			subtitle: "3.2 km",
			color: "bg-green-600",
		},
		{
			id: "t3",
			time: "12:40",
			title: t("pages.wearable.hydration"),
			subtitle: "600 ml",
			color: "bg-blue-500",
		},
		{
			id: "t4",
			time: "18:10",
			title: t("pages.wearable.training"),
			subtitle: t("pages.wearable.strength45m"),
			color: "bg-orange-500",
		},
		{
			id: "t5",
			time: "21:30",
			title: t("pages.wearable.windDown"),
			subtitle: t("pages.wearable.stretchBreath"),
			color: "bg-purple-500",
		},
	];

	return (
		<ShowcasePage
			title={t("pages.wearable.title")}
			description={t("pages.wearable.description")}
			size="lg"
		>
			<SectionRule
				title={t("pages.wearable.todaySummary")}
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
					<StatCard key={stat.title} {...stat} />
				))}
			</StatGrid>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Moon className="h-4 w-4 text-indigo-500" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.wearable.sleepStages")}
						</h2>
						<span className="ml-auto text-basalt-base font-semibold text-indigo-500">7h 42m</span>
					</LayerCard.Header>
					<LayerCard.Body>
						<SlotBarChart items={sleepSlots} />
					</LayerCard.Body>
				</LayerCard>
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Heart className="h-4 w-4 text-red-500" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.wearable.heartRateZones")}
						</h2>
						<span className="ml-auto text-basalt-base font-semibold text-red-500">68 bpm</span>
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
							{t("pages.wearable.weeklySteps")}
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
							{t("pages.wearable.recoveryTrend")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<LineChartWidget
							data={recoveryTrend}
							height={200}
							color={chart.indigo}
							valueFormatter={(v) => `${v}%`}
						/>
					</LayerCard.Body>
				</LayerCard>
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.wearable.activityMix")}
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
				<LayerCard className="lg:col-span-2 max-h-[26.25rem] overflow-y-auto">
					<LayerCard.Header className="items-center justify-start">
						<Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.wearable.dailyTimeline")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<Timeline events={timeline} />
					</LayerCard.Body>
				</LayerCard>
			</div>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base text-muted-foreground">
						{t("pages.wearable.workoutConsistency2026")}
					</h2>
				</LayerCard.Header>
				<LayerCard.Body>
					<HeatmapCalendar
						data={heatmapData}
						year={2026}
						colorScale={heatmapColorScales.green}
						metricLabel={t("pages.wearable.workouts")}
						locale={i18n.language}
						lessLabel={t("common.less")}
						moreLabel={t("common.more")}
					/>
				</LayerCard.Body>
			</LayerCard>
		</ShowcasePage>
	);
}
