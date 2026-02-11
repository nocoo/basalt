import { DashboardLayout } from "@/components/DashboardLayout";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";

const accounts = [
  { name: "Main Account", balance: 12450.80, currency: "USD", change: "+2.4%" },
  { name: "Savings", balance: 8200.00, currency: "USD", change: "+5.1%" },
  { name: "Investment", balance: 23100.50, currency: "USD", change: "+8.7%" },
];

const recentActivity = [
  { desc: "Transfer to Savings", amount: -500, date: "Today" },
  { desc: "Received from John", amount: 250, date: "Yesterday" },
  { desc: "ATM Withdrawal", amount: -200, date: "Feb 9" },
  { desc: "Refund - Amazon", amount: 45.99, date: "Feb 8" },
];

export default function WalletPage() {
  return (
    <DashboardLayout title="Wallet" currentPath="/wallet">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {accounts.map((acc) => (
          <div key={acc.name} className="rounded-[14px] bg-secondary p-5">
            <div className="flex items-center gap-2 mb-3">
              <WalletIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">{acc.name}</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">${acc.balance.toLocaleString()}</h2>
            <span className="text-xs font-medium text-success mt-1 inline-block">{acc.change}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <button className="flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Add Money
        </button>
        <button className="flex items-center gap-2 rounded-[10px] bg-secondary px-4 py-2.5 text-sm font-medium text-foreground">
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} /> Send
        </button>
      </div>

      <div className="mt-4 rounded-[14px] bg-secondary p-5">
        <p className="text-sm text-muted-foreground mb-4">Recent Activity</p>
        <div className="flex flex-col gap-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.amount > 0 ? "bg-success/10" : "bg-destructive/10"}`}>
                  {item.amount > 0 ? <ArrowDownLeft className="h-3.5 w-3.5 text-success" strokeWidth={1.5} /> : <ArrowUpRight className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />}
                </div>
                <div>
                  <p className="text-sm text-foreground">{item.desc}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${item.amount > 0 ? "text-success" : "text-foreground"}`}>
                {item.amount > 0 ? "+" : ""}${Math.abs(item.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
