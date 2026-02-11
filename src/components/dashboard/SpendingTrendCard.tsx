import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Activity } from "lucide-react";

const data = [
  { name: "Mon", value: 2400 }, { name: "Tue", value: 1398 },
  { name: "Wed", value: 5800 }, { name: "Thu", value: 3908 },
  { name: "Fri", value: 4800 }, { name: "Sat", value: 3200 },
  { name: "Sun", value: 4300 },
];

export function SpendingTrendCard() {
  return (
    <div className="flex flex-col rounded-[14px] bg-secondary p-5">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-sm font-normal text-muted-foreground">Spending Trend</span>
      </div>
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-2xl font-semibold text-foreground">$3,420</h2>
        <span className="text-xs font-medium text-destructive">-1.8%</span>
      </div>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" tick={{ fill: "hsl(0,0%,40%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Line type="monotone" dataKey="value" stroke="hsl(200, 90%, 60%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
