"use client";

import { AppHeader, AppHeaderMenuButton } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { Input } from "@nocoo/basalt/components/input";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Meter } from "@nocoo/basalt/components/meter";
import { PageHeader } from "@nocoo/basalt/components/page-header";
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
import { Switch } from "@nocoo/basalt/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { KeyRound, Settings, Shield, Users } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export const WORKSPACE_SETTINGS_CONFIG = {
	brandName: "Northstar",
	title: "Workspace settings",
	description: "Manage your team, access, security and usage.",
	defaultName: "Northstar studio",
	defaultEmail: "team@example.com",
} as const;

export const INITIAL_KEYS = ["Production key", "Development key"];

export const INITIAL_SESSIONS = [
	{ device: "MacBook Pro — Chrome", location: "San Francisco · Active now", current: true },
	{ device: "iPhone 15 — Safari", location: "San Francisco · 2 hours ago", current: false },
	{ device: "Windows PC — Firefox", location: "Austin · Yesterday", current: false },
] as const;

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

export default function WorkspaceSettingsTemplate() {
	const mobile = useSyncExternalStore(subscribeMobile, isMobile, serverMobile);
	const [drawerOpen, setDrawerOpen] = useState(false);
	useEffect(() => {
		if (!mobile) setDrawerOpen(false);
	}, [mobile]);
	const navigationTrigger = useRef<HTMLButtonElement>(null);
	const [name, setName] = useState<string>(WORKSPACE_SETTINGS_CONFIG.defaultName);
	const [email, setEmail] = useState<string>(WORKSPACE_SETTINGS_CONFIG.defaultEmail);
	const [saved, setSaved] = useState(false);
	const [invites, setInvites] = useState(true);
	const [alerts, setAlerts] = useState(true);
	const [keys, setKeys] = useState<string[]>(INITIAL_KEYS);
	const [sessions, setSessions] = useState(INITIAL_SESSIONS.map((item) => ({ ...item })));
	const [nextKey, setNextKey] = useState(1);
	const [tab, setTab] = useState("general");
	function navigate(value: string) {
		setTab(value);
		setDrawerOpen(false);
	}
	function sidebar(drawer: boolean) {
		return (
			<Sidebar resizable={false}>
				<SidebarHeader>
					<SidebarBrand
						logo={<Settings />}
						name={WORKSPACE_SETTINGS_CONFIG.brandName}
						action={
							drawer ? (
								<SidebarToggle mode="dismiss" onDismiss={() => setDrawerOpen(false)} />
							) : undefined
						}
					/>
				</SidebarHeader>
				<SidebarNav aria-label="Workspace navigation">
					<SidebarItem active={tab === "general"} onClick={() => navigate("general")}>
						<Settings /> Settings
					</SidebarItem>
					<SidebarItem active={tab === "members"} onClick={() => navigate("members")}>
						<Users /> Members
					</SidebarItem>
					<SidebarItem active={tab === "security"} onClick={() => navigate("security")}>
						<Shield /> Security
					</SidebarItem>
					<SidebarItem active={tab === "keys"} onClick={() => navigate("keys")}>
						<KeyRound /> API keys
					</SidebarItem>
				</SidebarNav>
			</Sidebar>
		);
	}

	return (
		<SidebarProvider>
			<AppShell layout="responsive">
				<AppSkipLink>Skip to content</AppSkipLink>
				<div id="settings-sidebar" className="hidden md:block">
					{sidebar(false)}
				</div>
				<SidebarDrawer
					id="settings-navigation"
					returnFocusRef={navigationTrigger}
					open={drawerOpen}
					onOpenChange={setDrawerOpen}
					title="Workspace navigation"
				>
					{sidebar(true)}
				</SidebarDrawer>
				<AppMain>
					<AppHeader
						title="Workspace settings"
						leading={
							mobile && (
								<AppHeaderMenuButton
									ref={navigationTrigger}
									onClick={() => setDrawerOpen(true)}
									aria-expanded={drawerOpen}
									aria-controls="settings-navigation"
								/>
							)
						}
					/>
					<ContentIsland className="overflow-auto">
						<div className="mx-auto space-y-basalt-layout-lg" style={{ maxWidth: "64rem" }}>
							<div id="settings-header">
								<PageHeader
									title={WORKSPACE_SETTINGS_CONFIG.title}
									description={WORKSPACE_SETTINGS_CONFIG.description}
								/>
							</div>
							<Tabs value={tab} onValueChange={setTab}>
								<TabsList id="settings-tabs">
									<TabsTrigger value="general">General</TabsTrigger>
									<TabsTrigger value="members">Members</TabsTrigger>
									<TabsTrigger value="security">Security</TabsTrigger>
									<TabsTrigger value="keys">API Keys</TabsTrigger>
									<TabsTrigger value="quotas">Quotas</TabsTrigger>
								</TabsList>
								<div id="settings-panel">
									<TabsContent value="general">
										<LayerCard padding="none">
											<LayerCard.Header>Workspace profile</LayerCard.Header>
											<LayerCard.Body className="space-y-basalt-card">
												<div className="space-y-basalt-space-lg">
													<Label htmlFor="workspace-name">Workspace name</Label>
													<Input
														id="workspace-name"
														value={name}
														onChange={(event) => {
															setName(event.target.value);
															setSaved(false);
														}}
													/>
												</div>
												<div className="space-y-basalt-space-lg">
													<Label htmlFor="workspace-email">Contact email</Label>
													<Input
														id="workspace-email"
														type="email"
														value={email}
														onChange={(event) => {
															setEmail(event.target.value);
															setSaved(false);
														}}
													/>
												</div>
												<Button onClick={() => setSaved(true)}>Save changes</Button>
												{saved && (
													<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
														Changes saved locally.
													</p>
												)}
											</LayerCard.Body>
										</LayerCard>
									</TabsContent>
									<TabsContent value="members">
										<LayerCard padding="none">
											<LayerCard.Header>Team access</LayerCard.Header>
											<LayerCard.Body className="space-y-basalt-card">
												<div className="flex items-center justify-between gap-basalt-layout">
													<div>
														<p>Allow member invitations</p>
														<p className="text-basalt-sm text-basalt-muted-foreground">
															Members can invite colleagues to this workspace.
														</p>
													</div>
													<Switch
														aria-label="Allow member invitations"
														checked={invites}
														onCheckedChange={setInvites}
													/>
												</div>
												<div className="flex items-center justify-between gap-basalt-layout">
													<div>
														<p>Security alerts</p>
														<p className="text-basalt-sm text-basalt-muted-foreground">
															Notify owners about access changes.
														</p>
													</div>
													<Switch
														aria-label="Security alerts"
														checked={alerts}
														onCheckedChange={setAlerts}
													/>
												</div>
												<p className="text-basalt-sm text-basalt-muted-foreground">
													3 members · 2 administrators
												</p>
											</LayerCard.Body>
										</LayerCard>
									</TabsContent>
									<TabsContent value="security">
										<LayerCard padding="none">
											<LayerCard.Header>Active sessions</LayerCard.Header>
											<LayerCard.Body className="space-y-basalt-card-sm">
												{sessions.map((session) => (
													<div
														key={session.device}
														className="flex items-center justify-between gap-basalt-layout"
													>
														<div>
															<div className="flex flex-wrap items-center gap-basalt-space-md">
																<span>{session.device}</span>
																{session.current && <Badge tone="success">Current</Badge>}
															</div>
															<p className="text-basalt-sm text-basalt-muted-foreground">
																{session.location}
															</p>
														</div>
														{!session.current && (
															<Button
																size="sm"
																variant="outline"
																aria-label={`Revoke ${session.device}`}
																onClick={() =>
																	setSessions((current) =>
																		current.filter((item) => item.device !== session.device),
																	)
																}
															>
																Revoke
															</Button>
														)}
													</div>
												))}
											</LayerCard.Body>
										</LayerCard>
									</TabsContent>
									<TabsContent value="keys">
										<LayerCard padding="none">
											<LayerCard.Header>
												<span>API keys</span>
												<Button
													size="sm"
													onClick={() => {
														setKeys((current) => [...current, `New key ${nextKey}`]);
														setNextKey((current) => current + 1);
													}}
												>
													Create key
												</Button>
											</LayerCard.Header>
											<LayerCard.Body className="space-y-basalt-card-sm">
												{keys.map((key) => (
													<div
														key={key}
														className="flex items-center justify-between gap-basalt-space-lg"
													>
														<span>
															{key} <Badge variant="outline">Active</Badge>
														</span>
														<Button
															size="sm"
															variant="outline"
															onClick={() =>
																setKeys((current) => current.filter((item) => item !== key))
															}
														>
															Revoke
														</Button>
													</div>
												))}
												{keys.length === 0 && (
													<p className="text-basalt-sm text-basalt-muted-foreground">
														No active keys.
													</p>
												)}
											</LayerCard.Body>
										</LayerCard>
									</TabsContent>
									<TabsContent value="quotas">
										<LayerCard padding="none">
											<LayerCard.Header>Usage this month</LayerCard.Header>
											<LayerCard.Body className="space-y-basalt-card">
												<Meter label="API requests" value={62} customValue="62k / 100k" />
												<Meter label="Storage" value={38} customValue="38 GB / 100 GB" />
												<Meter label="Members" value={30} customValue="3 / 10" />
											</LayerCard.Body>
										</LayerCard>
									</TabsContent>
								</div>
							</Tabs>
						</div>
					</ContentIsland>
				</AppMain>
			</AppShell>
		</SidebarProvider>
	);
}
