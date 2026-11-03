import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const transactions = [
	{ nameKey: "dashboard.activitySleep", amount: -15.99, dateKey: "common.today", type: "expense" },
	{
		nameKey: "dashboard.activityBenefit",
		amount: 5200.0,
		dateKey: "dashboard.activityYesterday",
		type: "income",
	},
	{
		nameKey: "dashboard.activityNutrition",
		amount: -82.4,
		dateKey: "dashboard.activityYesterday",
		type: "expense",
	},
	{
		nameKey: "dashboard.activityTherapy",
		amount: 1200.0,
		dateKey: "dashboard.activityFeb8",
		type: "income",
	},
	{
		nameKey: "dashboard.activityLab",
		amount: -145.0,
		dateKey: "dashboard.activityFeb7",
		type: "expense",
	},
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
				<div className="flex flex-1 flex-col gap-basalt-card-sm">
					{transactions.map((tx, i) => (
						<div key={i} className="flex items-center gap-basalt-space-lg">
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-basalt-md ${tx.type === "income" ? "bg-basalt-success/10" : "bg-basalt-destructive/10"}`}
							>
								{tx.type === "income" ? (
									<ArrowDownLeft className="h-3.5 w-3.5 text-basalt-success" strokeWidth={1.5} />
								) : (
									<ArrowUpRight className="h-3.5 w-3.5 text-basalt-destructive" strokeWidth={1.5} />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-basalt-base text-foreground truncate">{t(tx.nameKey)}</p>
								<p className="text-basalt-sm text-muted-foreground">{t(tx.dateKey)}</p>
							</div>
							<span
								className={`text-basalt-base font-medium ${tx.amount > 0 ? "text-basalt-success" : "text-basalt-foreground"}`}
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
