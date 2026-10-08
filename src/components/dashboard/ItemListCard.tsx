import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

const accountItems = [
	{ name: "Primary Care", balance: 12450.8, change: "+2.4%" },
	{ name: "Care Plan", balance: 8200.0, change: "+5.1%" },
	{ name: "Wellness Reserve", balance: 23100.5, change: "+8.7%" },
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
				<div className="flex flex-1 flex-col gap-basalt-space-lg">
					{accountItems.map((acc) => (
						<div key={acc.name} className="flex items-center justify-between">
							<span className="text-basalt-base text-foreground">{acc.name}</span>
							<div className="text-right">
								<span className="text-basalt-base font-medium text-foreground font-display">
									${acc.balance.toLocaleString()}
								</span>
								<span className="text-basalt-sm text-success ml-basalt-space-lg">{acc.change}</span>
							</div>
						</div>
					))}
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
