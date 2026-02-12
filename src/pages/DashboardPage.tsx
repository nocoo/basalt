import { SummaryMetricCard } from "@/components/dashboard/SummaryMetricCard";
import { SecondaryMetricCard } from "@/components/dashboard/SecondaryMetricCard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { TrendLineCard } from "@/components/dashboard/TrendLineCard";
import { DonutChartCard } from "@/components/dashboard/DonutChartCard";
import { RecentListCard } from "@/components/dashboard/RecentListCard";
import { ActionGridCard } from "@/components/dashboard/ActionGridCard";
import { ItemListCard } from "@/components/dashboard/ItemListCard";
import { RadialProgressCard } from "@/components/dashboard/RadialProgressCard";
import { AreaChartCard } from "@/components/dashboard/AreaChartCard";
import { GaugeCard } from "@/components/dashboard/GaugeCard";
import { GroupedBarCard } from "@/components/dashboard/GroupedBarCard";

export default function DashboardPage() {
  return (
    <>
      {/* Row 1: 3 summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SummaryMetricCard />
        <SecondaryMetricCard />
        <TrendLineCard />
      </div>

      {/* Row 2: wide bar chart + donut */}
      <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarChartCard />
        </div>
        <DonutChartCard />
      </div>

      {/* Row 3: wide area chart + 2 radial cards */}
      <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AreaChartCard />
        </div>
        <div className="flex flex-col gap-4">
          <RadialProgressCard />
          <GaugeCard />
        </div>
      </div>

      {/* Row 4: wide grouped bar chart + transactions */}
      <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GroupedBarCard />
        </div>
        <RecentListCard />
      </div>

      {/* Row 5: quick actions + accounts */}
      <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
        <ActionGridCard />
        <ItemListCard />
      </div>
    </>
  );
}
