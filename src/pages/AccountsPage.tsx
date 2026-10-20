import { StatCard, StatGrid } from "@nocoo/basalt/charts/stat-card";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
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
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useAccountsViewModel } from "@/viewmodels/useAccountsViewModel";
import { useCardShowcaseViewModel } from "@/viewmodels/useCardShowcaseViewModel";
import { useRecordListViewModel } from "@/viewmodels/useRecordListViewModel";

export default function AccountsPage() {
	const { t } = useTranslation();
	const { accountList, activityList } = useAccountsViewModel();
	const [showBalance, setShowBalance] = useState(true);
	const { cards, cardCount, formatBalance } = useCardShowcaseViewModel(showBalance);
	const { records, totalCount } = useRecordListViewModel();

	return (
		<ShowcasePage
			title={t("pages.accounts.title")}
			description={t("pages.accounts.description")}
			actions={
				<>
					<Button icon={<Plus strokeWidth={1.5} />}>{t("pages.accounts.addMoney")}</Button>
					<Button variant="secondary" icon={<ArrowUpRight strokeWidth={1.5} />}>
						{t("pages.accounts.send")}
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
						icon={WalletIcon}
						trendContent={<span className="font-medium text-basalt-success">{acc.change}</span>}
					/>
				))}
			</StatGrid>

			{/* Card showcase */}
			<SectionRule
				title={t("pages.accounts.cardsActive", { count: cardCount })}
				className="space-y-basalt-card"
				actions={
					<Button
						variant="ghost"
						type="button"
						onClick={() => setShowBalance(!showBalance)}
						className="flex items-center gap-basalt-space-lg text-muted-foreground"
					>
						{showBalance ? (
							<Eye className="h-4 w-4" strokeWidth={1.5} />
						) : (
							<EyeOff className="h-4 w-4" strokeWidth={1.5} />
						)}
						{showBalance ? t("pages.accounts.hide") : t("pages.accounts.show")}{" "}
						{t("pages.accounts.balances")}
					</Button>
				}
			>
				<div className="grid grid-cols-1 gap-basalt-card-lg md:grid-cols-2 xl:grid-cols-3">
					{cards.map((card) => (
						<LayerCard key={card.name} outlined className="relative overflow-hidden">
							<LayerCard.Header className="items-start">
								<div className="min-w-0 space-y-basalt-space-sm">
									<h2 className="text-basalt-base font-semibold text-basalt-foreground">
										{card.name}
									</h2>
									<p className="text-basalt-sm text-basalt-muted-foreground">{card.bank}</p>
								</div>
								<Badge variant="secondary" className="shrink-0 uppercase">
									{card.network}
								</Badge>
							</LayerCard.Header>
							<LayerCard.Body className="space-y-basalt-card-lg">
								<p className="py-basalt-card-sm font-mono tabular-nums tracking-[0.14em] text-basalt-xl text-basalt-foreground">
									{card.number}
								</p>
								<dl className="grid grid-cols-3 gap-basalt-card-sm border-t border-basalt-border/60 pt-basalt-card-sm">
									<div className="min-w-0 space-y-basalt-space-sm">
										<dt className="text-basalt-sm text-basalt-muted-foreground">
											{t("pages.accounts.validThru")}
										</dt>
										<dd className="font-mono tabular-nums font-semibold text-basalt-sm text-basalt-foreground">
											{card.expiry}
										</dd>
									</div>
									<div className="min-w-0 space-y-basalt-space-sm">
										<dt className="text-basalt-sm text-basalt-muted-foreground">
											{t("pages.accounts.balance")}
										</dt>
										<dd className="font-mono tabular-nums font-semibold text-basalt-sm text-basalt-foreground break-words">
											{formatBalance(card.balance)}
										</dd>
									</div>
									<div className="min-w-0 space-y-basalt-space-sm">
										<dt className="text-basalt-sm text-basalt-muted-foreground">
											{t("pages.accounts.limit")}
										</dt>
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
								<span className="text-basalt-base font-medium text-foreground">
									{card.bank} {card.name}
								</span>
								<span className="text-basalt-sm text-muted-foreground">{card.utilization}%</span>
							</div>
							<div
								className="h-1.5 rounded-basalt-full bg-muted"
								role="progressbar"
								aria-valuenow={card.utilization}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={`${card.bank} ${card.name} ${t("pages.accounts.creditUtilization")}: ${card.utilization}%`}
							>
								<div
									className="h-full rounded-basalt-full bg-foreground/60 transition-[width,opacity] basalt-motion"
									style={{ width: `${card.utilization}%` }}
									aria-hidden="true"
								/>
							</div>
							<p className="text-basalt-sm text-muted-foreground mt-basalt-space-md">
								${card.balance.toLocaleString()} / ${card.limit.toLocaleString()}{" "}
								{t("pages.accounts.limit")}
							</p>
						</LayerCard>
					))}
				</div>
			</SectionRule>

			{/* Card security */}
			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<Lock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<span className="text-basalt-base text-muted-foreground">
						{t("pages.accounts.cardSecurity")}
					</span>
				</LayerCard.Header>
				<LayerCard.Body className="grid grid-cols-1 gap-basalt-layout md:grid-cols-3">
					{[
						{ key: "onlinePayments", label: t("pages.accounts.onlinePayments") },
						{ key: "contactless", label: t("pages.accounts.contactless") },
						{ key: "atmWithdrawal", label: t("pages.accounts.atmWithdrawal") },
					].map((feat) => (
						<div key={feat.key} className="flex items-center justify-between gap-basalt-card">
							<label
								htmlFor={`switch-${feat.key}`}
								className="text-basalt-base text-foreground cursor-pointer"
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
					<Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base text-muted-foreground">
						{t("pages.accounts.recentActivity")}
					</h2>
				</LayerCard.Header>
				<LayerCard.Body className="divide-y divide-basalt-border/60">
					{activityList.map((item, i) => (
						<div
							key={i}
							className="flex items-center justify-between gap-basalt-card py-basalt-card-sm first:pt-0 last:pb-0"
						>
							<div className="flex items-center gap-basalt-space-lg">
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-basalt-md ${item.direction === "positive" ? "bg-basalt-success/10" : "bg-basalt-destructive/10"}`}
								>
									{item.direction === "positive" ? (
										<ArrowDownLeft className="h-3.5 w-3.5 text-basalt-success" strokeWidth={1.5} />
									) : (
										<ArrowUpRight
											className="h-3.5 w-3.5 text-basalt-destructive"
											strokeWidth={1.5}
										/>
									)}
								</div>
								<div>
									<p className="text-basalt-base text-foreground">{item.desc}</p>
									<p className="text-basalt-sm text-muted-foreground">{item.date}</p>
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
				title={t("pages.accounts.transactions", { count: totalCount })}
				className="space-y-basalt-card"
				actions={
					<Button
						variant="ghost"
						type="button"
						className="flex items-center gap-basalt-space-lg text-muted-foreground"
					>
						<Filter className="h-3.5 w-3.5" strokeWidth={1.5} /> {t("pages.accounts.filterLabel")}
					</Button>
				}
			>
				{/* Desktop table */}
				<LayerCard padding="none" className="overflow-hidden hidden md:block">
					<LayerCard.Header className="items-center justify-start">
						<ArrowLeftRight
							className="h-4 w-4 text-muted-foreground"
							strokeWidth={1.5}
							aria-hidden="true"
						/>
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.accounts.transactionsTitle")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<Table aria-label={t("pages.accounts.transactionsTitle")}>
							<TableHeader>
								<TableRow>
									<TableHead>{t("pages.accounts.transaction")}</TableHead>
									<TableHead>{t("pages.accounts.category")}</TableHead>
									<TableHead>{t("pages.accounts.date")}</TableHead>
									<TableHead className="text-right">{t("pages.accounts.amount")}</TableHead>
									<TableHead className="text-right">{t("pages.accounts.status")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{records.map((tx) => (
									<TableRow key={tx.id}>
										<TableCell>
											<div className="flex items-center gap-basalt-space-lg">
												<div
													className={`flex h-7 w-7 items-center justify-center rounded-basalt-md ${tx.direction === "positive" ? "bg-basalt-success/10" : "bg-basalt-destructive/10"}`}
												>
													{tx.direction === "positive" ? (
														<ArrowDownLeft
															className="h-3 w-3 text-basalt-success"
															strokeWidth={1.5}
															aria-hidden="true"
														/>
													) : (
														<ArrowUpRight
															className="h-3 w-3 text-basalt-destructive"
															strokeWidth={1.5}
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
											<Badge variant={tx.statusVariant === "success" ? "success" : "warning"}>
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
									className={`flex h-8 w-8 items-center justify-center rounded-basalt-md shrink-0 ${tx.direction === "positive" ? "bg-basalt-success/10" : "bg-basalt-destructive/10"}`}
								>
									{tx.direction === "positive" ? (
										<ArrowDownLeft className="h-3.5 w-3.5 text-basalt-success" strokeWidth={1.5} />
									) : (
										<ArrowUpRight
											className="h-3.5 w-3.5 text-basalt-destructive"
											strokeWidth={1.5}
										/>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-basalt-base text-foreground truncate">{tx.name}</p>
									<p className="text-basalt-sm text-muted-foreground">
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
