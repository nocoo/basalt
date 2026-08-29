import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { ArrowDownLeft, ArrowUpRight, CreditCard, PiggyBank, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ActionGridCard() {
	const { t } = useTranslation();

	const actions = [
		{ icon: ArrowUpRight, label: t("dashboard.sendMoney"), color: "bg-primary/10 text-primary" },
		{ icon: ArrowDownLeft, label: t("dashboard.receive"), color: "bg-success/10 text-success" },
		{
			icon: CreditCard,
			label: t("dashboard.payBill"),
			color: "bg-destructive/10 text-destructive",
		},
		{
			icon: PiggyBank,
			label: t("dashboard.saveAction"),
			color: "bg-purple-500/10 text-purple-500",
		},
	];

	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<Zap className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("dashboard.quickActions")}
					</h3>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<div className="flex-1 grid grid-cols-2 gap-2">
					{actions.map((action) => (
						<button
							type="button"
							key={action.label}
							className="flex flex-col items-center gap-2 rounded-widget bg-card p-3 hover:bg-accent transition-colors cursor-pointer"
						>
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}
							>
								<action.icon className="h-4 w-4" strokeWidth={1.5} />
							</div>
							<span className="text-xs text-foreground">{action.label}</span>
						</button>
					))}
				</div>
			</div>
		</LayerCard>
	);
}
