import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

const accountItems = [
	{ name: "Checking", balance: 12450.8, change: "+2.4%" },
	{ name: "Savings", balance: 8200.0, change: "+5.1%" },
	{ name: "Investment", balance: 23100.5, change: "+8.7%" },
];

export function ItemListCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<Wallet className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("dashboard.accountsTitle")}
					</h3>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<div className="flex flex-1 flex-col gap-3">
					{accountItems.map((acc) => (
						<div key={acc.name} className="flex items-center justify-between">
							<span className="text-sm text-foreground">{acc.name}</span>
							<div className="text-right">
								<span className="text-sm font-medium text-foreground font-display">
									${acc.balance.toLocaleString()}
								</span>
								<span className="text-xs text-success ml-2">{acc.change}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</LayerCard>
	);
}
