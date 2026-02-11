import { DashboardLayout } from "@/components/DashboardLayout";
import { TotalBalanceCard } from "@/components/dashboard/TotalBalanceCard";
import { IncomeCard } from "@/components/dashboard/IncomeCard";
import { UsageCategoryCard } from "@/components/dashboard/UsageCategoryCard";
import { SpendingTrendCard } from "@/components/dashboard/SpendingTrendCard";
import { ExpenseBreakdownCard } from "@/components/dashboard/ExpenseBreakdownCard";
import { RecentTransactionsCard } from "@/components/dashboard/RecentTransactionsCard";

const Index = () => (
  <DashboardLayout title="Dashboard" currentPath="/">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <TotalBalanceCard />
      <IncomeCard />
      <SpendingTrendCard />
    </div>
    <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <UsageCategoryCard />
      </div>
      <ExpenseBreakdownCard />
    </div>
    <div className="mt-4">
      <RecentTransactionsCard />
    </div>
  </DashboardLayout>
);

export default Index;
