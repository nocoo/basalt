import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

const accountItems = [
	{ nameKey: "dashboard.accountPrimary", balance: 12450.8, change: "+2.4%" },
	{ nameKey: "dashboard.accountPlan", balance: 8200.0, change: "+5.1%" },
	{ nameKey: "dashboard.accountReserve", balance: 23100.5, change: "+8.7%" },
];

export function ItemListCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Wallet className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("dashboard.accountsTitle")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex flex-1 flex-col gap-basalt-card-sm">
					{accountItems.map((acc) => (
						<div
							key={acc.nameKey}
							className="flex items-center justify-between gap-basalt-space-lg"
						>
							<span className="text-basalt-base text-foreground">{t(acc.nameKey)}</span>
							<div className="text-right">
								<span className="text-basalt-base font-medium text-foreground font-display">
									{acc.balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
								</span>
								<span className="text-basalt-sm text-basalt-success ml-basalt-space-lg">
									{acc.change}
								</span>
							</div>
						</div>
					))}
					<p className="text-basalt-sm text-basalt-muted-foreground">
						{t("dashboard.listComparisonUnknown")}
					</p>
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
