import { AppHeader } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Badge } from "@nocoo/basalt/components/badge";
import { DataTable, type DataTableColumn } from "@nocoo/basalt/components/data-table";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Meter } from "@nocoo/basalt/components/meter";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import {
	ContentIsland,
	Sidebar,
	SidebarBrand,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
	SidebarProvider,
} from "@nocoo/basalt/components/sidebar";
import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";
import { BarChart3, LayoutDashboard, Users } from "lucide-react";
import { useState } from "react";

type Account = { name: string; owner: string; revenue: number; status: "On track" | "At risk" };
const ACCOUNTS: Account[] = [
	{ name: "Northstar", owner: "Maya Chen", revenue: 124000, status: "On track" },
	{ name: "Meridian", owner: "Alex Rivera", revenue: 98000, status: "On track" },
	{ name: "Evergreen", owner: "Sam Brooks", revenue: 76000, status: "At risk" },
	{ name: "Harbor", owner: "Maya Chen", revenue: 62000, status: "On track" },
];
const COLUMNS: DataTableColumn<Account>[] = [
	{ id: "name", header: "Account", accessor: (row) => row.name, sortValue: (row) => row.name },
	{ id: "owner", header: "Owner", accessor: (row) => row.owner, sortValue: (row) => row.owner },
	{
		id: "revenue",
		header: "Revenue",
		accessor: (row) => `$${row.revenue.toLocaleString()}`,
		sortValue: (row) => row.revenue,
		textAlign: "end",
	},
	{
		id: "status",
		header: "Status",
		accessor: (row) => (
			<Badge variant={row.status === "At risk" ? "warning" : "outline"}>{row.status}</Badge>
		),
		sortValue: (row) => row.status,
		filterValue: (row) => row.status,
	},
];

export default function ExecutiveDashboardTemplate() {
	const [filter, setFilter] = useState("");
	return (
		<SidebarProvider>
			<AppShell layout="responsive">
				<AppSkipLink>Skip to content</AppSkipLink>
				<Sidebar className="hidden md:flex" resizable={false}>
					<SidebarHeader>
						<SidebarBrand logo={<BarChart3 />} name="Northstar" />
					</SidebarHeader>
					<SidebarNav aria-label="Dashboard navigation">
						<SidebarItem active>
							<LayoutDashboard /> Overview
						</SidebarItem>
						<SidebarItem onClick={() => document.getElementById("account-list")?.scrollIntoView()}>
							<Users /> Accounts
						</SidebarItem>
					</SidebarNav>
				</Sidebar>
				<AppMain>
					<AppHeader title="Overview" />
					<ContentIsland className="overflow-auto">
						<div className="space-y-basalt-layout-lg">
							<PageHeader
								title="Executive overview"
								description="A clear view of performance and capacity."
							/>
							<StatGrid columns={4}>
								<StatCard
									title="Revenue"
									value="$482k"
									subtitle="This quarter"
									trend={{ value: 8.2, label: "vs. last quarter" }}
								/>
								<StatCard title="Active accounts" value="128" subtitle="Across all regions" />
								<StatCard title="Retention" value="96.4%" subtitle="Trailing 12 months" />
								<StatCard title="Open orders" value="42" subtitle="Awaiting fulfillment" />
							</StatGrid>
							<div className="grid gap-basalt-layout md:grid-cols-2">
								<LayerCard padding="none">
									<LayerCard.Header>Capacity</LayerCard.Header>
									<LayerCard.Body className="space-y-basalt-card">
										<Meter label="Team utilization" value={68} />
										<Meter label="Delivery capacity" value={54} />
										<Meter label="Support coverage" value={81} />
									</LayerCard.Body>
								</LayerCard>
								<LayerCard padding="none">
									<LayerCard.Header>Channel mix</LayerCard.Header>
									<LayerCard.Body className="space-y-basalt-card">
										<Meter label="Direct" value={48} />
										<Meter label="Partners" value={32} />
										<Meter label="Self-service" value={20} />
									</LayerCard.Body>
								</LayerCard>
							</div>
							<LayerCard id="account-list" padding="none">
								<LayerCard.Header className="flex-wrap justify-between">
									<span>Accounts</span>
									<Input
										aria-label="Filter accounts"
										placeholder="Filter accounts"
										value={filter}
										onChange={(event) => setFilter(event.target.value)}
									/>
								</LayerCard.Header>
								<DataTable
									data={ACCOUNTS}
									columns={COLUMNS}
									filter={filter}
									getRowId={(row) => row.name}
									edge="attached"
								/>
							</LayerCard>
						</div>
					</ContentIsland>
				</AppMain>
			</AppShell>
		</SidebarProvider>
	);
}
