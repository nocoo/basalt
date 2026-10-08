import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const transactions = [
	{ name: "Netflix Subscription", amount: -15.99, date: "Today", type: "expense" },
	{ name: "Salary Deposit", amount: 5200.0, date: "Yesterday", type: "income" },
	{ name: "Grocery Store", amount: -82.4, date: "Yesterday", type: "expense" },
	{ name: "Freelance Payment", amount: 1200.0, date: "Feb 8", type: "income" },
	{ name: "Electric Bill", amount: -145.0, date: "Feb 7", type: "expense" },
];

export function RecentListCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header>
				<div className="flex items-center gap-basalt-space-lg">
					<ArrowLeftRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("dashboard.recentTransactions")}
					</h2>
				</div>
				<Link href="/accounts" className="shrink-0 text-basalt-sm">
					{t("common.viewAll")}
				</Link>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex flex-1 flex-col gap-basalt-space-lg">
					{transactions.map((tx, i) => (
						<div key={i} className="flex items-center gap-basalt-space-lg">
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-basalt-md ${tx.type === "income" ? "bg-success/10" : "bg-destructive/10"}`}
							>
								{tx.type === "income" ? (
									<ArrowDownLeft className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
								) : (
									<ArrowUpRight className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-basalt-base text-foreground truncate">{tx.name}</p>
								<p className="text-basalt-sm text-muted-foreground">{tx.date}</p>
							</div>
							<span
								className={`text-basalt-base font-medium ${tx.amount > 0 ? "text-success" : "text-foreground"}`}
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
