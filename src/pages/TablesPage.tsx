import { AvatarInitials } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
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
import { Sparkline } from "@/components/charts/sparkline";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatPercent, formatUsd } from "@/lib/format";
import {
	type CompanyRow,
	type DealRow,
	type DeviceRow,
	type TableShowcaseTab,
	useTableShowcaseViewModel,
} from "@/viewmodels/useTableShowcaseViewModel";

const DENSE = "whitespace-nowrap";
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
				<Badge variant="outline" className="px-basalt-space-md">
					+{extra}
				</Badge>
			) : null}
		</div>
	);
}

function OwnerCell({ name, initials }: { name: string; initials: string }) {
	return (
		<div className="flex items-center gap-basalt-space-lg">
			<AvatarInitials name={name} initials={initials} size="sm" />
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
	return "neutral";
}

export default function TablesPage() {
	const vm = useTableShowcaseViewModel();

	const companyColumns: DataTableColumn<CompanyRow>[] = [
		{
			id: "name",
			header: "Company",
			accessor: (row) => <span className="font-medium">{row.name}</span>,
			sortValue: (row) => row.name,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "tags",
			header: "Segment & stage",
			accessor: (row) => <TagStack tags={row.tags} />,
			sortable: false,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "owner",
			header: "Owner",
			accessor: (row) => <OwnerCell name={row.owner} initials={row.initials} />,
			sortValue: (row) => row.owner,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "deals",
			textAlign: "end",
			header: "Open deals",
			accessor: (row) => row.deals,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
			width: 88,
		},
		{
			id: "pipeline",
			textAlign: "end",
			header: "Pipeline value",
			accessor: (row) => formatUsd(row.pipeline),
			sortValue: (row) => row.pipeline,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
		{
			id: "win",
			header: "Win probability",
			accessor: (row) => (
				<Meter
					value={row.win}
					size="sm"
					aria-label={`${row.name} Win probability`}
					className="w-32"
				/>
			),
			sortValue: (row) => row.win,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "trend",
			header: "Activity trend",
			accessor: (row) => (
				<Sparkline
					className="h-4 w-16"
					data={row.trend.map((y, x) => ({ x, y }))}
					ariaLabel={`${row.name} Activity trend`}
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
			header: "Last interaction",
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
			header: "Deal",
			accessor: (row) => <span className="font-medium">{row.name}</span>,
			sortValue: (row) => row.name,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "company",
			header: "Company",
			accessor: (row) => row.company,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "stage",
			header: "Stage",
			accessor: (row) => <TagBadge name={row.stage} color={TAG_COLOR[row.stage]} size="sm" />,
			sortValue: (row) => row.stage,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "value",
			textAlign: "end",
			header: "Value",
			accessor: (row) => formatUsd(row.value),
			sortValue: (row) => row.value,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
		{
			id: "close",
			header: "Close",
			accessor: (row) => row.close,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "owner",
			header: "Owner",
			accessor: (row) => row.owner,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
	];

	const forecastColumns: DataTableColumn<(typeof vm.forecast)[number]>[] = [
		{
			id: "stage",
			header: "Stage",
			accessor: (row) => <TagBadge name={row.stage} color={TAG_COLOR[row.stage]} size="sm" />,
			sortValue: (row) => row.stage,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "count",
			textAlign: "end",
			header: "Companies",
			accessor: (row) => row.count,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
		{
			id: "pipeline",
			textAlign: "end",
			header: "Pipeline value",
			accessor: (row) => formatUsd(row.pipeline),
			sortValue: (row) => row.pipeline,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
		{
			id: "win",
			header: "Win probability",
			accessor: (row) => (
				<Meter
					value={row.win}
					size="sm"
					aria-label={`${row.stage} Win probability`}
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
			header: "Invoice",
			accessor: (row) => row.id,
			cellClassName: `${DENSE} font-medium`,
			headerClassName: DENSE,
		},
		{
			id: "customer",
			header: "Customer",
			accessor: (row) => row.customer,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "status",
			header: "Status",
			accessor: (row) => (
				<Badge dot tone={invoiceStatus(row.status)}>
					{row.status}
				</Badge>
			),
			sortValue: (row) => row.status,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "amount",
			textAlign: "end",
			header: "Amount",
			accessor: (row) => formatUsd(row.amount),
			sortValue: (row) => row.amount,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
		{
			id: "date",
			header: "Date",
			accessor: (row) => row.date,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
	];

	const deviceColumns: DataTableColumn<DeviceRow>[] = [
		{
			id: "name",
			header: "Device",
			accessor: (row) => <span className="font-medium">{row.name}</span>,
			sortValue: (row) => row.name,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "region",
			header: "Region",
			accessor: (row) => row.region,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "status",
			header: "Status",
			accessor: (row) => (
				<Badge dot tone={deviceStatus(row.status)}>
					{row.status}
				</Badge>
			),
			sortValue: (row) => row.status,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "battery",
			header: "Battery",
			accessor: (row) => (
				<Meter
					value={row.battery}
					size="sm"
					tone="auto"
					aria-label={`${row.name} Battery`}
					className="w-32"
				/>
			),
			sortValue: (row) => row.battery,
			cellClassName: DENSE,
			headerClassName: DENSE,
		},
		{
			id: "requests",
			textAlign: "end",
			header: "Requests",
			accessor: (row) => row.requests.toLocaleString("en-US"),
			sortValue: (row) => row.requests,
			cellClassName: `${DENSE} tabular-nums`,
			headerClassName: DENSE,
		},
	];

	return (
		<ShowcasePage
			title="Tables"
			description="Dense headers, filters and cell recipes. Recombine the chrome with different bodies."
		>
			<SectionRule
				title="Pipeline"
				hint="Tabs switch the body. Filters stay. Cells mix tags, owners, money, meters and trends."
			>
				<LayerCard padding="none" data-table-showcase="pipeline">
					<Tabs value={vm.tab} onValueChange={(value) => vm.setTab(value as TableShowcaseTab)}>
						<div className="flex flex-wrap items-center justify-between gap-basalt-card px-basalt-card pt-basalt-card-sm">
							<TabsList>
								<TabsTrigger value="companies">Companies</TabsTrigger>
								<TabsTrigger value="deals">Deals</TabsTrigger>
								<TabsTrigger value="forecast">Forecast</TabsTrigger>
							</TabsList>
							<div className="flex flex-wrap gap-basalt-space-lg">
								<Button variant="outline">Export</Button>
								<Button>New company</Button>
							</div>
						</div>
						<div className="border-b border-basalt-border/60 px-basalt-card py-basalt-card-sm">
							<FilterBar
								label="Pipeline filters"
								active={vm.owner !== "all" || vm.stage !== "all"}
								onClear={() => {
									vm.setOwner("all");
									vm.setStage("all");
								}}
							>
								<Select value={vm.owner} onValueChange={vm.setOwner}>
									<SelectTrigger aria-label="Owner" className="w-44">
										<SelectValue placeholder="All owners" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All owners</SelectItem>
										{vm.owners.map((name) => (
											<SelectItem key={name} value={name}>
												{name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select value={vm.stage} onValueChange={vm.setStage}>
									<SelectTrigger aria-label="Stage" className="w-40">
										<SelectValue placeholder="Any stage" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Any stage</SelectItem>
										{vm.stages.map((name) => (
											<SelectItem key={name} value={name}>
												{name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FilterBar>
						</div>
						<div className="min-w-0">
							<TabsContent value="companies" className="mt-0">
								<DataTable
									aria-label="Companies"
									edge="attached"
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
									aria-label="Deals"
									edge="attached"
									data={[...vm.deals]}
									columns={dealColumns}
									getRowId={(row) => row.id}
								/>
							</TabsContent>
							<TabsContent value="forecast" className="mt-0">
								<DataTable
									aria-label="Forecast"
									edge="attached"
									data={vm.forecast}
									columns={forecastColumns}
									getRowId={(row) => row.stage}
								/>
							</TabsContent>
						</div>
					</Tabs>
					<div className="grid grid-cols-2 gap-basalt-card border-t border-basalt-border/60 px-basalt-card py-basalt-card-sm text-basalt-sm text-basalt-muted-foreground md:grid-cols-4">
						<div>
							{vm.tab === "deals"
								? `${vm.dealCount} deals in view`
								: `${vm.companyCount} companies in view`}
						</div>
						<div className="tabular-nums">{`Sum of pipeline ${formatUsd(vm.pipelineSum)}`}</div>
						<div className="tabular-nums">{`Avg win ${formatPercent(vm.winAvg)}`}</div>
						<div>Add calculation</div>
					</div>
				</LayerCard>
			</SectionRule>

			<SectionRule title="Ledger" hint="Search header, status tags, tabular money and paged rows.">
				<LayerCard className="space-y-basalt-card" data-table-showcase="ledger">
					<Input
						className="max-w-64"
						aria-label="Search invoices"
						placeholder="Search invoices"
						value={vm.invoiceQuery}
						onChange={(event) => vm.setInvoiceQuery(event.target.value)}
					/>
					<DataTable
						aria-label="Ledger"
						data={[...vm.invoices]}
						columns={invoiceColumns}
						filter={vm.invoiceQuery}
						pageSize={4}
						getRowId={(row) => row.id}
					/>
				</LayerCard>
			</SectionRule>

			<SectionRule title="Fleet" hint="Status filter with battery meters in the same grid.">
				<LayerCard className="space-y-basalt-card" data-table-showcase="fleet">
					<FilterBar
						label="Device filters"
						active={vm.deviceStatus !== "all"}
						onClear={() => vm.setDeviceStatus("all")}
					>
						<Select value={vm.deviceStatus} onValueChange={vm.setDeviceStatus}>
							<SelectTrigger aria-label="Status" className="w-40">
								<SelectValue placeholder="Any status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Any status</SelectItem>
								{vm.deviceStates.map((name) => (
									<SelectItem key={name} value={name}>
										{name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FilterBar>
					<DataTable
						aria-label="Fleet"
						data={[...vm.devices]}
						columns={deviceColumns}
						getRowId={(row) => row.id}
					/>
				</LayerCard>
			</SectionRule>
		</ShowcasePage>
	);
}
