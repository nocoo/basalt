import { DashboardLayout } from "@/components/DashboardLayout";
import { Target, Check } from "lucide-react";

const goals = [
  { name: "Emergency Fund", target: 10000, saved: 7500, icon: "🛡️" },
  { name: "Vacation Trip", target: 5000, saved: 2200, icon: "✈️" },
  { name: "New Car", target: 30000, saved: 12000, icon: "🚗" },
  { name: "Home Down Payment", target: 60000, saved: 18000, icon: "🏠" },
];

export default function GoalsPage() {
  return (
    <DashboardLayout title="Goals" currentPath="/goals">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const pct = Math.round((goal.saved / goal.target) * 100);
          return (
            <div key={goal.name} className="rounded-[14px] bg-secondary p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{goal.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{goal.name}</p>
                  <p className="text-xs text-muted-foreground">${goal.saved.toLocaleString()} of ${goal.target.toLocaleString()}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-card">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 flex items-center gap-4">
                <span className="text-xs text-muted-foreground">Monthly target: ${Math.round((goal.target - goal.saved) / 6).toLocaleString()}</span>
                {pct >= 75 && <span className="flex items-center gap-1 text-xs text-success"><Check className="h-3 w-3" strokeWidth={2} /> On Track</span>}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
