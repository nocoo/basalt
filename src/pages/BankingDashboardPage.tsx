import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";
import {
	ArrowDownLeft,
	ArrowUpRight,
	CreditCard,
	ShieldCheck,
	TrendingUp,
	Wallet,
} from "lucide-react";
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
	{ name: "Care fund transfer", amount: "$120k", direction: "in" },
	{ name: "Treatment payment", amount: "$4.8k", direction: "out" },
	{ name: "Insurance reimbursement", amount: "$3.6k", direction: "in" },
] as const;

const statCards = [
	{
		title: "Assets",
		value: "$4.82M",
		subtitle: "Managed total",
		icon: <Wallet />,
		trend: { value: 4.8, label: "QoQ" },
	},
	{
		title: "Liquidity",
		value: "$620k",
		subtitle: "On-hand cash",
		icon: <CreditCard />,
		trend: { value: 2.1, label: "QoQ" },
	},
	{
		title: "Net Worth",
		value: "$3.12M",
		subtitle: "Household",
		icon: <TrendingUp />,
		trend: { value: 6.7, label: "YoY" },
	},
	{
		title: "Risk",
		value: "Low",
		subtitle: "Portfolio tilt",
		icon: <ShieldCheck />,
		trend: { value: -3.2, label: "YoY" },
	},
];

export default function BankingDashboardPage() {
	return (
		<ShowcasePage
			title="Care funding dashboard"
			description="Treatment funds, reimbursements, care spending, and reserves. Sample data, not a live service."
		>
			<StatGrid columns={4} className="grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))]">
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
						<CreditCard className="size-basalt-icon-lg text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
							Recent transfers
						</h2>
					</LayerCard.Header>
					<LayerCard.Body className="divide-y divide-basalt-border/60">
						{transfers.map((item) => (
							<div
								key={item.name}
								className="flex items-center justify-between gap-basalt-card py-basalt-card-sm first:pt-0 last:pb-0"
							>
								<div className="flex min-w-0 items-center gap-basalt-space-lg">
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-basalt-md ${item.direction === "in" ? "bg-basalt-success/10" : "bg-basalt-danger-solid/10"}`}
									>
										{item.direction === "in" ? (
											<ArrowDownLeft className="size-basalt-icon text-basalt-success" />
										) : (
											<ArrowUpRight className="size-basalt-icon text-basalt-danger-solid" />
										)}
									</div>
									<span className="text-basalt-base text-basalt-foreground">{item.name}</span>
								</div>
								<span className="text-basalt-base font-medium text-basalt-foreground">
									{item.amount}
								</span>
							</div>
						))}
					</LayerCard.Body>
				</LayerCard>
			</div>
		</ShowcasePage>
	);
}
