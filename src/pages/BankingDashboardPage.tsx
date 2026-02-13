import { Landmark, CreditCard, TrendingUp, Wallet, ShieldCheck, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import { StatCardWidget, StatGrid } from "@/components/dashboard/StatCardWidget";
import { StackedAreaCard } from "@/components/dashboard/StackedAreaCard";
import { BulletChartCard } from "@/components/dashboard/BulletChartCard";
import { MiniDonutCard } from "@/components/dashboard/MiniDonutCard";
import { SankeyCard } from "@/components/dashboard/SankeyCard";
import { GroupedBarCard } from "@/components/dashboard/GroupedBarCard";
import { RadialProgressCard } from "@/components/dashboard/RadialProgressCard";
import { ItemListCard } from "@/components/dashboard/ItemListCard";
import { RecentListCard } from "@/components/dashboard/RecentListCard";

const statCards = [
  { title: "Assets", value: "$4.82M", subtitle: "Managed total", icon: Wallet, trend: { value: 4.8, label: "QoQ" } },
  { title: "Liquidity", value: "$620k", subtitle: "On-hand cash", icon: CreditCard, trend: { value: 2.1, label: "QoQ" } },
  { title: "Net Worth", value: "$3.12M", subtitle: "Household", icon: TrendingUp, trend: { value: 6.7, label: "YoY" } },
  { title: "Risk", value: "Low", subtitle: "Portfolio tilt", icon: ShieldCheck, trend: { value: -3.2, label: "YoY" } },
];

const transfers = [
  { name: "Wire transfer", amount: "$120k", direction: "in" },
  { name: "Mortgage payment", amount: "$4.8k", direction: "out" },
  { name: "Treasury coupon", amount: "$3.6k", direction: "in" },
];

export default function BankingDashboardPage() {
  return (
    <div className="space-y-4">
      <PageIntro
        title="Banking & wealth management dashboard"
        description="Professional banking view with portfolio mix, liquidity, cash flow, and compliance signals."
        eyebrow="Banking"
        icon={Landmark}
      />

      <StatGrid columns={4}>
        {statCards.map((stat) => (
          <StatCardWidget key={stat.title} {...stat} />
        ))}
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StackedAreaCard />
        <MiniDonutCard />
        <BulletChartCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SankeyCard />
        <GroupedBarCard />
        <RadialProgressCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ItemListCard />
        <RecentListCard />
        <div className="rounded-card bg-secondary p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Recent transfers</p>
          </div>
          <div className="space-y-3">
            {transfers.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-widget bg-card p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.direction === "in" ? "bg-success/10" : "bg-destructive/10"}`}>
                    {item.direction === "in" ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />
                    )}
                  </div>
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
