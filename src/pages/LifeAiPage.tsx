import { Activity, Heart, Moon, Flame, Clock, BarChart3, TrendingUp } from "lucide-react";
import { useLifeAiViewModel } from "@/viewmodels/useLifeAiViewModel";
import { StatCardWidget, StatGrid } from "@/components/dashboard/StatCardWidget";
import { HeatmapCalendar, heatmapColorScales } from "@/components/dashboard/HeatmapCalendar";
import { LineChartWidget } from "@/components/dashboard/LineChartWidget";
import { BarChartWidget } from "@/components/dashboard/BarChartWidget";
import { DonutChartWidget } from "@/components/dashboard/PieChartWidget";
import { TimelineWidget } from "@/components/dashboard/TimelineWidget";
import { DateNavigationWidget } from "@/components/dashboard/DateNavigationWidget";
import { chart } from "@/lib/palette";

const statIcons = [Activity, Moon, Heart, Flame] as const;

export default function LifeAiPage() {
  const vm = useLifeAiViewModel();

  return (
    <>
      {/* Date navigation */}
      <DateNavigationWidget
        selectedDate={vm.selectedDate}
        onPrevDay={vm.goToPrevDay}
        onNextDay={vm.goToNextDay}
        onToday={vm.goToToday}
      />

      {/* Stat cards */}
      <div className="mt-4">
        <StatGrid columns={4}>
          {vm.stats.map((stat, i) => (
            <StatCardWidget
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              trend={stat.trend}
              icon={statIcons[i]}
            />
          ))}
        </StatGrid>
      </div>

      {/* Charts row: weekly steps bar + monthly sleep line */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Weekly Steps</p>
          </div>
          <BarChartWidget data={vm.weeklySteps} height={200} color={chart.green} />
        </div>

        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Monthly Sleep (hours)</p>
          </div>
          <LineChartWidget
            data={vm.monthlySleep}
            height={200}
            color={chart.indigo}
            valueFormatter={(v) => `${v}h`}
          />
        </div>
      </div>

      {/* Activity breakdown donut + timeline side by side */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Activity Breakdown</p>
          </div>
          <DonutChartWidget
            data={vm.activityBreakdown}
            height={220}
            showLegend
          />
        </div>

        <div className="rounded-card bg-secondary p-4 md:p-5 lg:col-span-2 max-h-[400px] overflow-y-auto">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              Daily Timeline
              <span className="ml-2 text-xs">
                ({vm.activeEventCount} activities, {vm.totalCalories} kcal)
              </span>
            </p>
          </div>
          <TimelineWidget events={vm.timeline} />
        </div>
      </div>

      {/* Heatmap calendar */}
      <div className="mt-4 rounded-card bg-secondary p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Activity Heatmap — 2026</p>
        </div>
        <HeatmapCalendar
          data={vm.heatmapData}
          year={2026}
          colorScale={heatmapColorScales.green}
          metricLabel="Activities"
        />
      </div>
    </>
  );
}
