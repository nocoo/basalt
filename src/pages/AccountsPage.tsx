import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";
import { Switch } from "@nocoo/basalt/components/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import {
	Activity,
	ArrowDownLeft,
	ArrowLeftRight,
	ArrowUpRight,
	Eye,
	EyeOff,
	Filter,
	Lock,
	Plus,
	Wallet as WalletIcon,
} from "lucide-react";
import { useState } from "react";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useAccountsViewModel } from "@/viewmodels/useAccountsViewModel";
import { useCardShowcaseViewModel } from "@/viewmodels/useCardShowcaseViewModel";
import { useRecordListViewModel } from "@/viewmodels/useRecordListViewModel";

export default function AccountsPage() {
	const { accountList, activityList } = useAccountsViewModel();
	const [showBalance, setShowBalance] = useState(true);
	const { cards, cardCount, formatBalance } = useCardShowcaseViewModel(showBalance);
	const { records, totalCount } = useRecordListViewModel();

	return (
		<ShowcasePage
			title="Care accounts"
			description="Care funds, payment cards, and treatment expenses."
			actions={
				<>
					<Button icon={<Plus />}>Add Money</Button>
					<Button variant="secondary" icon={<ArrowUpRight />}>
						Send
					</Button>
				</>
			}
		>
			{/* Account balances */}
			<StatGrid columns={3}>
				{accountList.map((acc) => (
					<StatCard
						key={acc.name}
						title={acc.name}
						value={`$${acc.balance.toLocaleString()}`}
						icon={<WalletIcon />}
						trendContent={<span className="font-medium text-basalt-success">{acc.change}</span>}
					/>
				))}
			</StatGrid>

			{/* Card showcase */}
			<SectionRule
				title={`${cardCount} cards active`}
				className="space-y-basalt-card"
				actions={
					<Button
						variant="ghost"
						type="button"
						onClick={() => setShowBalance(!showBalance)}
						className="flex items-center gap-basalt-space-lg text-basalt-muted-foreground"
					>
						{showBalance ? (
							<Eye className="size-basalt-icon-lg" />
						) : (
							<EyeOff className="size-basalt-icon-lg" />
						)}
						{showBalance ? "Hide" : "Show"} balances
					</Button>
				}
			>
				<div className="grid grid-cols-1 gap-basalt-card-lg md:grid-cols-2 xl:grid-cols-3">
					{cards.map((card) => (
						<LayerCard key={card.name} outlined className="relative overflow-hidden">
							<LayerCard.Header className="items-start">
								<div className="min-w-0 space-y-basalt-space-sm">
									<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
										{card.name}
									</h2>
									<p className="text-basalt-sm text-basalt-muted-foreground">{card.bank}</p>
								</div>
								<Badge className="shrink-0 uppercase">{card.network}</Badge>
							</LayerCard.Header>
							<LayerCard.Body className="space-y-basalt-card-lg">
								<p className="py-basalt-card-sm font-mono tabular-nums tracking-[0.14em] text-basalt-xl text-basalt-foreground">
									{card.number}
								</p>
								<dl className="grid grid-cols-3 gap-basalt-card-sm border-t border-basalt-border/60 pt-basalt-card-sm">
									<div className="min-w-0 space-y-basalt-space-sm">
										<dt className="text-basalt-sm text-basalt-muted-foreground">Valid Thru</dt>
										<dd className="font-mono tabular-nums font-semibold text-basalt-sm text-basalt-foreground">
											{card.expiry}
										</dd>
									</div>
									<div className="min-w-0 space-y-basalt-space-sm">
										<dt className="text-basalt-sm text-basalt-muted-foreground">Balance</dt>
										<dd className="font-mono tabular-nums font-semibold text-basalt-sm text-basalt-foreground break-words">
											{formatBalance(card.balance)}
										</dd>
									</div>
									<div className="min-w-0 space-y-basalt-space-sm">
										<dt className="text-basalt-sm text-basalt-muted-foreground">limit</dt>
										<dd className="font-mono tabular-nums font-semibold text-basalt-sm text-basalt-foreground break-words">
											{formatBalance(card.limit)}
										</dd>
									</div>
								</dl>
							</LayerCard.Body>
						</LayerCard>
					))}
				</div>

				{/* Usage bar */}
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-3">
					{cards.map((card) => (
						<LayerCard key={card.name}>
							<div className="flex items-center justify-between gap-basalt-card-sm mb-basalt-card-sm">
								<span className="text-basalt-base font-medium text-basalt-foreground">
									{card.bank} {card.name}
								</span>
								<span className="text-basalt-sm text-basalt-muted-foreground">
									{card.utilization}%
								</span>
							</div>
							<div
								className="h-1.5 rounded-basalt-full bg-basalt-muted"
								role="progressbar"
								aria-valuenow={card.utilization}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={`${card.bank} ${card.name} credit utilization: ${card.utilization}%`}
							>
								<div
									className="h-full rounded-basalt-full bg-basalt-foreground/60 transition-[width,opacity] basalt-motion"
									style={{ width: `${card.utilization}%` }}
									aria-hidden="true"
								/>
							</div>
							<p className="text-basalt-sm text-basalt-muted-foreground mt-basalt-space-md">
								${card.balance.toLocaleString()} / ${card.limit.toLocaleString()} limit
							</p>
						</LayerCard>
					))}
				</div>
			</SectionRule>

			{/* Card security */}
			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<Lock className="size-basalt-icon-lg text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Card Security</h2>
				</LayerCard.Header>
				<LayerCard.Body className="grid grid-cols-1 gap-basalt-layout md:grid-cols-3">
					{[
						{ key: "onlinePayments", label: "Online Payments" },
						{ key: "contactless", label: "Contactless" },
						{ key: "atmWithdrawal", label: "ATM Withdrawal" },
					].map((feat) => (
						<div key={feat.key} className="flex items-center justify-between gap-basalt-card">
							<label
								htmlFor={`switch-${feat.key}`}
								className="text-basalt-base text-basalt-foreground cursor-pointer"
							>
								{feat.label}
							</label>
							<Switch id={`switch-${feat.key}`} defaultChecked aria-label={feat.label} />
						</div>
					))}
				</LayerCard.Body>
			</LayerCard>

			{/* Recent activity */}
			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<Activity className="size-basalt-icon-lg text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Recent Activity</h2>
				</LayerCard.Header>
				<LayerCard.Body className="divide-y divide-basalt-border/60">
					{activityList.map((item, i) => (
						<div
							key={i}
							className="flex items-center justify-between gap-basalt-card py-basalt-card-sm first:pt-0 last:pb-0"
						>
							<div className="flex items-center gap-basalt-space-lg">
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-basalt-md ${item.direction === "positive" ? "bg-basalt-success/10" : "bg-basalt-danger-solid/10"}`}
								>
									{item.direction === "positive" ? (
										<ArrowDownLeft className="size-basalt-icon text-basalt-success" />
									) : (
										<ArrowUpRight className="size-basalt-icon text-basalt-danger-solid" />
									)}
								</div>
								<div>
									<p className="text-basalt-base text-basalt-foreground">{item.desc}</p>
									<p className="text-basalt-sm text-basalt-muted-foreground">{item.date}</p>
								</div>
							</div>
							<span
								className={`text-basalt-base font-medium ${item.direction === "positive" ? "text-basalt-success" : "text-basalt-foreground"}`}
							>
								{item.formattedAmount}
							</span>
						</div>
					))}
				</LayerCard.Body>
			</LayerCard>

			{/* Transactions */}
			<SectionRule
				title={`${totalCount} transactions`}
				className="space-y-basalt-card"
				actions={
					<Button
						variant="ghost"
						type="button"
						className="flex items-center gap-basalt-space-lg text-basalt-muted-foreground"
					>
						<Filter className="size-basalt-icon" /> Filter
					</Button>
				}
			>
				{/* Desktop table */}
				<LayerCard padding="none" className="overflow-hidden hidden md:block">
					<LayerCard.Header className="items-center justify-start">
						<ArrowLeftRight
							className="size-basalt-icon-lg text-basalt-muted-foreground"
							aria-hidden="true"
						/>
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Transactions</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<Table aria-label="Transactions">
							<TableHeader>
								<TableRow>
									<TableHead>Transaction</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Date</TableHead>
									<TableHead className="text-right">Amount</TableHead>
									<TableHead className="text-right">Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{records.map((tx) => (
									<TableRow key={tx.id}>
										<TableCell>
											<div className="flex items-center gap-basalt-space-lg">
												<div
													className={`flex h-7 w-7 items-center justify-center rounded-basalt-md ${tx.direction === "positive" ? "bg-basalt-success/10" : "bg-basalt-danger-solid/10"}`}
												>
													{tx.direction === "positive" ? (
														<ArrowDownLeft
															className="size-basalt-icon-sm text-basalt-success"
															aria-hidden="true"
														/>
													) : (
														<ArrowUpRight
															className="size-basalt-icon-sm text-basalt-danger-solid"
															aria-hidden="true"
														/>
													)}
												</div>
												{tx.name}
											</div>
										</TableCell>
										<TableCell className="text-basalt-muted-foreground">{tx.category}</TableCell>
										<TableCell className="text-basalt-muted-foreground">{tx.date}</TableCell>
										<TableCell
											className={`text-right font-medium ${tx.direction === "positive" ? "text-basalt-success" : ""}`}
										>
											{tx.formattedAmount}
										</TableCell>
										<TableCell className="text-right">
											<Badge dot tone={tx.statusVariant === "success" ? "success" : "warning"}>
												{tx.status}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</LayerCard.Body>
				</LayerCard>

				{/* Mobile transaction list */}
				<div className="flex flex-col gap-basalt-card md:hidden">
					{records.map((tx) => (
						<LayerCard key={tx.id}>
							<div className="flex items-center gap-basalt-space-lg">
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-basalt-md shrink-0 ${tx.direction === "positive" ? "bg-basalt-success/10" : "bg-basalt-danger-solid/10"}`}
								>
									{tx.direction === "positive" ? (
										<ArrowDownLeft className="size-basalt-icon text-basalt-success" />
									) : (
										<ArrowUpRight className="size-basalt-icon text-basalt-danger-solid" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-basalt-base text-basalt-foreground truncate">{tx.name}</p>
									<p className="text-basalt-sm text-basalt-muted-foreground">
										{tx.category} · {tx.date}
									</p>
								</div>
								<div className="text-right shrink-0">
									<p
										className={`text-basalt-base font-medium ${tx.direction === "positive" ? "text-basalt-success" : "text-basalt-foreground"}`}
									>
										{tx.formattedAmount}
									</p>
									<span
										className={`text-basalt-sm ${tx.statusVariant === "success" ? "text-basalt-success" : "text-basalt-warning"}`}
									>
										{tx.status}
									</span>
								</div>
							</div>
						</LayerCard>
					))}
				</div>
			</SectionRule>
		</ShowcasePage>
	);
}
