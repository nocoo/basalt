"use client";

import { AppHeader, AppHeaderMenuButton } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { CodeHighlighted } from "@nocoo/basalt/components/code";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Loader } from "@nocoo/basalt/components/loader";
import { Meter } from "@nocoo/basalt/components/meter";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import {
	ContentIsland,
	Sidebar,
	SidebarBrand,
	SidebarDrawer,
	SidebarGroup,
	SidebarHeader,
	SidebarIconItem,
	SidebarItem,
	SidebarNav,
	SidebarProvider,
	SidebarToggle,
} from "@nocoo/basalt/components/sidebar";
import { Textarea } from "@nocoo/basalt/components/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";
import { Bot, FileCode, MessageSquare, Plus, Send } from "lucide-react";
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

const ARTIFACTS = [
	{
		name: "plan.md",
		code: "# Release checklist\n- Verify the migration\n- Review the deployment plan",
	},
	{ name: "changes.diff", code: "- timeout: 15\n+ timeout: 30\n+ retries: 2" },
	{ name: "health.json", code: '{\n  "status": "healthy",\n  "checks": 12\n}' },
];

export const AGENT_CONFIG = {
	brandName: "Fieldwork",
	workspaceLabel: "Local workspace",
	defaultModel: "balanced",
	eyebrow: "WORKSPACE / SESSIONS",
} as const;

export const INITIAL_SESSIONS = ["Release readiness", "API migration", "Weekly summary"];

export default function AgentWorkspaceTemplate() {
	const mobile = useSyncExternalStore(subscribeMobile, isMobile, serverMobile);
	const [search, setSearch] = useState("");
	const [sessions, setSessions] = useState<string[]>(INITIAL_SESSIONS);
	const [session, setSession] = useState("Release readiness");
	const [turns, setTurns] = useState<Record<string, string[]>>({});
	const [collapsed, setCollapsed] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	useEffect(() => {
		if (!mobile) setDrawerOpen(false);
	}, [mobile]);
	const navigationTrigger = useRef<HTMLButtonElement>(null);
	const [draft, setDraft] = useState("");
	const [files, setFiles] = useState(["release-notes.md", "checks.json"]);
	const [artifact, setArtifact] = useState(ARTIFACTS[0]);
	const [running, setRunning] = useState(true);
	const [model, setModel] = useState<string>(AGENT_CONFIG.defaultModel);
	const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "changes">(
		"pending",
	);

	function send(message: string) {
		if (!message.trim()) return;
		setTurns((current) => ({
			...current,
			[session]: [...(current[session] ?? []), message.trim()],
		}));
		setDraft("");
	}

	function sidebar(drawer: boolean) {
		return (
			<Sidebar resizable={false}>
				<SidebarHeader>
					<SidebarBrand
						logo={<Bot />}
						name={AGENT_CONFIG.brandName}
						action={
							drawer ? (
								<SidebarToggle mode="dismiss" onDismiss={() => setDrawerOpen(false)} />
							) : (
								<SidebarToggle />
							)
						}
					/>
				</SidebarHeader>
				<SidebarNav aria-label="Sessions">
					{collapsed && !drawer ? (
						<TooltipProvider>
							{sessions.map((name) => (
								<Tooltip key={name}>
									<TooltipTrigger asChild>
										<SidebarIconItem
											aria-label={name}
											active={name === session}
											onClick={() => setSession(name)}
										>
											<MessageSquare />
										</SidebarIconItem>
									</TooltipTrigger>
									<TooltipContent side="right">{name}</TooltipContent>
								</Tooltip>
							))}
						</TooltipProvider>
					) : (
						<>
							<Input
								aria-label="Search sessions"
								placeholder="Search sessions"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
							<Button
								variant="outline"
								onClick={() => {
									const name = `New session ${sessions.length + 1}`;
									setSessions((current) => [name, ...current]);
									setSession(name);
									setSearch("");
									setDrawerOpen(false);
								}}
							>
								<Plus /> New session
							</Button>
							<SidebarGroup label="Recent sessions">
								{sessions
									.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
									.map((name) => (
										<SidebarItem
											key={name}
											active={name === session}
											onClick={() => {
												setSession(name);
												setDrawerOpen(false);
											}}
										>
											<MessageSquare />
											{name}
										</SidebarItem>
									))}
							</SidebarGroup>
						</>
					)}
				</SidebarNav>
			</Sidebar>
		);
	}

	return (
		<SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>
			<AppShell layout="responsive">
				<AppSkipLink>Skip to content</AppSkipLink>
				<div id="agent-sidebar" className="hidden md:block">
					{sidebar(false)}
				</div>
				<SidebarDrawer
					id="agent-navigation"
					returnFocusRef={navigationTrigger}
					open={drawerOpen}
					onOpenChange={setDrawerOpen}
					title="Sessions"
				>
					{sidebar(true)}
				</SidebarDrawer>
				<AppMain>
					<AppHeader
						leading={
							mobile && (
								<AppHeaderMenuButton
									ref={navigationTrigger}
									onClick={() => setDrawerOpen(true)}
									aria-expanded={drawerOpen}
									aria-controls="agent-navigation"
								/>
							)
						}
						title={session}
						actions={<Badge variant="outline">{AGENT_CONFIG.workspaceLabel}</Badge>}
					/>
					<ContentIsland className="overflow-auto">
						<div
							className="grid min-w-0 gap-basalt-layout-lg"
							style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))" }}
						>
							<div className="min-w-0 space-y-basalt-layout">
								<div>
									<p className="text-basalt-sm text-basalt-muted-foreground">
										{AGENT_CONFIG.eyebrow}
									</p>
									<h1 className="text-basalt-3xl font-semibold">
										{session === "Release readiness" ? "Prepare the release" : "Start a session"}
									</h1>
									<p className="text-basalt-base text-basalt-muted-foreground">
										{session === "Release readiness"
											? "Review the evidence, then choose the next step."
											: "Ask the agent to help with your next task."}
									</p>
								</div>
								{session === "Release readiness" && (
									<>
										<LayerCard>
											<p className="text-basalt-sm font-medium text-basalt-muted-foreground">You</p>
											<p>
												Check whether the migration is ready to ship and summarize any remaining
												risks.
											</p>
										</LayerCard>
										<Collapsible asChild defaultOpen>
											<LayerCard id="agent-trace" padding="none">
												<LayerCard.Header asChild>
													<CollapsibleTrigger className="w-full">
														<Loader
															size={14}
															showLabel={false}
															showElapsed={false}
															label="Running"
														/>{" "}
														Inspecting the workspace <Badge variant="outline">2 steps</Badge>
													</CollapsibleTrigger>
												</LayerCard.Header>
												<CollapsibleContent unstyled>
													<LayerCard.Body className="space-y-basalt-card-sm">
														<p className="text-basalt-sm">
															<Badge tone="success">Complete</Badge> Checked the test report
														</p>
														<p className="text-basalt-sm">
															<Loader size={14} showElapsed={false} label="Reviewing changes" />
														</p>
													</LayerCard.Body>
													<CodeHighlighted
														attached
														title="checks.log"
														code={"12 checks passed\nNo blocking migrations found"}
													/>
												</CollapsibleContent>
											</LayerCard>
										</Collapsible>
										<LayerCard id="agent-approval" padding="none">
											<LayerCard.Header className="justify-between">
												<span>Choose how to proceed</span>
												<Badge
													tone={
														approvalStatus === "approved"
															? "success"
															: approvalStatus === "changes"
																? "warning"
																: "neutral"
													}
													variant="outline"
												>
													{approvalStatus === "approved"
														? "Approved"
														: approvalStatus === "changes"
															? "Changes requested"
															: "Pending approval"}
												</Badge>
											</LayerCard.Header>
											<LayerCard.Body className="space-y-basalt-card-sm">
												<p className="text-basalt-sm text-basalt-muted-foreground">
													The release is ready for review. Approve the staged migration or request a
													follow-up step.
												</p>
												<div className="flex flex-wrap gap-basalt-space-lg">
													<Button
														onClick={() => {
															setApprovalStatus("approved");
															setArtifact(ARTIFACTS[0]);
															send("Approved migration plan for release.");
														}}
													>
														Approve migration
													</Button>
													<Button
														variant="outline"
														onClick={() => {
															setApprovalStatus("changes");
															setArtifact(ARTIFACTS[1]);
															send("Requested follow-up diff review.");
														}}
													>
														Request changes
													</Button>
													<Button
														variant="outline"
														onClick={() => send("Prepare a deployment plan.")}
													>
														Prepare deployment plan
													</Button>
													<Button
														variant="outline"
														onClick={() => send("Summarize remaining risks.")}
													>
														Summarize risks
													</Button>
												</div>
											</LayerCard.Body>
										</LayerCard>
									</>
								)}
								{(turns[session] ?? []).map((turn, index) => (
									<LayerCard key={`${index}-${turn}`}>
										<p className="text-basalt-sm font-medium text-basalt-muted-foreground">You</p>
										<p>{turn}</p>
									</LayerCard>
								))}
								<LayerCard id="agent-composer" padding="none">
									<LayerCard.Body className="space-y-basalt-card-sm">
										<Textarea
											aria-label="Message"
											placeholder="Ask a follow-up question…"
											value={draft}
											onChange={(event) => setDraft(event.target.value)}
										/>
										<div className="flex flex-wrap gap-basalt-space-md">
											{files.map((file) => (
												<Badge
													key={file}
													variant="outline"
													dismissLabel={`Remove ${file}`}
													onDismiss={() =>
														setFiles((current) => current.filter((item) => item !== file))
													}
												>
													{file}
												</Badge>
											))}
										</div>
										<div className="flex flex-wrap items-center gap-basalt-space-lg">
											<Select value={model} onValueChange={setModel}>
												<SelectTrigger aria-label="Model">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="balanced">Balanced</SelectItem>
													<SelectItem value="fast">Fast</SelectItem>
												</SelectContent>
											</Select>
											<div className="flex-1" style={{ minWidth: "8rem" }}>
												<Meter label="Context" value={32} size="sm" />
											</div>
											<Button onClick={() => send(draft)}>
												<Send /> Send
											</Button>
										</div>
									</LayerCard.Body>
								</LayerCard>
							</div>
							<aside id="agent-inspector" className="min-w-0 space-y-basalt-layout">
								<LayerCard padding="none">
									<LayerCard.Header>Workspace files</LayerCard.Header>
									<LayerCard.Body className="space-y-basalt-space-sm">
										{ARTIFACTS.map((file) => (
											<Button
												key={file.name}
												variant="ghost"
												className="w-full justify-start"
												aria-pressed={file.name === artifact.name}
												onClick={() => setArtifact(file)}
											>
												<FileCode />
												{file.name}
											</Button>
										))}
									</LayerCard.Body>
									<CodeHighlighted
										attached
										title={artifact.name}
										code={artifact.code}
										lineNumbers
									/>
								</LayerCard>
								<LayerCard padding="none">
									<LayerCard.Header>Background tasks</LayerCard.Header>
									<LayerCard.Body className="space-y-basalt-card-sm">
										<div className="flex items-center justify-between gap-basalt-space-lg">
											<span>
												{running ? (
													<Loader size={14} showElapsed={false} label="Indexing files" />
												) : (
													"Indexing stopped"
												)}
											</span>
											<Button variant="outline" size="sm" onClick={() => setRunning(!running)}>
												{running ? "Stop" : "Resume"}
											</Button>
										</div>
										<p className="text-basalt-sm text-basalt-muted-foreground">
											Repository index · updated locally
										</p>
									</LayerCard.Body>
								</LayerCard>
							</aside>
						</div>
					</ContentIsland>
				</AppMain>
			</AppShell>
		</SidebarProvider>
	);
}
