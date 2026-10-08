import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
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
	NfcIcon,
	Plus,
	Wallet as WalletIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";
import type { CreditCard as CreditCardType } from "@/models/types";
import { useAccountsViewModel } from "@/viewmodels/useAccountsViewModel";
import { useCardShowcaseViewModel } from "@/viewmodels/useCardShowcaseViewModel";
import { useRecordListViewModel } from "@/viewmodels/useRecordListViewModel";

function NetworkLogo({ network }: { network: CreditCardType["network"] }) {
	switch (network) {
		case "visa":
			return <span className="text-basalt-xl font-extrabold italic tracking-tight">VISA</span>;
		case "mastercard":
			return (
				<div className="flex items-center">
					<div className="h-5 w-5 rounded-basalt-full bg-red-500 opacity-80" />
					<div className="-ml-basalt-space-lg h-5 w-5 rounded-basalt-full bg-yellow-400 opacity-80" />
				</div>
			);
		case "amex":
			return <span className="text-basalt-sm font-bold tracking-wider">AMEX</span>;
		default:
			return null;
	}
}

function ChipIcon({ isBlack }: { isBlack: boolean }) {
	return (
		<div
			className={`h-8 w-10 rounded-basalt-md ${isBlack ? "bg-amber-300/80" : "bg-amber-200/80"} flex items-center justify-center`}
		>
			<div
				className={`h-5 w-7 rounded-basalt-sm border ${isBlack ? "border-amber-600/50" : "border-amber-400/60"} grid grid-cols-3 grid-rows-2 gap-px p-px`}
			>
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className={`${isBlack ? "bg-amber-500/40" : "bg-amber-300/50"} rounded-basalt-sm`}
					/>
				))}
			</div>
		</div>
	);
}

export default function AccountsPage() {
	const { t } = useTranslation();
	const { accountList, activityList } = useAccountsViewModel();
	const [showBalance, setShowBalance] = useState(true);
	const { cards, cardCount, formatBalance } = useCardShowcaseViewModel(showBalance);
	const { records, totalCount } = useRecordListViewModel();

	return (
		<ShowcasePage title={t("pages.accounts.title")} description={t("pages.accounts.description")}>
			{/* Account balances */}
			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				{accountList.map((acc) => (
					<LayerCard key={acc.name}>
						<LayerCard.Header className="items-center justify-start">
							<WalletIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
							<span className="text-basalt-base text-muted-foreground">{acc.name}</span>
						</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-space-sm">
							<p className="text-basalt-2xl md:text-basalt-3xl font-semibold text-foreground font-display tracking-tight">
								${acc.balance.toLocaleString()}
							</p>
							<span className="text-basalt-sm font-medium text-success inline-block">
								{acc.change}
							</span>
						</LayerCard.Body>
					</LayerCard>
				))}
			</div>

			<div className="flex gap-basalt-space-lg">
				<Button icon={<Plus strokeWidth={1.5} />}>{t("pages.accounts.addMoney")}</Button>
				<Button variant="secondary" icon={<ArrowUpRight strokeWidth={1.5} />}>
					{t("pages.accounts.send")}
				</Button>
			</div>

			{/* Card showcase */}
			<div className="flex items-center justify-between">
				<span className="text-basalt-base text-muted-foreground">
					{t("pages.accounts.cardsActive", { count: cardCount })}
				</span>
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
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2 xl:grid-cols-3 justify-items-center">
				{cards.map((card) => {
					const { colorScheme: cs } = card;
					return (
						<div
							key={card.name}
							className={`aspect-[86/54] w-full max-w-sm rounded-basalt-lg bg-gradient-to-br ${card.color} p-basalt-card relative overflow-hidden flex flex-col justify-between shadow-lg`}
						>
							{/* Decorative circles */}
							<div
								className={`absolute -top-12 -right-12 h-40 w-40 rounded-basalt-full ${cs.overlayOpacity.large}`}
							/>
							<div
								className={`absolute -bottom-8 -left-8 h-32 w-32 rounded-basalt-full ${cs.overlayOpacity.small}`}
							/>

							{/* Top row: bank name + contactless */}
							<div className="flex items-start justify-between relative z-10">
								<div>
									<p className={`text-basalt-base font-semibold ${cs.textPrimary}`}>{card.bank}</p>
									<p className={`text-basalt-xs ${cs.textMuted} mt-basalt-space-xs`}>{card.name}</p>
								</div>
								<NfcIcon className={`h-5 w-5 ${cs.textMuted}`} strokeWidth={1.5} />
							</div>

							{/* Middle: chip + card number */}
							<div className="relative z-10 space-y-basalt-space-lg">
								<ChipIcon isBlack={cs.chipHighContrast} />
								<p className={`text-basalt-base font-mono tracking-[0.2em] ${cs.textSecondary}`}>
									{card.number}
								</p>
							</div>

							{/* Bottom row: expiry + balance + network logo */}
							<div className="flex items-end justify-between relative z-10">
								<div className="flex gap-basalt-space-lg">
									<div>
										<p className={`text-basalt-xs uppercase ${cs.textMuted}`}>
											{t("pages.accounts.validThru")}
										</p>
										<p className={`text-basalt-sm font-mono ${cs.textSecondary}`}>{card.expiry}</p>
									</div>
									<div>
										<p className={`text-basalt-xs uppercase ${cs.textMuted}`}>
											{t("pages.accounts.balance")}
										</p>
										<p className={`text-basalt-base font-semibold ${cs.textPrimary}`}>
											{formatBalance(card.balance)}
										</p>
									</div>
								</div>
								<div className={cs.textPrimary}>
									<NetworkLogo network={card.network} />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Usage bar */}
			<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-3">
				{cards.map((card) => (
					<LayerCard key={card.name}>
						<div className="flex items-center justify-between mb-basalt-space-lg">
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
						<p className="text-basalt-xs text-muted-foreground mt-basalt-space-md">
							${card.balance.toLocaleString()} / ${card.limit.toLocaleString()}{" "}
							{t("pages.accounts.limit")}
						</p>
					</LayerCard>
				))}
			</div>

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
						<LayerCard key={feat.key} className="flex items-center justify-between">
							<label
								htmlFor={`switch-${feat.key}`}
								className="text-basalt-base text-foreground cursor-pointer"
							>
								{feat.label}
							</label>
							<Switch id={`switch-${feat.key}`} defaultChecked aria-label={feat.label} />
						</LayerCard>
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
				<LayerCard.Body className="flex flex-col gap-basalt-space-lg">
					{activityList.map((item, i) => (
						<div key={i} className="flex items-center justify-between py-basalt-space-sm">
							<div className="flex items-center gap-basalt-space-lg">
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-basalt-md ${item.direction === "positive" ? "bg-success/10" : "bg-destructive/10"}`}
								>
									{item.direction === "positive" ? (
										<ArrowDownLeft className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
									) : (
										<ArrowUpRight className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />
									)}
								</div>
								<div>
									<p className="text-basalt-base text-foreground">{item.desc}</p>
									<p className="text-basalt-sm text-muted-foreground">{item.date}</p>
								</div>
							</div>
							<span
								className={`text-basalt-base font-medium ${item.direction === "positive" ? "text-success" : "text-foreground"}`}
							>
								{item.formattedAmount}
							</span>
						</div>
					))}
				</LayerCard.Body>
			</LayerCard>

			{/* Transactions */}
			<div className="flex items-center justify-between">
				<span className="text-basalt-base text-muted-foreground">
					{t("pages.accounts.transactions", { count: totalCount })}
				</span>
				<Button
					variant="ghost"
					type="button"
					className="flex items-center gap-basalt-space-lg text-muted-foreground"
				>
					<Filter className="h-3.5 w-3.5" strokeWidth={1.5} /> {t("pages.accounts.filterLabel")}
				</Button>
			</div>

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
												className={`flex h-7 w-7 items-center justify-center rounded-basalt-md ${tx.direction === "positive" ? "bg-success/10" : "bg-destructive/10"}`}
											>
												{tx.direction === "positive" ? (
													<ArrowDownLeft
														className="h-3 w-3 text-success"
														strokeWidth={1.5}
														aria-hidden="true"
													/>
												) : (
													<ArrowUpRight
														className="h-3 w-3 text-destructive"
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
										className={`text-right font-medium ${tx.direction === "positive" ? "text-success" : ""}`}
									>
										{tx.formattedAmount}
									</TableCell>
									<TableCell className="text-right">
										<span
											className={`rounded-basalt-full px-basalt-space-lg py-basalt-space-xs text-basalt-xs ${tx.statusVariant === "success" ? "bg-success/10 text-success" : "bg-yellow-500/10 text-yellow-500"}`}
										>
											{tx.status}
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</LayerCard.Body>
			</LayerCard>

			{/* Mobile transaction list */}
			<div className="flex flex-col gap-basalt-space-lg md:hidden">
				{records.map((tx) => (
					<LayerCard key={tx.id}>
						<div className="flex items-center gap-basalt-space-lg">
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-basalt-md shrink-0 ${tx.direction === "positive" ? "bg-success/10" : "bg-destructive/10"}`}
							>
								{tx.direction === "positive" ? (
									<ArrowDownLeft className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
								) : (
									<ArrowUpRight className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />
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
									className={`text-basalt-base font-medium ${tx.direction === "positive" ? "text-success" : "text-foreground"}`}
								>
									{tx.formattedAmount}
								</p>
								<span
									className={`text-basalt-xs ${tx.statusVariant === "success" ? "text-success" : "text-yellow-500"}`}
								>
									{tx.status}
								</span>
							</div>
						</div>
					</LayerCard>
				))}
			</div>
		</ShowcasePage>
	);
}
