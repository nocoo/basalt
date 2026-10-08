import { Sparkline } from "@nocoo/basalt/charts/sparkline";
import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { BatteryMeter } from "@nocoo/basalt/components/battery-meter";
import { Button } from "@nocoo/basalt/components/button";
import { DataTable, type DataTableColumn } from "@nocoo/basalt/components/data-table";
import { FilterBar } from "@nocoo/basalt/components/filter-bar";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Meter } from "@nocoo/basalt/components/meter";
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
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatPercent, formatUsd } from "@/lib/format";
import {
	type CompanyRow,
	type DealRow,
	type DeviceRow,
	type TableShowcaseTab,
	useTableShowcaseViewModel,
} from "@/viewmodels/useTableShowcaseViewModel";

const DENSE = "px-basalt-space-lg py-basalt-space-lg whitespace-nowrap";
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
		<div className="flex flex-wrap items-center gap-basalt-space-sm">
			{visible.map((tag) => (
				<TagBadge key={tag} name={tag} color={TAG_COLOR[tag]} size="sm" />
			))}
			{extra > 0 ? (
				<Badge variant="outline" className="px-basalt-space-md py-0 text-basalt-xs">
					+{extra}
				</Badge>
			) : null}
		</div>
	);
}

function OwnerCell({ name, initials }: { name: string; initials: string }) {
	return (
		<div className="flex items-center gap-basalt-space-lg">
			<Avatar className="h-6 w-6">
				<AvatarFallback className="text-basalt-xs">{initials}</AvatarFallback>
			</Avatar>
			<span>{name}</span>
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
			accessor: (row) => (
				<Meter
					value={row.win}
					aria-label={`${row.name} ${t("pages.tables.colWin")}`}
					className="w-32"
				/>
			),
			sortValue: (row) => row.win,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "trend",
			header: t("pages.tables.colTrend"),
			accessor: (row) => (
				<Sparkline
					className="h-4 w-16"
					data={row.trend.map((y, x) => ({ x, y }))}
					ariaLabel={`${row.name} ${t("pages.tables.colTrend")}`}
					summary={<span className="sr-only">{row.trend.join(", ")}</span>}
					accessibilityLayer={false}
				/>
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
			accessor: (row) => (
				<Meter
					value={row.win}
					aria-label={`${row.stage} ${t("pages.tables.colWin")}`}
					className="w-32"
				/>
			),
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
		<ShowcasePage title={t("pages.tables.title")} description={t("pages.tables.description")}>
			<SectionRule title={t("pages.tables.pipeline")} hint={t("pages.tables.pipelineHint")}>
				<LayerCard padding="none" data-table-showcase="pipeline">
					<Tabs value={vm.tab} onValueChange={(value) => vm.setTab(value as TableShowcaseTab)}>
						<div className="flex flex-wrap items-center justify-between gap-basalt-space-lg px-basalt-space-lg pt-basalt-space-lg">
							<TabsList>
								<TabsTrigger value="companies">{t("pages.tables.tabCompanies")}</TabsTrigger>
								<TabsTrigger value="deals">{t("pages.tables.tabDeals")}</TabsTrigger>
								<TabsTrigger value="forecast">{t("pages.tables.tabForecast")}</TabsTrigger>
							</TabsList>
							<div className="flex flex-wrap gap-basalt-space-lg">
								<Button size="sm" variant="outline">
									{t("pages.tables.export")}
								</Button>
								<Button size="sm">{t("pages.tables.newCompany")}</Button>
							</div>
						</div>
						<div className="px-basalt-space-lg py-basalt-space-lg">
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
						<div className="px-basalt-space-lg pb-basalt-space-lg">
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
					<div className="grid grid-cols-2 gap-px border-t border-basalt-border bg-basalt-border text-basalt-sm text-basalt-muted-foreground md:grid-cols-4">
						<div className="bg-basalt-background px-basalt-space-lg py-basalt-space-lg">
							{vm.tab === "deals"
								? t("pages.tables.dealsInView", { count: vm.dealCount })
								: t("pages.tables.companiesInView", { count: vm.companyCount })}
						</div>
						<div className="bg-basalt-background px-basalt-space-lg py-basalt-space-lg tabular-nums">
							{t("pages.tables.pipelineSum", { value: formatUsd(vm.pipelineSum) })}
						</div>
						<div className="bg-basalt-background px-basalt-space-lg py-basalt-space-lg tabular-nums">
							{t("pages.tables.winAvg", { value: formatPercent(vm.winAvg) })}
						</div>
						<div className="bg-basalt-background px-basalt-space-lg py-basalt-space-lg">
							{t("pages.tables.addCalculation")}
						</div>
					</div>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.tables.ledger")} hint={t("pages.tables.ledgerHint")}>
				<LayerCard className="space-y-basalt-space-lg" data-table-showcase="ledger">
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
				<LayerCard className="space-y-basalt-space-lg" data-table-showcase="fleet">
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
		</ShowcasePage>
	);
}
