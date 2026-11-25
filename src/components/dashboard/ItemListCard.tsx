import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Wallet } from "lucide-react";

const accountItems = [
	{ name: "Primary Care", balance: 12450.8, change: "+2.4%" },
	{ name: "Care Plan", balance: 8200.0, change: "+5.1%" },
	{ name: "Wellness Reserve", balance: 23100.5, change: "+8.7%" },
] as const;

export function ItemListCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col items-start">
				<div className="flex items-center gap-basalt-space-lg">
					<Wallet className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Care Plans</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col gap-basalt-card-sm">
				<div className="divide-y divide-basalt-border/60">
					{accountItems.map((acc) => (
						<div
							key={acc.name}
							className="flex items-center justify-between gap-basalt-space-lg py-basalt-card-sm first:pt-0 last:pb-0"
						>
							<span className="text-basalt-base text-basalt-foreground">{acc.name}</span>
							<div className="text-right">
								<span className="text-basalt-base font-medium text-basalt-foreground font-basalt-display tabular-nums">
									{acc.balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
								</span>
								<span className="text-basalt-sm tabular-nums text-basalt-success ml-basalt-space-lg">
									{acc.change}
								</span>
							</div>
						</div>
					))}
				</div>
				<p className="mt-auto text-basalt-sm text-basalt-muted-foreground">
					Changes: vs. prior 30 days
				</p>
			</LayerCard.Body>
		</LayerCard>
	);
}
