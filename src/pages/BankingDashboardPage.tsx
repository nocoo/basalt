import { StatCard, StatGrid } from "@nocoo/basalt/charts/stat-card";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import {
	ArrowDownLeft,
	ArrowUpRight,
	CreditCard,
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
import { ShowcasePage } from "@/components/ShowcasePage";

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
		<ShowcasePage title={t("pages.banking.title")} description={t("pages.banking.description")}>
			<StatGrid columns={4}>
				{statCards.map((stat) => (
					<StatCard key={stat.title} {...stat} />
				))}
			</StatGrid>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<StackedAreaCard />
				<MiniDonutCard />
				<BulletChartCard />
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<SankeyCard />
				<GroupedBarCard />
				<RadialProgressCard />
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<ItemListCard />
				<RecentListCard />
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.banking.recentTransfers")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body className="space-y-basalt-space-lg">
						{transfers.map((item) => (
							<LayerCard key={item.name} className="flex items-center justify-between">
								<div className="flex min-w-0 items-center gap-basalt-space-lg">
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-basalt-md ${item.direction === "in" ? "bg-success/10" : "bg-destructive/10"}`}
									>
										{item.direction === "in" ? (
											<ArrowDownLeft className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
										) : (
											<ArrowUpRight className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />
										)}
									</div>
									<span className="text-basalt-base text-foreground">{item.name}</span>
								</div>
								<span className="text-basalt-base font-medium text-foreground">{item.amount}</span>
							</LayerCard>
						))}
					</LayerCard.Body>
				</LayerCard>
			</div>
		</ShowcasePage>
	);
}
