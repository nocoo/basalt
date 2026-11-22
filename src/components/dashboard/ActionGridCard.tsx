import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { ArrowDownLeft, ArrowUpRight, CreditCard, PiggyBank, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ActionGridCard({ demo = false }: { demo?: boolean }) {
	const { t } = useTranslation();

	const actions = [
		{
			icon: ArrowUpRight,
			label: t("dashboard.sendMoney"),
			color: "bg-basalt-primary/10 text-basalt-link",
		},
		{
			icon: ArrowDownLeft,
			label: t("dashboard.receive"),
			color: "bg-basalt-success/10 text-basalt-success",
		},
		{
			icon: CreditCard,
			label: t("dashboard.payBill"),
			color: "bg-basalt-danger-solid/10 text-basalt-danger-solid",
		},
		{
			icon: PiggyBank,
			label: t("dashboard.saveAction"),
			color: "bg-basalt-info/10 text-basalt-info",
		},
	];

	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Zap className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						{t("dashboard.quickActions")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col gap-basalt-card-sm">
				{demo && (
					<p className="text-basalt-sm text-basalt-muted-foreground">
						{t("dashboard.demoActions")}
					</p>
				)}
				<div className="flex-1 grid grid-cols-2 gap-basalt-card">
					{actions.map((action) => (
						<Button
							variant="secondary"
							size="tile"
							type="button"
							key={action.label}
							disabled={demo}
						>
							<div
								className={`flex h-9 w-9 items-center justify-center rounded-basalt-md ${action.color}`}
							>
								<action.icon className="size-basalt-icon-lg" />
							</div>
							<span className="text-basalt-sm text-basalt-foreground">{action.label}</span>
						</Button>
					))}
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
