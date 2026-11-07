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
import { cn } from "@/lib/utils";
import {
	useWearableDashboardViewModel,
	type WearableLegendItem,
	type WearableMetric,
} from "@/viewmodels/useWearableDashboardViewModel";

const heatmapData = Array.from({ length: 365 }).map((_, i) => {
	const date = new Date(2026, 0, 1 + i);
	const noise = Math.sin(i * 91.337) * 10000;
	const random = noise - Math.floor(noise);
	const value = Math.max(1, Math.round(2 + random * 10));
	return { date: date.toISOString().slice(0, 10), value };
});

const METRIC_ICONS: Record<WearableMetric, typeof Footprints> = {
	steps: Footprints,
	calories: Flame,
	heartRate: Heart,
	sleep: Moon,
};

function SlotLegend({ items }: { items: WearableLegendItem[] }) {
	return (
		<ul className="mt-basalt-space-lg flex flex-wrap items-center gap-x-basalt-layout-sm gap-y-basalt-space-sm">
			{items.map((item) => (
				<li key={item.label} className="flex items-center gap-basalt-space-sm">
					<span
						aria-hidden="true"
						className={cn("h-basalt-2 w-basalt-2 rounded-basalt-full", item.swatch)}
					/>
					<span className="text-basalt-sm text-muted-foreground">{item.label}</span>
					<span className="text-basalt-sm font-medium text-basalt-foreground">{item.value}</span>
				</li>
			))}
		</ul>
	);
}

export default function WearableDashboardPage() {
	const { t, i18n } = useTranslation();
	const {
		selectedDate,
		onPrevDay,
		onNextDay,
		onToday,
		statCards,
		sleep,
		heart,
		weeklySteps,
		recoveryTrend,
		activityBreakdown,
		timeline,
	} = useWearableDashboardViewModel(t, i18n.language);
	const [stepsCard, , heartCard, sleepCard] = statCards;

	return (
		<ShowcasePage title={t("pages.wearable.title")} description={t("pages.wearable.description")}>
			<SectionRule
				title={t("pages.wearable.todaySummary")}
				actions={
					<DateNavigation
						selectedDate={selectedDate}
						onPrevDay={onPrevDay}
						onNextDay={onNextDay}
						onToday={onToday}
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
						key={stat.metric}
						title={stat.title}
						value={stat.value}
						subtitle={stat.subtitle}
						icon={METRIC_ICONS[stat.metric]}
						trend={stat.trend}
					/>
				))}
			</StatGrid>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Moon className="h-4 w-4 text-basalt-primary" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.wearable.sleepStages")}
						</h2>
						<span className="ml-auto text-basalt-base font-semibold text-basalt-primary">
							{sleepCard.value}
						</span>
					</LayerCard.Header>
					<LayerCard.Body>
						<SlotBarChart items={sleep.slots} ariaLabel={sleep.ariaLabel} />
						<SlotLegend items={sleep.legend} />
					</LayerCard.Body>
				</LayerCard>
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<Heart className="h-4 w-4 text-basalt-destructive" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.wearable.heartRateZones")}
						</h2>
						<span className="ml-auto text-basalt-base font-semibold text-basalt-destructive">
							{heartCard.value}
						</span>
					</LayerCard.Header>
					<LayerCard.Body>
						<SlotBarChart items={heart.slots} ariaLabel={heart.ariaLabel} />
						<SlotLegend items={heart.legend} />
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
						<span className="ml-auto text-basalt-base font-semibold text-muted-foreground">
							{stepsCard.value}
						</span>
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
				<LayerCard className="lg:col-span-2">
					<LayerCard.Header className="items-center justify-start">
						<Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.wearable.dailyTimeline")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body className="max-h-[22rem] overflow-y-auto">
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
