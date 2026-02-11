import { AppSidebar } from "@/components/AppSidebar";
import { TotalBalanceCard } from "@/components/dashboard/TotalBalanceCard";
import { IncomeCard } from "@/components/dashboard/IncomeCard";
import { UsageCategoryCard } from "@/components/dashboard/UsageCategoryCard";
import { Monitor } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center gap-3 px-8 py-5">
          <Monitor className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h1 className="text-base font-medium text-foreground">Dashboard</h1>
        </header>

        {/* Bento Grid */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TotalBalanceCard />
            <IncomeCard />
          </div>
          <div className="mt-4">
            <UsageCategoryCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
