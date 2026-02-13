import { Router, Activity, Wifi, Server, AlertTriangle, Clock } from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import { StatCardWidget, StatGrid } from "@/components/dashboard/StatCardWidget";
import { LineChartWidget } from "@/components/dashboard/LineChartWidget";
import { StackedAreaCard } from "@/components/dashboard/StackedAreaCard";
import { StackedBarCard } from "@/components/dashboard/StackedBarCard";
import { SankeyCard } from "@/components/dashboard/SankeyCard";
import { RadarChartCard } from "@/components/dashboard/RadarChartCard";
import { HeatmapCard } from "@/components/dashboard/HeatmapCard";
import { TimelineWidget } from "@/components/dashboard/TimelineWidget";
import { chart } from "@/lib/palette";

const statCards = [
  { title: "Uptime", value: "99.98%", subtitle: "30 days", icon: Server, trend: { value: 0.02, label: "vs last month" } },
  { title: "Latency", value: "18 ms", subtitle: "Avg RTT", icon: Wifi, trend: { value: -4.2, label: "vs last week" } },
  { title: "Packet Loss", value: "0.12%", subtitle: "Region avg", icon: AlertTriangle, trend: { value: -0.04, label: "vs last week" } },
  { title: "Throughput", value: "4.8 Gbps", subtitle: "Peak today", icon: Router, trend: { value: 6.4, label: "vs last week" } },
];

const latencyTrend = [
  { label: "00", value: 18 },
  { label: "04", value: 16 },
  { label: "08", value: 21 },
  { label: "12", value: 19 },
  { label: "16", value: 23 },
  { label: "20", value: 17 },
];

const incidents = [
  { id: "i1", time: "02:10", title: "Edge router spike", subtitle: "latency +12ms", color: "bg-amber-500" },
  { id: "i2", time: "08:45", title: "Packet loss", subtitle: "0.6% in us-east", color: "bg-red-500" },
  { id: "i3", time: "15:30", title: "BGP reconverge", subtitle: "reroute complete", color: "bg-green-600" },
];

export default function NetworkOpsDashboardPage() {
  return (
    <div className="space-y-4">
      <PageIntro
        title="Network operations dashboard"
        description="Router telemetry with uptime, latency, traffic mix, and incident timeline for operators."
        eyebrow="Network Ops"
        icon={Router}
      />

      <StatGrid columns={4}>
        {statCards.map((stat) => (
          <StatCardWidget key={stat.title} {...stat} />
        ))}
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Wifi className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Latency trend</p>
          </div>
          <LineChartWidget data={latencyTrend} height={220} color={chart.teal} valueFormatter={(v) => `${v}ms`} />
        </div>
        <StackedAreaCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StackedBarCard />
        <SankeyCard />
        <RadarChartCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <HeatmapCard />
        <div className="rounded-card bg-secondary p-4 md:p-5 lg:col-span-2 max-h-[420px] overflow-y-auto">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Incident timeline</p>
          </div>
          <TimelineWidget events={incidents} />
        </div>
      </div>
    </div>
  );
}
