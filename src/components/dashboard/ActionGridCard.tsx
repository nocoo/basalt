import { ArrowUpRight, ArrowDownLeft, CreditCard, PiggyBank, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ActionGridCard() {
  const { t } = useTranslation();

  const actions = [
    { icon: ArrowUpRight, label: t("dashboard.sendMoney"), color: "bg-primary/10 text-primary" },
    { icon: ArrowDownLeft, label: t("dashboard.receive"), color: "bg-success/10 text-success" },
    { icon: CreditCard, label: t("dashboard.payBill"), color: "bg-destructive/10 text-destructive" },
    { icon: PiggyBank, label: t("dashboard.saveAction"), color: "bg-purple-500/10 text-purple-500" },
  ];

  return (
    <Card className="h-full rounded-card border-0 bg-secondary shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <CardTitle className="text-sm font-normal text-muted-foreground">{t("dashboard.quickActions")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col">
        <div className="flex-1 grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 rounded-widget bg-card p-3 hover:bg-accent transition-colors cursor-pointer"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}>
                <action.icon className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <span className="text-xs text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
