import { Button } from "@nocoo/basalt/components/button";
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
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Zap className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("dashboard.quickActions")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex-1 grid grid-cols-2 gap-basalt-space-lg">
					{actions.map((action) => (
						<Button variant="secondary" type="button" key={action.label} className="flex-col">
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-basalt-md ${action.color}`}
							>
								<action.icon className="h-4 w-4" strokeWidth={1.5} />
							</div>
							<span className="text-basalt-sm text-foreground">{action.label}</span>
						</Button>
					))}
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
