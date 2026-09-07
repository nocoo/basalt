import { Avatar, AvatarFallback, AvatarImage } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { DescriptionList } from "@nocoo/basalt/components/description-list";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { Pagination } from "@nocoo/basalt/components/pagination";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import {
	AlertTriangle,
	BadgeCheck,
	CheckCircle2,
	GitCommit,
	MessageSquare,
	Minus,
	Search,
	Sparkles,
	Star,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDataShowcaseViewModel } from "@/viewmodels/useDataShowcaseViewModel";

const PEOPLE = [
	{ name: "Alice Chen", email: "alice@example.com", initials: "AC", seed: "alice" },
	{ name: "Bob Park", email: "bob@example.com", initials: "BP", seed: "bob" },
	{ name: "Clara Diaz", email: "clara@example.com", initials: "CD", seed: "clara" },
	{ name: "David Kim", email: "david@example.com", initials: "DK", seed: "david" },
	{ name: "Eva Torres", email: "eva@example.com", initials: "ET", seed: "eva" },
];

const TIMELINE = [
	{
		icon: CheckCircle2,
		color: "text-emerald-500",
		title: "Deployment succeeded",
		desc: "v2.4.1 deployed to production",
		time: "2 min ago",
	},
	{
		icon: GitCommit,
		color: "text-blue-500",
		title: "Code merged",
		desc: "PR #142 merged into main",
		time: "15 min ago",
	},
	{
		icon: MessageSquare,
		color: "text-amber-500",
		title: "New comment",
		desc: "Alice left a review",
		time: "1 hr ago",
	},
	{
		icon: Star,
		color: "text-purple-500",
		title: "Milestone reached",
		desc: "Sprint 8 completed",
		time: "3 hr ago",
	},
];

const SOLID_PILLS = [
	{ label: "Primary", className: "bg-primary text-primary-foreground" },
	{ label: "Success", className: "bg-success text-success-foreground" },
	{ label: "Warning", className: "bg-amber-500 text-white" },
	{ label: "Error", className: "bg-destructive text-destructive-foreground" },
];

const SOFT_PILLS = [
	{ label: "Blue", className: "bg-blue-500/10 text-blue-500" },
	{ label: "Teal", className: "bg-teal-500/10 text-teal-500" },
	{ label: "Indigo", className: "bg-indigo-500/10 text-indigo-500" },
	{ label: "Rose", className: "bg-rose-500/10 text-rose-500" },
];

const OUTLINE_PILLS = [
	{ label: "Outline", className: "border border-border text-foreground" },
	{ label: "Primary", className: "border border-primary text-primary" },
	{ label: "Success", className: "border border-success text-success" },
];

const ICON_PILLS = [
	{ label: "Verified", icon: BadgeCheck, className: "bg-success/10 text-success" },
	{ label: "At risk", icon: AlertTriangle, className: "bg-amber-500/10 text-amber-500" },
	{ label: "AI", icon: Sparkles, className: "bg-purple-500/10 text-purple-500" },
];

const DOT_PILLS = [
	{ label: "Live", dot: "bg-green-500", className: "bg-green-500/10 text-green-600" },
	{ label: "Paused", dot: "bg-amber-500", className: "bg-amber-500/10 text-amber-500" },
	{ label: "Offline", dot: "bg-rose-500", className: "bg-rose-500/10 text-rose-500" },
];

export default function DataPage() {
	const { t } = useTranslation();
	const vm = useDataShowcaseViewModel();

	const KPI_DATA = [
		{ label: t("pages.data.revenue"), value: "$48.2k", change: "+12.5%", trend: "up" as const },
		{ label: t("pages.data.users"), value: "2,841", change: "+8.2%", trend: "up" as const },
		{ label: t("pages.data.bounceRate"), value: "24.3%", change: "-3.1%", trend: "down" as const },
		{ label: t("pages.data.avgSession"), value: "4m 32s", change: "0%", trend: "flat" as const },
	];

	const KEY_VALUE_DATA = [
		{ key: t("common.status"), value: t("pages.data.active") },
		{ key: t("pages.data.plan"), value: t("pages.data.enterprise") },
		{ key: t("pages.data.created"), value: "Jan 15, 2026" },
		{ key: t("pages.data.lastLogin"), value: t("pages.data.hoursAgo") },
	];

	return (
		<div className="space-y-8">
			<PageHeader title={t("pages.data.title")} description={t("pages.data.description")} />

			<SectionRule title={t("pages.data.statTiles")}>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{KPI_DATA.map((kpi) => (
						<LayerCard key={kpi.label}>
							<p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
							<p className="text-2xl font-semibold text-foreground">{kpi.value}</p>
							<div className="flex items-center gap-1 mt-2">
								{kpi.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
								{kpi.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
								{kpi.trend === "flat" && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
								<span
									className={`text-xs font-medium ${kpi.trend === "up" ? "text-emerald-500" : kpi.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}
								>
									{kpi.change}
								</span>
								<span className="text-xs text-muted-foreground">{t("common.vsLastMonth")}</span>
							</div>
						</LayerCard>
					))}
				</div>
			</SectionRule>

			<SectionRule title={t("pages.data.dataTable")}>
				<div className="flex flex-wrap items-center gap-2">
					<div className="relative min-w-0 flex-1 basis-48">
						<Search
							className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
							strokeWidth={1.5}
						/>
						<Input
							aria-label={t("pages.data.searchPlaceholder")}
							value={vm.query}
							onChange={(event) => vm.setQuery(event.target.value)}
							placeholder={t("pages.data.searchPlaceholder")}
							className="rounded-widget pl-10 text-sm h-8"
						/>
					</div>
					<select
						aria-label={t("common.filter")}
						value={vm.status}
						onChange={(event) => vm.setStatus(event.target.value)}
						className="h-8 rounded-widget border border-border bg-basalt-control px-2 text-sm"
					>
						<option value="all">{t("demo.allStatuses")}</option>
						<option value="Paid">{t("demo.paid")}</option>
						<option value="Pending">{t("demo.pendingStatus")}</option>
						<option value="Overdue">{t("demo.overdue")}</option>
					</select>
				</div>
				<LayerCard padding="none">
					<Table aria-label={t("pages.data.dataTable")}>
						<TableHeader>
							<TableRow>
								{(
									[
										["id", t("pages.data.invoice")],
										["customer", t("pages.data.customer")],
										["status", t("common.status")],
										["amount", t("common.amount")],
										["date", t("common.date")],
									] as const
								).map(([key, label]) => (
									<TableHead
										key={key}
										aria-sort={
											vm.sort.key === key
												? vm.sort.direction === 1
													? "ascending"
													: "descending"
												: "none"
										}
									>
										<button
											type="button"
											onClick={() => vm.sortBy(key)}
											className="inline-flex min-h-8 items-center gap-1 rounded px-1 focus-visible:outline-2 focus-visible:outline-primary"
										>
											{label}
											{vm.sort.key === key && (
												<span aria-hidden="true">{vm.sort.direction === 1 ? "↑" : "↓"}</span>
											)}
										</button>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{vm.rows.map((row) => (
								<TableRow key={row.id}>
									<TableCell>{row.id}</TableCell>
									<TableCell>{row.customer}</TableCell>
									<TableCell>
										<span
											className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
												row.status === "Paid"
													? "bg-success/10 text-success"
													: row.status === "Pending"
														? "bg-amber-500/10 text-amber-500"
														: "bg-destructive/10 text-destructive"
											}`}
										>
											{row.status}
										</span>
									</TableCell>
									<TableCell>
										{new Intl.NumberFormat("en-US", {
											style: "currency",
											currency: "USD",
											maximumFractionDigits: 0,
										}).format(row.amount)}
									</TableCell>
									<TableCell className="text-basalt-muted-foreground">{row.date}</TableCell>
								</TableRow>
							))}
							{vm.rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={5}>
										<div className="py-6 text-center" role="status">
											{t("demo.noResults")}{" "}
											<Button variant="ghost" size="sm" onClick={vm.reset}>
												{t("demo.resetFilters")}
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3">
						<p className="text-xs text-muted-foreground" role="status">
							{t("demo.results", { count: vm.total })}
						</p>
						<Pagination page={vm.page} pageCount={vm.pageCount} onPageChange={vm.setPage} />
					</div>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.data.avatars")}>
				<LayerCard>
					<LayerCard.Body>
						<div className="space-y-4">
							<div>
								<p className="text-xs text-muted-foreground mb-2 font-mono">
									{t("pages.data.sizes")}
								</p>
								<div className="flex items-end gap-3">
									{[
										{ size: "h-6 w-6", text: "text-[9px]" },
										{ size: "h-8 w-8", text: "text-[10px]" },
										{ size: "h-10 w-10", text: "text-xs" },
										{ size: "h-12 w-12", text: "text-sm" },
									].map(({ size, text }, i) => (
										<Avatar key={i} className={size}>
											<AvatarImage
												src={`https://avatar.vercel.sh/${PEOPLE[i].seed}`}
												alt={PEOPLE[i].name}
											/>
											<AvatarFallback className={text}>{PEOPLE[i].initials}</AvatarFallback>
										</Avatar>
									))}
								</div>
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-2 font-mono">
									{t("pages.data.stackedGroup")}
								</p>
								<div className="flex -space-x-2">
									{PEOPLE.map((p) => (
										<Avatar key={p.seed} className="h-9 w-9 border-2 border-background">
											<AvatarImage src={`https://avatar.vercel.sh/${p.seed}`} alt={p.name} />
											<AvatarFallback className="text-[10px]">{p.initials}</AvatarFallback>
										</Avatar>
									))}
									<div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
										+3
									</div>
								</div>
							</div>
						</div>
					</LayerCard.Body>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.data.badges")}>
				<LayerCard>
					<LayerCard.Body>
						<div className="space-y-4">
							<div>
								<p className="text-xs text-muted-foreground mb-2 font-mono">
									{t("pages.data.variants")}
								</p>
								<div className="flex flex-wrap items-center gap-2">
									<Badge>Default</Badge>
									<Badge variant="secondary">Secondary</Badge>
									<Badge variant="destructive">Destructive</Badge>
									<Badge variant="outline">Outline</Badge>
								</div>
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-2 font-mono">
									{t("pages.data.semantic")}
								</p>
								<div className="flex flex-wrap items-center gap-2">
									<Badge className="border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
										Active
									</Badge>
									<Badge className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400">
										Pending
									</Badge>
									<Badge className="border-transparent bg-red-500/15 text-red-600 dark:text-red-400">
										Failed
									</Badge>
									<Badge className="border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400">
										Info
									</Badge>
								</div>
							</div>
						</div>
					</LayerCard.Body>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.data.pills")}>
				<LayerCard>
					<LayerCard.Body>
						<div className="space-y-4">
							<div>
								<p className="text-xs text-muted-foreground mb-2 font-mono">
									{t("pages.data.solid")}
								</p>
								<div className="flex flex-wrap gap-2">
									{SOLID_PILLS.map((pill) => (
										<span
											key={pill.label}
											className={`rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}
										>
											{pill.label}
										</span>
									))}
								</div>
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-2 font-mono">
									{t("pages.data.soft")}
								</p>
								<div className="flex flex-wrap gap-2">
									{SOFT_PILLS.map((pill) => (
										<span
											key={pill.label}
											className={`rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}
										>
											{pill.label}
										</span>
									))}
								</div>
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-2 font-mono">
									{t("pages.data.outline")}
								</p>
								<div className="flex flex-wrap gap-2">
									{OUTLINE_PILLS.map((pill) => (
										<span
											key={pill.label}
											className={`rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}
										>
											{pill.label}
										</span>
									))}
								</div>
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-2 font-mono">
									{t("pages.data.withIcons")}
								</p>
								<div className="flex flex-wrap gap-2">
									{ICON_PILLS.map((pill) => (
										<span
											key={pill.label}
											className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}
										>
											<pill.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
											{pill.label}
										</span>
									))}
								</div>
							</div>
							<div>
								<p className="text-xs text-muted-foreground mb-2 font-mono">
									{t("pages.data.withDotIndicators")}
								</p>
								<div className="flex flex-wrap gap-2">
									{DOT_PILLS.map((pill) => (
										<span
											key={pill.label}
											className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}
										>
											<span className={`h-2 w-2 rounded-full ${pill.dot}`} />
											{pill.label}
										</span>
									))}
								</div>
							</div>
						</div>
					</LayerCard.Body>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.data.timelineFeed")}>
				<LayerCard>
					<LayerCard.Well>
						<div className="space-y-0">
							{TIMELINE.map((item, i) => (
								<div key={i} className="flex gap-3">
									<div className="flex flex-col items-center">
										<div
											className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border ${item.color}`}
										>
											<item.icon className="h-4 w-4" strokeWidth={1.5} />
										</div>
										{i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-border" />}
									</div>
									<div className={`pb-6 ${i === TIMELINE.length - 1 ? "pb-0" : ""}`}>
										<p className="text-sm font-medium text-foreground">{item.title}</p>
										<p className="text-xs text-muted-foreground">{item.desc}</p>
										<p className="text-[11px] text-muted-foreground/70 mt-1">{item.time}</p>
									</div>
								</div>
							))}
						</div>
					</LayerCard.Well>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.data.listItems")}>
				<LayerCard>
					<LayerCard.Well className="p-0">
						<div className="divide-y divide-border">
							{PEOPLE.slice(0, 4).map((person) => (
								<div key={person.seed} className="flex items-center gap-3 px-4 py-3">
									<Avatar className="h-9 w-9">
										<AvatarImage
											src={`https://avatar.vercel.sh/${person.seed}`}
											alt={person.name}
										/>
										<AvatarFallback className="text-[10px]">{person.initials}</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground truncate">{person.name}</p>
										<p className="text-xs text-muted-foreground truncate">{person.email}</p>
									</div>
									<Badge variant="outline" className="gap-1.5 shrink-0">
										<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
									</Badge>
								</div>
							))}
						</div>
					</LayerCard.Well>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.data.keyValueDisplay")}>
				<LayerCard>
					<LayerCard.Body>
						<DescriptionList>
							{KEY_VALUE_DATA.map((item) => (
								<DescriptionList.Item key={item.key} term={item.key}>
									{item.value}
								</DescriptionList.Item>
							))}
						</DescriptionList>
					</LayerCard.Body>
				</LayerCard>
			</SectionRule>
		</div>
	);
}
