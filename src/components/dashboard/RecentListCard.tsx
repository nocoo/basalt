import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";

const transactions = [
	{ name: "Sleep coaching", amount: -15.99, date: "Today", type: "expense" },
	{ name: "Employer wellness benefit", amount: 5200.0, date: "Yesterday", type: "income" },
	{ name: "Nutrition consult", amount: -82.4, date: "Yesterday", type: "expense" },
	{ name: "Therapy reimbursement", amount: 1200.0, date: "Feb 8", type: "income" },
	{ name: "Lab testing", amount: -145.0, date: "Feb 7", type: "expense" },
] as const;

export function RecentListCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header>
				<div className="flex items-center gap-basalt-space-lg">
					<ArrowLeftRight className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						Recent Care Activity
					</h2>
				</div>
				<Link href="/banking" className="shrink-0 text-basalt-sm">
					View All
				</Link>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex flex-1 flex-col gap-basalt-card-sm">
					{transactions.map((tx, i) => (
						<div key={i} className="flex items-center gap-basalt-space-lg">
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-basalt-md ${tx.type === "income" ? "bg-basalt-success/10" : "bg-basalt-danger-solid/10"}`}
							>
								{tx.type === "income" ? (
									<ArrowDownLeft className="size-basalt-icon text-basalt-success" />
								) : (
									<ArrowUpRight className="size-basalt-icon text-basalt-danger-solid" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-basalt-base text-basalt-foreground truncate">{tx.name}</p>
								<p className="text-basalt-sm text-basalt-muted-foreground">{tx.date}</p>
							</div>
							<span
								className={`text-basalt-base font-medium tabular-nums ${tx.amount > 0 ? "text-basalt-success" : "text-basalt-foreground"}`}
							>
								{tx.amount > 0 ? "+" : ""}
								{tx.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
							</span>
						</div>
					))}
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
