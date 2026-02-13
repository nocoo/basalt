import { Sparkles, Brain, ShieldCheck, Cpu, Zap, MessageSquare, CheckCircle2, AlertTriangle } from "lucide-react";
import { StatCardWidget, StatGrid } from "@/components/dashboard/StatCardWidget";
import { LineChartWidget } from "@/components/dashboard/LineChartWidget";
import { BarChartWidget } from "@/components/dashboard/BarChartWidget";
import { TimelineWidget } from "@/components/dashboard/TimelineWidget";
import { chart } from "@/lib/palette";
import { PageIntro } from "@/components/PageIntro";

const statCards = [
  { title: "Insight Score", value: "92", subtitle: "Quality tier A", icon: Brain, trend: { value: 4.2, label: "vs last week" } },
  { title: "Risk Alerts", value: "3", subtitle: "2 resolved", icon: AlertTriangle, trend: { value: -1.5, label: "vs last week" } },
  { title: "Automation", value: "68%", subtitle: "Tasks handled", icon: Zap, trend: { value: 6.8, label: "vs last month" } },
  { title: "Data Freshness", value: "2h", subtitle: "Avg lag", icon: Cpu, trend: { value: -12, label: "vs yesterday" } },
];

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

const insightTimeline = [
  { id: "i1", time: "07:30", title: "Sleep debt detected", subtitle: "Recommend early wind down", color: "bg-indigo-500" },
  { id: "i2", time: "09:10", title: "Hydration dip", subtitle: "Add 400ml before noon", color: "bg-blue-500" },
  { id: "i3", time: "13:20", title: "Focus window", subtitle: "Schedule deep work block", color: "bg-green-600" },
  { id: "i4", time: "17:40", title: "Recovery needed", subtitle: "Light movement recommended", color: "bg-orange-500" },
];

const recommendations = [
  { title: "Shift bedtime by 30 minutes", status: "New" },
  { title: "Add a 20-minute walk", status: "Active" },
  { title: "Reduce caffeine after 3 PM", status: "Active" },
  { title: "Plan protein-forward lunch", status: "Queued" },
];

export default function LifeAiPage() {
  return (
    <div className="space-y-4">
      <PageIntro
        title="Life.ai daily insights"
        description="An AI layer that summarizes patterns, ranks risks, and generates next-step actions."
        eyebrow="Life.ai"
        icon={Sparkles}
      />

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
            <ShieldCheck className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">AI readiness trend</p>
          </div>
          <LineChartWidget data={readinessTrend} height={200} color={chart.primary} />
        </div>
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Recommendation impact</p>
          </div>
          <BarChartWidget data={recommendationImpact} height={200} color={chart.teal} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Prompt studio</p>
          </div>
          <textarea
            rows={5}
            placeholder="Ask Life.ai to summarize your week or set a focus goal..."
            className="w-full rounded-widget border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {["Summarize week", "Improve sleep", "Boost focus", "Plan recovery"].map((chip) => (
              <button key={chip} className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground">
                {chip}
              </button>
            ))}
          </div>
          <button className="mt-4 w-full rounded-widget bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Generate insight
          </button>
        </div>

        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Recommended actions</p>
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
            <p className="text-sm text-muted-foreground">Insight timeline</p>
          </div>
          <TimelineWidget events={insightTimeline} />
        </div>
      </div>
    </div>
  );
}
