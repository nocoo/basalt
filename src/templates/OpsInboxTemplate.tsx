"use client";

import { AppHeader, AppHeaderMenuButton } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Empty } from "@nocoo/basalt/components/empty";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Meter } from "@nocoo/basalt/components/meter";
import {
	ContentIsland,
	Sidebar,
	SidebarBrand,
	SidebarDrawer,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
	SidebarProvider,
	SidebarToggle,
} from "@nocoo/basalt/components/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { Activity, Inbox, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const mobileQuery = "(width < 768px)";
function subscribeMobile(notify: () => void) {
	const media = window.matchMedia(mobileQuery);
	media.addEventListener("change", notify);
	return () => media.removeEventListener("change", notify);
}
function isMobile() {
	return window.matchMedia(mobileQuery).matches;
}
function serverMobile() {
	return false;
}

export const OPS_CONFIG = {
	brandName: "Signal desk",
	title: "Operations inbox",
	description: "Triage the signals that need attention.",
} as const;

export const RUNBOOK_STEPS = [
	"Confirm the alert",
	"Check service health",
	"Notify the owner",
] as const;

type Incident = {
	id: string;
	title: string;
	service: string;
	status: "open" | "resolved" | "escalated";
	sla: number;
};
export const INITIAL_INCIDENTS: Incident[] = [
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
	const mobile = useSyncExternalStore(subscribeMobile, isMobile, serverMobile);
	const [drawerOpen, setDrawerOpen] = useState(false);
	useEffect(() => {
		if (!mobile) setDrawerOpen(false);
	}, [mobile]);
	const navigationTrigger = useRef<HTMLButtonElement>(null);
	const navigationReturnTarget = useRef<HTMLElement | null>(null);
	const [items, setItems] = useState(INITIAL_INCIDENTS);
	const [selected, setSelected] = useState(INITIAL_INCIDENTS[0].id);
	const [filter, setFilter] = useState("all");
	const [query, setQuery] = useState("");
	const [checks, setChecks] = useState<Record<string, boolean>>({});
	const visible = items.filter(
		(item) =>
			(filter === "all" || item.status === filter) &&
			`${item.id} ${item.title} ${item.service}`.toLowerCase().includes(query.toLowerCase()),
	);
	const incident = visible.find((item) => item.id === selected) ?? visible[0] ?? null;

	function update(status: Incident["status"]) {
		setItems((current) =>
			current.map((item) => (item.id === incident?.id ? { ...item, status } : item)),
		);
	}
	function sidebar(drawer: boolean) {
		return (
			<Sidebar resizable={false}>
				<SidebarHeader>
					<SidebarBrand
						logo={<Activity />}
						name={OPS_CONFIG.brandName}
						action={
							drawer ? (
								<SidebarToggle mode="dismiss" onDismiss={() => setDrawerOpen(false)} />
							) : undefined
						}
					/>
				</SidebarHeader>
				<SidebarNav aria-label="Operations">
					<SidebarItem active onClick={() => setDrawerOpen(false)}>
						<Inbox /> Inbox
					</SidebarItem>
					<SidebarItem
						onClick={() => {
							const target = incident ? document.getElementById(`${incident.id}-0`) : null;
							if (drawer) {
								navigationReturnTarget.current = target ?? navigationTrigger.current;
								setDrawerOpen(false);
							} else target?.focus();
						}}
					>
						<ShieldCheck /> Runbooks
					</SidebarItem>
				</SidebarNav>
			</Sidebar>
		);
	}

	return (
		<SidebarProvider>
			<AppShell layout="responsive">
				<AppSkipLink>Skip to content</AppSkipLink>
				<div id="ops-sidebar" className="hidden md:block">
					{sidebar(false)}
				</div>
				<SidebarDrawer
					id="ops-navigation"
					returnFocusRef={navigationReturnTarget}
					open={drawerOpen}
					onOpenChange={setDrawerOpen}
					title="Operations"
				>
					{sidebar(true)}
				</SidebarDrawer>
				<AppMain>
					<AppHeader
						title={OPS_CONFIG.title}
						leading={
							mobile && (
								<AppHeaderMenuButton
									ref={navigationTrigger}
									onClick={() => {
										navigationReturnTarget.current = navigationTrigger.current;
										setDrawerOpen(true);
									}}
									aria-expanded={drawerOpen}
									aria-controls="ops-navigation"
								/>
							)
						}
					/>
					<ContentIsland className="overflow-auto">
						<div className="space-y-basalt-layout">
							<div>
								<h1 className="text-basalt-3xl font-semibold">{OPS_CONFIG.title}</h1>
								<p className="text-basalt-muted-foreground">{OPS_CONFIG.description}</p>
							</div>
							<div className="grid min-w-0 gap-basalt-layout md:grid-cols-[minmax(12rem,20rem)_minmax(0,1fr)]">
								<LayerCard id="ops-queue" padding="none">
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
													active={item.id === incident?.id}
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
								<LayerCard id="ops-detail" padding="none">
									<LayerCard.Header>{incident?.title ?? "Select an incident"}</LayerCard.Header>
									{incident ? (
										<LayerCard.Body className="space-y-basalt-layout">
											<div className="flex flex-wrap items-center gap-basalt-space-lg">
												<span className="text-basalt-sm text-basalt-muted-foreground">
													{incident.id} · {incident.service}
												</span>
												<Badge
													tone={
														incident.status === "resolved"
															? "success"
															: incident.status === "escalated"
																? "warning"
																: "neutral"
													}
													variant={
														incident.status === "resolved" || incident.status === "escalated"
															? "soft"
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
											<div id="ops-runbook" className="space-y-basalt-card-sm">
												<h2 className="text-basalt-lg font-semibold">Runbook</h2>
												{RUNBOOK_STEPS.map((step, index) => (
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
												))}
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
									) : (
										<LayerCard.Body>
											<Empty
												title="No incident selected"
												description="No incidents match this filter."
												action={
													<Button
														variant="outline"
														onClick={() => {
															setFilter("all");
															setQuery("");
														}}
													>
														Reset filter
													</Button>
												}
											/>
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
