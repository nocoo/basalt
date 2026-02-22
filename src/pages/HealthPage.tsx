import { Activity, Heart, Moon, Flame, Droplet, Footprints, Sparkles, Brain, ShieldCheck, Zap, MessageSquare, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageIntro } from "@/components/PageIntro";
import { StatCardWidget, StatGrid } from "@/components/dashboard/StatCardWidget";
import { DateNavigationWidget } from "@/components/dashboard/DateNavigationWidget";
import { SlotBarChart } from "@/components/dashboard/SlotBarChart";
import { BarChartWidget } from "@/components/dashboard/BarChartWidget";
import { LineChartWidget } from "@/components/dashboard/LineChartWidget";
import { DonutChartWidget } from "@/components/dashboard/PieChartWidget";
import { HeatmapCalendar, heatmapColorScales } from "@/components/dashboard/HeatmapCalendar";
import { TimelineWidget } from "@/components/dashboard/TimelineWidget";
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
  color: i < 6 ? "bg-indigo-800" : i < 10 ? "bg-indigo-500" : i < 16 ? "bg-green-600" : "bg-orange-500",
  label: `Hour ${i}`,
}));

const heartRateSlots = Array.from({ length: 24 }).map((_, i) => ({
  color: i < 8 ? "bg-green-600" : i < 16 ? "bg-yellow-600" : i < 20 ? "bg-orange-600" : "bg-red-600",
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
  const { t } = useTranslation();

  const statCards = [
    { title: t("pages.health.steps"), value: "9,840", subtitle: t("pages.health.dailyTarget12k"), icon: Footprints, trend: { value: 6.2, label: t("common.vsLastWeek") } },
    { title: t("pages.health.calories"), value: "2,130", subtitle: t("pages.health.burnedToday"), icon: Flame, trend: { value: -1.4, label: t("common.vsYesterday") } },
    { title: t("pages.health.hydration"), value: "2.4L", subtitle: t("pages.health.goal3L"), icon: Droplet, trend: { value: 8.3, label: t("common.vsLastWeek") } },
    { title: t("pages.health.sleep"), value: "7h 24m", subtitle: t("pages.health.consistency82"), icon: Moon, trend: { value: 2.1, label: t("common.vsLastWeek") } },
  ];

  const aiStatCards = [
    { title: t("pages.health.insightScore"), value: "92", subtitle: t("pages.health.qualityTierA"), icon: Brain, trend: { value: 4.2, label: t("common.vsLastWeek") } },
    { title: t("pages.health.riskAlerts"), value: "3", subtitle: t("pages.health.resolved2"), icon: AlertTriangle, trend: { value: -1.5, label: t("common.vsLastWeek") } },
    { title: t("pages.health.automation"), value: "68%", subtitle: t("pages.health.tasksHandled"), icon: Zap, trend: { value: 6.8, label: t("common.vsLastMonth") } },
  ];

  const timelineEvents = [
    { id: "t1", time: "06:30", title: t("pages.health.wakeUp"), subtitle: t("pages.health.rested"), color: "bg-indigo-500" },
    { id: "t2", time: "07:10", title: t("pages.health.hydration"), subtitle: "400ml", color: "bg-blue-500" },
    { id: "t3", time: "12:20", title: t("pages.health.walk"), subtitle: "3.2km", color: "bg-green-600" },
    { id: "t4", time: "18:10", title: t("pages.health.workout"), subtitle: t("pages.health.strength45m"), color: "bg-orange-500" },
    { id: "t5", time: "21:40", title: t("pages.health.windDown"), subtitle: t("pages.health.stretching"), color: "bg-indigo-400" },
  ];

  const insightTimeline = [
    { id: "i1", time: "07:30", title: t("pages.health.sleepDebtDetected"), subtitle: t("pages.health.recommendEarlyWindDown"), color: "bg-indigo-500" },
    { id: "i2", time: "09:10", title: t("pages.health.hydrationDip"), subtitle: t("pages.health.add400mlBeforeNoon"), color: "bg-blue-500" },
    { id: "i3", time: "13:20", title: t("pages.health.focusWindow"), subtitle: t("pages.health.scheduleDeepWorkBlock"), color: "bg-green-600" },
    { id: "i4", time: "17:40", title: t("pages.health.recoveryNeeded"), subtitle: t("pages.health.lightMovementRecommended"), color: "bg-orange-500" },
  ];

  const recommendations = [
    { title: t("pages.health.shiftBedtime"), status: t("pages.health.new") },
    { title: t("pages.health.addWalk"), status: t("pages.health.active") },
    { title: t("pages.health.reduceCaffeine"), status: t("pages.health.active") },
    { title: t("pages.health.planProteinLunch"), status: t("pages.health.queued") },
  ];

  return (
    <div className="space-y-4">
      <PageIntro
        title={t("pages.health.title")}
        description={t("pages.health.description")}
        eyebrow={t("pages.health.eyebrow")}
        icon={Activity}
      />

      <div className="rounded-card bg-secondary p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.today")}</p>
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
          <StatCardWidget
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-500" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.sleepStages")}</p>
            <span className="ml-auto text-sm font-semibold text-indigo-500">7h 24m</span>
          </div>
          <SlotBarChart items={sleepSlots} />
        </div>
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.heartRateZones")}</p>
            <span className="ml-auto text-sm font-semibold text-red-500">72 bpm</span>
          </div>
          <SlotBarChart items={heartRateSlots} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Footprints className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.weeklySteps")}</p>
          </div>
          <BarChartWidget data={weeklySteps} height={200} color={chart.green} />
        </div>
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.monthlySleepTrend")}</p>
          </div>
          <LineChartWidget data={monthlySleep} height={200} color={chart.indigo} valueFormatter={(v) => `${v}h`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.activityBreakdown")}</p>
          </div>
          <DonutChartWidget data={activityBreakdown} height={220} showLegend />
        </div>
        <div className="rounded-card bg-secondary p-4 md:p-5 lg:col-span-2 max-h-[400px] overflow-y-auto">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.dailyTimeline")}</p>
          </div>
          <TimelineWidget events={timelineEvents} />
        </div>
      </div>

      <div className="rounded-card bg-secondary p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">{t("pages.health.activityHeatmap2026")}</p>
        </div>
        <HeatmapCalendar
          data={heatmapData}
          year={2026}
          colorScale={heatmapColorScales.green}
          metricLabel={t("pages.health.activities")}
        />
      </div>

      {/* Life.ai insights */}
      <div className="flex items-center gap-2 pt-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-sm font-medium text-muted-foreground">{t("pages.health.lifeAiInsights")}</p>
      </div>

      <StatGrid columns={3}>
        {aiStatCards.map((stat) => (
          <StatCardWidget
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.aiReadinessTrend")}</p>
          </div>
          <LineChartWidget data={readinessTrend} height={200} color={chart.primary} />
        </div>
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.recommendationImpact")}</p>
          </div>
          <BarChartWidget data={recommendationImpact} height={200} color={chart.teal} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.promptStudio")}</p>
          </div>
          <textarea
            rows={5}
            placeholder={t("pages.health.promptPlaceholder")}
            className="w-full rounded-widget border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {[t("pages.health.summarizeWeek"), t("pages.health.improveSleep"), t("pages.health.boostFocus"), t("pages.health.planRecovery")].map((chip) => (
              <button key={chip} className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground">
                {chip}
              </button>
            ))}
          </div>
          <button className="mt-4 w-full rounded-widget bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {t("pages.health.generateInsight")}
          </button>
        </div>

        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.recommendedActions")}</p>
          </div>
          <div className="space-y-3">
            {recommendations.map((item) => (
              <div key={item.title} className="rounded-widget border border-border bg-card p-3">
                <p className="text-sm text-foreground">{item.title}</p>
                <span className="text-xs text-muted-foreground">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">{t("pages.health.insightTimeline")}</p>
          </div>
          <TimelineWidget events={insightTimeline} />
        </div>
      </div>
    </div>
  );
}
