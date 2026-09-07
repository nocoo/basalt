import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { BatteryMeter } from "@nocoo/basalt/components/battery-meter";
import { Button } from "@nocoo/basalt/components/button";
import { DataTable, type DataTableColumn } from "@nocoo/basalt/components/data-table";
import { FilterBar } from "@nocoo/basalt/components/filter-bar";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { TagBadge, type TagColor } from "@nocoo/basalt/components/tag-badge";
import { useTranslation } from "react-i18next";
import { formatPercent, formatUsd } from "@/lib/format";
import {
	type CompanyRow,
	type DealRow,
	type DeviceRow,
	type TableShowcaseTab,
	useTableShowcaseViewModel,
} from "@/viewmodels/useTableShowcaseViewModel";

const DENSE = "px-3 py-2 whitespace-nowrap";
const TAG_COLOR: Record<string, TagColor> = {
	Enterprise: "blue",
	Upsell: "violet",
	Expansion: "teal",
	Renewal: "success",
	Pilot: "amber",
	Strategic: "rose",
	"Mid-Market": "info",
	SMB: "slate",
	"New Logo": "success",
	"Land & Expand": "teal",
};

function TagStack({ tags }: { tags: readonly string[] }) {
	const visible = tags.slice(0, 2);
	const extra = tags.length - visible.length;
	return (
		<div className="flex flex-wrap items-center gap-1">
			{visible.map((tag) => (
				<TagBadge key={tag} name={tag} color={TAG_COLOR[tag]} size="sm" />
			))}
			{extra > 0 ? (
				<Badge variant="outline" className="px-1.5 py-0 text-[11px]">
					+{extra}
				</Badge>
			) : null}
		</div>
	);
}

function OwnerCell({ name, initials }: { name: string; initials: string }) {
	return (
		<div className="flex items-center gap-2">
			<Avatar className="h-6 w-6">
				<AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
			</Avatar>
			<span>{name}</span>
		</div>
	);
}

function WinMeter({ value }: { value: number }) {
	const filled = Math.round(value / 10);
	const tone =
		value >= 70 ? "bg-basalt-chart-2" : value >= 40 ? "bg-basalt-chart-3" : "bg-basalt-chart-1";
	return (
		<div className="flex items-center gap-2">
			<div className="flex gap-px" aria-hidden="true">
				{Array.from({ length: 10 }, (_, index) => (
					<span
						key={index}
						className={`h-3 w-1.5 rounded-sm ${index < filled ? tone : "bg-basalt-muted"}`}
					/>
				))}
			</div>
			<span className="tabular-nums text-xs text-basalt-muted-foreground">
				{formatPercent(value)}
			</span>
		</div>
	);
}

function TrendBars({ values, label }: { values: readonly number[]; label: string }) {
	const max = Math.max(...values, 1);
	return (
		<div className="flex h-6 items-end gap-px" role="img" aria-label={label}>
			{values.map((value, index) => (
				<span
					key={`${index}-${value}`}
					className="w-1 rounded-sm bg-basalt-chart-2"
					style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
				/>
			))}
		</div>
	);
}

function invoiceStatus(status: string) {
	if (status === "Paid") return "success";
	if (status === "Overdue") return "danger";
	return "warning";
}

function deviceStatus(status: string) {
	if (status === "Online") return "success";
	if (status === "Warning") return "warning";
	return "danger";
}

export default function TablesPage() {
	const { t } = useTranslation();
	const vm = useTableShowcaseViewModel();

	const companyColumns: DataTableColumn<CompanyRow>[] = [
		{
			id: "name",
			header: t("pages.tables.colCompany"),
			accessor: (row) => <span className="font-medium">{row.name}</span>,
			sortValue: (row) => row.name,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "tags",
			header: t("pages.tables.colSegment"),
			accessor: (row) => <TagStack tags={row.tags} />,
			sortable: false,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "owner",
			header: t("pages.tables.colOwner"),
			accessor: (row) => <OwnerCell name={row.owner} initials={row.initials} />,
			sortValue: (row) => row.owner,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "deals",
			header: t("pages.tables.colDeals"),
			accessor: (row) => row.deals,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
			width: 88,
		},
		{
			id: "pipeline",
			header: t("pages.tables.colPipeline"),
			accessor: (row) => formatUsd(row.pipeline),
			sortValue: (row) => row.pipeline,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
		{
			id: "win",
			header: t("pages.tables.colWin"),
			accessor: (row) => <WinMeter value={row.win} />,
			sortValue: (row) => row.win,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "trend",
			header: t("pages.tables.colTrend"),
			accessor: (row) => (
				<TrendBars values={row.trend} label={`${row.name} ${t("pages.tables.colTrend")}`} />
			),
			sortable: false,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "last",
			header: t("pages.tables.colLast"),
			accessor: (row) => (
				<span className="text-basalt-muted-foreground">
					{row.lastDate}
					<span className="text-basalt-foreground"> · {row.lastKind}</span>
				</span>
			),
			sortValue: (row) => row.lastDate,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
	];

	const dealColumns: DataTableColumn<DealRow>[] = [
		{
			id: "name",
			header: t("pages.tables.colDeal"),
			accessor: (row) => <span className="font-medium">{row.name}</span>,
			sortValue: (row) => row.name,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "company",
			header: t("pages.tables.colCompany"),
			accessor: (row) => row.company,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "stage",
			header: t("pages.tables.colStage"),
			accessor: (row) => <TagBadge name={row.stage} color={TAG_COLOR[row.stage]} size="sm" />,
			sortValue: (row) => row.stage,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "value",
			header: t("pages.tables.colValue"),
			accessor: (row) => formatUsd(row.value),
			sortValue: (row) => row.value,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
		{
			id: "close",
			header: t("pages.tables.colClose"),
			accessor: (row) => row.close,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "owner",
			header: t("pages.tables.colOwner"),
			accessor: (row) => row.owner,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
	];

	const forecastColumns: DataTableColumn<(typeof vm.forecast)[number]>[] = [
		{
			id: "stage",
			header: t("pages.tables.colStage"),
			accessor: (row) => <TagBadge name={row.stage} color={TAG_COLOR[row.stage]} size="sm" />,
			sortValue: (row) => row.stage,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "count",
			header: t("pages.tables.colCompanies"),
			accessor: (row) => row.count,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
		{
			id: "pipeline",
			header: t("pages.tables.colPipeline"),
			accessor: (row) => formatUsd(row.pipeline),
			sortValue: (row) => row.pipeline,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
		{
			id: "win",
			header: t("pages.tables.colWin"),
			accessor: (row) => <WinMeter value={row.win} />,
			sortValue: (row) => row.win,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
	];

	const invoiceColumns: DataTableColumn<(typeof vm.invoices)[number]>[] = [
		{
			id: "id",
			header: t("pages.tables.colInvoice"),
			accessor: (row) => row.id,
			cellClassName: `${DENSE} font-medium`,
			headerClassName: DENSE,
		},
		{
			id: "customer",
			header: t("pages.tables.colCustomer"),
			accessor: (row) => row.customer,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "status",
			header: t("pages.tables.colStatus"),
			accessor: (row) => <TagBadge name={row.status} color={invoiceStatus(row.status)} size="sm" />,
			sortValue: (row) => row.status,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "amount",
			header: t("pages.tables.colAmount"),
			accessor: (row) => formatUsd(row.amount),
			sortValue: (row) => row.amount,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
		{
			id: "date",
			header: t("pages.tables.colDate"),
			accessor: (row) => row.date,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
	];

	const deviceColumns: DataTableColumn<DeviceRow>[] = [
		{
			id: "name",
			header: t("pages.tables.colDevice"),
			accessor: (row) => <span className="font-medium">{row.name}</span>,
			sortValue: (row) => row.name,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "region",
			header: t("pages.tables.colRegion"),
			accessor: (row) => row.region,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "status",
			header: t("pages.tables.colStatus"),
			accessor: (row) => <TagBadge name={row.status} color={deviceStatus(row.status)} size="sm" />,
			sortValue: (row) => row.status,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "battery",
			header: t("pages.tables.colBattery"),
			accessor: (row) => (
				<BatteryMeter
					value={row.battery}
					label={`${row.name} ${t("pages.tables.colBattery")}`}
					status={row.status === "Offline" ? "offline" : "discharging"}
				/>
			),
			sortValue: (row) => row.battery,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "requests",
			header: t("pages.tables.colRequests"),
			accessor: (row) => row.requests.toLocaleString("en-US"),
			sortValue: (row) => row.requests,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
	];

	return (
		<div className="space-y-8">
			<PageHeader title={t("pages.tables.title")} description={t("pages.tables.description")} />

			<SectionRule title={t("pages.tables.pipeline")} hint={t("pages.tables.pipelineHint")}>
				<LayerCard padding="none" data-table-showcase="pipeline">
					<Tabs value={vm.tab} onValueChange={(value) => vm.setTab(value as TableShowcaseTab)}>
						<div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
							<TabsList>
								<TabsTrigger value="companies">{t("pages.tables.tabCompanies")}</TabsTrigger>
								<TabsTrigger value="deals">{t("pages.tables.tabDeals")}</TabsTrigger>
								<TabsTrigger value="forecast">{t("pages.tables.tabForecast")}</TabsTrigger>
							</TabsList>
							<div className="flex flex-wrap gap-2">
								<Button size="sm" variant="outline">
									{t("pages.tables.export")}
								</Button>
								<Button size="sm">{t("pages.tables.newCompany")}</Button>
							</div>
						</div>
						<div className="px-4 py-3">
							<FilterBar
								label={t("pages.tables.filters")}
								active={vm.owner !== "all" || vm.stage !== "all"}
								onClear={() => {
									vm.setOwner("all");
									vm.setStage("all");
								}}
							>
								<Select value={vm.owner} onValueChange={vm.setOwner}>
									<SelectTrigger aria-label={t("pages.tables.colOwner")} className="w-44">
										<SelectValue placeholder={t("pages.tables.allOwners")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">{t("pages.tables.allOwners")}</SelectItem>
										{vm.owners.map((name) => (
											<SelectItem key={name} value={name}>
												{name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select value={vm.stage} onValueChange={vm.setStage}>
									<SelectTrigger aria-label={t("pages.tables.colStage")} className="w-40">
										<SelectValue placeholder={t("pages.tables.anyStage")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">{t("pages.tables.anyStage")}</SelectItem>
										{vm.stages.map((name) => (
											<SelectItem key={name} value={name}>
												{name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FilterBar>
						</div>
						<div className="px-2 pb-2">
							<TabsContent value="companies" className="mt-0">
								<DataTable
									aria-label={t("pages.tables.tabCompanies")}
									data={[...vm.companies]}
									columns={companyColumns}
									multiple
									selected={vm.selected}
									onSelectedChange={vm.setSelected}
									getRowId={(row) => row.id}
								/>
							</TabsContent>
							<TabsContent value="deals" className="mt-0">
								<DataTable
									aria-label={t("pages.tables.tabDeals")}
									data={[...vm.deals]}
									columns={dealColumns}
									getRowId={(row) => row.id}
								/>
							</TabsContent>
							<TabsContent value="forecast" className="mt-0">
								<DataTable
									aria-label={t("pages.tables.tabForecast")}
									data={vm.forecast}
									columns={forecastColumns}
									getRowId={(row) => row.stage}
								/>
							</TabsContent>
						</div>
					</Tabs>
					<div className="grid grid-cols-2 gap-px border-t border-basalt-border bg-basalt-border text-xs text-basalt-muted-foreground md:grid-cols-4">
						<div className="bg-basalt-background px-4 py-2">
							{vm.tab === "deals"
								? t("pages.tables.dealsInView", { count: vm.dealCount })
								: t("pages.tables.companiesInView", { count: vm.companyCount })}
						</div>
						<div className="bg-basalt-background px-4 py-2 tabular-nums">
							{t("pages.tables.pipelineSum", { value: formatUsd(vm.pipelineSum) })}
						</div>
						<div className="bg-basalt-background px-4 py-2 tabular-nums">
							{t("pages.tables.winAvg", { value: formatPercent(vm.winAvg) })}
						</div>
						<div className="bg-basalt-background px-4 py-2">{t("pages.tables.addCalculation")}</div>
					</div>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.tables.ledger")} hint={t("pages.tables.ledgerHint")}>
				<LayerCard className="space-y-4" data-table-showcase="ledger">
					<Input
						className="max-w-64"
						aria-label={t("pages.tables.searchInvoices")}
						placeholder={t("pages.tables.searchInvoices")}
						value={vm.invoiceQuery}
						onChange={(event) => vm.setInvoiceQuery(event.target.value)}
					/>
					<DataTable
						aria-label={t("pages.tables.ledger")}
						data={[...vm.invoices]}
						columns={invoiceColumns}
						filter={vm.invoiceQuery}
						pageSize={4}
						getRowId={(row) => row.id}
					/>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.tables.fleet")} hint={t("pages.tables.fleetHint")}>
				<LayerCard className="space-y-4" data-table-showcase="fleet">
					<FilterBar
						label={t("pages.tables.deviceFilters")}
						active={vm.deviceStatus !== "all"}
						onClear={() => vm.setDeviceStatus("all")}
					>
						<Select value={vm.deviceStatus} onValueChange={vm.setDeviceStatus}>
							<SelectTrigger aria-label={t("pages.tables.colStatus")} className="w-40">
								<SelectValue placeholder={t("pages.tables.anyStatus")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t("pages.tables.anyStatus")}</SelectItem>
								{vm.deviceStates.map((name) => (
									<SelectItem key={name} value={name}>
										{name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FilterBar>
					<DataTable
						aria-label={t("pages.tables.fleet")}
						data={[...vm.devices]}
						columns={deviceColumns}
						getRowId={(row) => row.id}
					/>
				</LayerCard>
			</SectionRule>
		</div>
	);
}
