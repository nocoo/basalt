import { Activity, Heart, Moon, Flame, Footprints, Sparkles, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageIntro } from "@/components/PageIntro";
import { StatCardWidget, StatGrid } from "@/components/dashboard/StatCardWidget";
import { DateNavigationWidget } from "@/components/dashboard/DateNavigationWidget";
import { SlotBarChart } from "@/components/dashboard/SlotBarChart";
import { LineChartWidget } from "@/components/dashboard/LineChartWidget";
import { BarChartWidget } from "@/components/dashboard/BarChartWidget";
import { DonutChartWidget } from "@/components/dashboard/PieChartWidget";
import { HeatmapCalendar, heatmapColorScales } from "@/components/dashboard/HeatmapCalendar";
import { TimelineWidget } from "@/components/dashboard/TimelineWidget";
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
  color: i < 6 ? "bg-indigo-800" : i < 10 ? "bg-indigo-500" : i < 16 ? "bg-green-600" : "bg-orange-500",
  label: `Hour ${i}`,
}));

const heartRateSlots = Array.from({ length: 24 }).map((_, i) => ({
  color: i < 8 ? "bg-green-600" : i < 16 ? "bg-yellow-600" : i < 20 ? "bg-orange-600" : "bg-red-600",
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
  const { t } = useTranslation();

  const statCards = [
    { title: t("pages.wearable.steps"), value: "12,480", subtitle: t("pages.wearable.goal14k"), icon: Footprints, trend: { value: 5.2, label: t("common.vsLastWeek") } },
    { title: t("pages.wearable.calories"), value: "2,460", subtitle: t("pages.wearable.activeBurn"), icon: Flame, trend: { value: 3.1, label: t("common.vsLastWeek") } },
    { title: t("pages.wearable.heartRate"), value: "68 bpm", subtitle: t("pages.wearable.restingAvg"), icon: Heart, trend: { value: -1.4, label: t("common.vsLastWeek") } },
    { title: t("pages.wearable.sleep"), value: "7h 42m", subtitle: t("pages.wearable.consistency84"), icon: Moon, trend: { value: 2.6, label: t("common.vsLastWeek") } },
  ];

  const timeline = [
    { id: "t1", time: "06:10", title: t("pages.wearable.wakeUp"), subtitle: t("pages.wearable.recoveryScore86"), color: "bg-indigo-500" },
    { id: "t2", time: "07:30", title: t("pages.wearable.morningWalk"), subtitle: "3.2 km", color: "bg-green-600" },
    { id: "t3", time: "12:40", title: t("pages.wearable.hydration"), subtitle: "600 ml", color: "bg-blue-500" },
    { id: "t4", time: "18:10", title: t("pages.wearable.training"), subtitle: t("pages.wearable.strength45m"), color: "bg-orange-500" },
    { id: "t5", time: "21:30", title: t("pages.wearable.windDown"), subtitle: t("pages.wearable.stretchBreath"), color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-4">
      <PageIntro
        title={t("pages.wearable.title")}
        description={t("pages.wearable.description")}
        eyebrow={t("pages.wearable.eyebrow")}
        icon={Activity}
      />

      <div className="rounded-card bg-secondary p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.wearable.todaySummary")}</p>
          </div>
          <DateNavigationWidget
            selectedDate={new Date(2026, 1, 13)}
            onPrevDay={() => {}}
            onNextDay={() => {}}
            onToday={() => {}}
          />
        </div>
      </div>

      <StatGrid columns={4}>
        {statCards.map((stat) => (
          <StatCardWidget key={stat.title} {...stat} />
        ))}
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-500" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.wearable.sleepStages")}</p>
            <span className="ml-auto text-sm font-semibold text-indigo-500">7h 42m</span>
          </div>
          <SlotBarChart items={sleepSlots} />
        </div>
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.wearable.heartRateZones")}</p>
            <span className="ml-auto text-sm font-semibold text-red-500">68 bpm</span>
          </div>
          <SlotBarChart items={heartRateSlots} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Footprints className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.wearable.weeklySteps")}</p>
          </div>
          <BarChartWidget data={weeklySteps} height={200} color={chart.green} />
        </div>
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.wearable.recoveryTrend")}</p>
          </div>
          <LineChartWidget data={recoveryTrend} height={200} color={chart.indigo} valueFormatter={(v) => `${v}%`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.wearable.activityMix")}</p>
          </div>
          <DonutChartWidget data={activityBreakdown} height={220} showLegend />
        </div>
        <div className="rounded-card bg-secondary p-4 md:p-5 lg:col-span-2 max-h-[420px] overflow-y-auto">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.wearable.dailyTimeline")}</p>
          </div>
          <TimelineWidget events={timeline} />
        </div>
      </div>

      <div className="rounded-card bg-secondary p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">{t("pages.wearable.workoutConsistency2026")}</p>
        </div>
        <HeatmapCalendar data={heatmapData} year={2026} colorScale={heatmapColorScales.green} metricLabel={t("pages.wearable.workouts")} />
      </div>
    </div>
  );
}
