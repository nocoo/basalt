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
import { KeyRound, Settings, Users } from "lucide-react";
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

export default function WorkspaceSettingsTemplate() {
	const mobile = useSyncExternalStore(subscribeMobile, isMobile, serverMobile);
	const [drawerOpen, setDrawerOpen] = useState(false);
	useEffect(() => {
		if (!mobile) setDrawerOpen(false);
	}, [mobile]);
	const navigationTrigger = useRef<HTMLButtonElement>(null);
	const [name, setName] = useState("Northstar studio");
	const [email, setEmail] = useState("team@example.com");
	const [saved, setSaved] = useState(false);
	const [invites, setInvites] = useState(true);
	const [alerts, setAlerts] = useState(true);
	const [keys, setKeys] = useState(["Production key", "Development key"]);
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
						name="Northstar"
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
				<div className="hidden md:block">{sidebar(false)}</div>
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
							<PageHeader
								title="Workspace settings"
								description="Manage your team, access and usage."
							/>
							<Tabs value={tab} onValueChange={setTab}>
								<TabsList>
									<TabsTrigger value="general">General</TabsTrigger>
									<TabsTrigger value="members">Members</TabsTrigger>
									<TabsTrigger value="keys">API Keys</TabsTrigger>
									<TabsTrigger value="quotas">Quotas</TabsTrigger>
								</TabsList>
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
								<TabsContent value="keys">
									<LayerCard padding="none">
										<LayerCard.Header className="justify-between">
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
							</Tabs>
						</div>
					</ContentIsland>
				</AppMain>
			</AppShell>
		</SidebarProvider>
	);
}
