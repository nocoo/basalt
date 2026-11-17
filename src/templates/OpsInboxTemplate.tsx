import { AppHeader } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Meter } from "@nocoo/basalt/components/meter";
import {
	ContentIsland,
	Sidebar,
	SidebarBrand,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
	SidebarProvider,
} from "@nocoo/basalt/components/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { Activity, Inbox, ShieldCheck } from "lucide-react";
import { useState } from "react";

type Incident = {
	id: string;
	title: string;
	service: string;
	status: "open" | "resolved" | "escalated";
	sla: number;
};
const INITIAL: Incident[] = [
	{
		id: "INC-1042",
		title: "Elevated API latency",
		service: "Gateway · 8 min ago",
		status: "open",
		sla: 72,
	},
	{
		id: "INC-1041",
		title: "Queue backlog growing",
		service: "Delivery · 21 min ago",
		status: "open",
		sla: 46,
	},
	{
		id: "INC-1038",
		title: "Storage health check",
		service: "Storage · 1 hour ago",
		status: "resolved",
		sla: 24,
	},
];

export default function OpsInboxTemplate() {
	const [items, setItems] = useState(INITIAL);
	const [selected, setSelected] = useState(INITIAL[0].id);
	const [filter, setFilter] = useState("all");
	const [query, setQuery] = useState("");
	const [checks, setChecks] = useState<Record<string, boolean>>({});
	const visible = items.filter(
		(item) =>
			(filter === "all" || item.status === filter) &&
			`${item.id} ${item.title} ${item.service}`.toLowerCase().includes(query.toLowerCase()),
	);
	const incident = items.find((item) => item.id === selected);

	function update(status: Incident["status"]) {
		setItems((current) =>
			current.map((item) => (item.id === selected ? { ...item, status } : item)),
		);
	}

	return (
		<SidebarProvider>
			<AppShell layout="responsive">
				<AppSkipLink>Skip to content</AppSkipLink>
				<Sidebar className="hidden md:flex" resizable={false}>
					<SidebarHeader>
						<SidebarBrand logo={<Activity />} name="Signal desk" />
					</SidebarHeader>
					<SidebarNav aria-label="Operations">
						<SidebarItem active>
							<Inbox /> Inbox
						</SidebarItem>
						<SidebarItem onClick={() => document.getElementById(`${selected}-0`)?.focus()}>
							<ShieldCheck /> Runbooks
						</SidebarItem>
					</SidebarNav>
				</Sidebar>
				<AppMain>
					<AppHeader title="Operations inbox" />
					<ContentIsland className="overflow-auto">
						<div className="space-y-basalt-layout">
							<div>
								<h1 className="text-basalt-3xl font-semibold">Operations inbox</h1>
								<p className="text-basalt-muted-foreground">
									Triage the signals that need attention.
								</p>
							</div>
							<div className="grid min-w-0 gap-basalt-layout lg:grid-cols-[minmax(15rem,1fr)_minmax(0,2fr)]">
								<LayerCard padding="none">
									<LayerCard.Header>Incident queue</LayerCard.Header>
									<LayerCard.Body className="space-y-basalt-card-sm">
										<Input
											aria-label="Search incidents"
											placeholder="Search incidents"
											value={query}
											onChange={(event) => setQuery(event.target.value)}
										/>
										<Tabs value={filter} onValueChange={setFilter}>
											<TabsList>
												<TabsTrigger value="all">All</TabsTrigger>
												<TabsTrigger value="open">Open</TabsTrigger>
												<TabsTrigger value="resolved">Resolved</TabsTrigger>
												<TabsTrigger value="escalated">Escalated</TabsTrigger>
											</TabsList>
										</Tabs>
										<div className="flex flex-col gap-basalt-space-sm">
											{visible.map((item) => (
												<SidebarItem
													key={item.id}
													active={item.id === selected}
													onClick={() => setSelected(item.id)}
												>
													<div className="min-w-0">
														<p>{item.title}</p>
														<p className="text-basalt-xs text-basalt-muted-foreground">
															{item.id} · {item.service}
														</p>
													</div>
												</SidebarItem>
											))}
											{visible.length === 0 && (
												<p className="text-basalt-sm text-basalt-muted-foreground">
													No incidents match this filter.
												</p>
											)}
										</div>
									</LayerCard.Body>
								</LayerCard>
								<LayerCard padding="none">
									<LayerCard.Header>{incident?.title ?? "Select an incident"}</LayerCard.Header>
									{incident && (
										<LayerCard.Body className="space-y-basalt-layout">
											<div className="flex flex-wrap items-center gap-basalt-space-lg">
												<span className="text-basalt-sm text-basalt-muted-foreground">
													{incident.id} · {incident.service}
												</span>
												<Badge
													variant={
														incident.status === "resolved"
															? "success"
															: incident.status === "escalated"
																? "warning"
																: "outline"
													}
												>
													{incident.status}
												</Badge>
											</div>
											<p>
												Investigate the affected service and record the next action before updating
												the incident.
											</p>
											<Meter
												label="SLA window used"
												value={incident.sla}
												tone={incident.sla >= 90 ? "danger" : "default"}
											/>
											<div className="space-y-basalt-card-sm">
												<h2 className="text-basalt-lg font-semibold">Runbook</h2>
												{["Confirm the alert", "Check service health", "Notify the owner"].map(
													(step, index) => (
														<label
															key={step}
															htmlFor={`${incident.id}-${index}`}
															className="flex items-center gap-basalt-space-lg"
														>
															<Checkbox
																id={`${incident.id}-${index}`}
																checked={Boolean(checks[`${incident.id}:${step}`])}
																onCheckedChange={(checked) =>
																	setChecks((current) => ({
																		...current,
																		[`${incident.id}:${step}`]: checked === true,
																	}))
																}
															/>
															{step}
														</label>
													),
												)}
											</div>
											<div className="flex flex-wrap gap-basalt-space-lg">
												<Button
													onClick={() => update("resolved")}
													disabled={incident.status === "resolved"}
												>
													Resolve
												</Button>
												<Button
													variant="outline"
													onClick={() => update("escalated")}
													disabled={incident.status === "escalated"}
												>
													Escalate
												</Button>
											</div>
										</LayerCard.Body>
									)}
								</LayerCard>
							</div>
						</div>
					</ContentIsland>
				</AppMain>
			</AppShell>
		</SidebarProvider>
	);
}
