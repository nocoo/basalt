import {
	ArrowDownLeft,
	ArrowUpRight,
	CreditCard,
	Landmark,
	ShieldCheck,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { BulletChartCard } from "@/components/dashboard/BulletChartCard";
import { GroupedBarCard } from "@/components/dashboard/GroupedBarCard";
import { ItemListCard } from "@/components/dashboard/ItemListCard";
import { MiniDonutCard } from "@/components/dashboard/MiniDonutCard";
import { RadialProgressCard } from "@/components/dashboard/RadialProgressCard";
import { RecentListCard } from "@/components/dashboard/RecentListCard";
import { SankeyCard } from "@/components/dashboard/SankeyCard";
import { StackedAreaCard } from "@/components/dashboard/StackedAreaCard";
import { StatCardWidget, StatGrid } from "@/components/dashboard/StatCardWidget";
import { PageIntro } from "@/components/PageIntro";

const transfers = [
	{ name: "Wire transfer", amount: "$120k", direction: "in" },
	{ name: "Mortgage payment", amount: "$4.8k", direction: "out" },
	{ name: "Treasury coupon", amount: "$3.6k", direction: "in" },
];

export default function BankingDashboardPage() {
	const { t } = useTranslation();

	const statCards = [
		{
			title: t("pages.banking.assets"),
			value: "$4.82M",
			subtitle: t("pages.banking.managedTotal"),
			icon: Wallet,
			trend: { value: 4.8, label: t("pages.banking.qoq") },
		},
		{
			title: t("pages.banking.liquidity"),
			value: "$620k",
			subtitle: t("pages.banking.onHandCash"),
			icon: CreditCard,
			trend: { value: 2.1, label: t("pages.banking.qoq") },
		},
		{
			title: t("pages.banking.netWorth"),
			value: "$3.12M",
			subtitle: t("pages.banking.household"),
			icon: TrendingUp,
			trend: { value: 6.7, label: t("pages.banking.yoy") },
		},
		{
			title: t("pages.banking.risk"),
			value: t("pages.banking.low"),
			subtitle: t("pages.banking.portfolioTilt"),
			icon: ShieldCheck,
			trend: { value: -3.2, label: t("pages.banking.yoy") },
		},
	];

	return (
		<div className="space-y-4">
			<PageIntro
				title={t("pages.banking.title")}
				description={t("pages.banking.description")}
				eyebrow={t("pages.banking.eyebrow")}
				icon={Landmark}
			/>

			<StatGrid columns={4}>
				{statCards.map((stat) => (
					<StatCardWidget key={stat.title} {...stat} />
				))}
			</StatGrid>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<StackedAreaCard />
				<MiniDonutCard />
				<BulletChartCard />
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<SankeyCard />
				<GroupedBarCard />
				<RadialProgressCard />
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<ItemListCard />
				<RecentListCard />
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<div className="mb-4 flex items-center gap-2">
						<CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<p className="text-sm text-muted-foreground">{t("pages.banking.recentTransfers")}</p>
					</div>
					<div className="space-y-3">
						{transfers.map((item) => (
							<div
								key={item.name}
								className="flex items-center justify-between rounded-widget bg-card p-3"
							>
								<div className="flex items-center gap-3">
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.direction === "in" ? "bg-success/10" : "bg-destructive/10"}`}
									>
										{item.direction === "in" ? (
											<ArrowDownLeft className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
										) : (
											<ArrowUpRight className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />
										)}
									</div>
									<span className="text-sm text-foreground">{item.name}</span>
								</div>
								<span className="text-sm font-medium text-foreground">{item.amount}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
