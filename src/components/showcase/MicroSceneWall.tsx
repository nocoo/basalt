import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import { Input } from "@nocoo/basalt/components/input";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Loader } from "@nocoo/basalt/components/loader";
import { Meter } from "@nocoo/basalt/components/meter";
import { Separator } from "@nocoo/basalt/components/separator";
import { SidebarItem, SidebarNav } from "@nocoo/basalt/components/sidebar";
import { Switch } from "@nocoo/basalt/components/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { CalendarDays, CreditCard, Inbox, LayoutDashboard, Users } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import {
	ALLOCATIONS,
	DECISIONS,
	type Decision,
	filterAttachments,
	filterLedger,
	INITIAL_ATTACHMENTS,
	type LedgerFilter,
	METRICS,
	removeAttachment,
	selectDecision,
	selectWorkspaceItem,
	TOKEN_BUDGET,
	TRACE_STEPS,
	toggleAttachment,
	WORKSPACE_ITEMS,
	type WorkspaceItem,
} from "@/models/micro-scenes";

const WORKSPACE_ICONS = {
	overview: LayoutDashboard,
	inbox: Inbox,
	schedules: CalendarDays,
	members: Users,
	billing: CreditCard,
};
const WORKSPACE_LABELS: Record<WorkspaceItem, string> = {
	overview: "Overview",
	inbox: "Inbox",
	schedules: "Schedules",
	members: "Members",
	billing: "Billing",
};
const STEP_COPY: Record<(typeof TRACE_STEPS)[number]["id"], { label: string; detail: string }> = {
	indexed: {
		label: "Indexed 148 tokens",
		detail: "Indexed the current workspace files.",
	},
	contrast: {
		label: "Auditing contrast pairs",
		detail: "Verified the foreground and surface pairs.",
	},
	rail: {
		label: "Verifying sidebar rail",
		detail: "Checking the collapsed rail geometry.",
	},
};
const DECISION_LABELS: Record<Decision, string> = {
	canary: "Canary 10%",
	staged: "Staged workspace",
	draft: "Draft changelog only",
};
const METRIC_LABELS: Record<(typeof METRICS)[number]["id"], string> = {
	deploys: "Weekly deploys",
	failure: "Failure rate",
};
const ALLOCATION_LABELS: Record<(typeof ALLOCATIONS)[number]["id"], string> = {
	compute: "Compute",
	storage: "Storage",
	bandwidth: "Bandwidth",
};
const LEDGER_FILTERS: readonly LedgerFilter[] = ["all", "paid", "pending", "failed"];
const STATUS_LABELS: Record<LedgerFilter, string> = {
	all: "All",
	paid: "Paid",
	pending: "Pending",
	failed: "Failed",
};
const MONEY = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function MicroSceneWall({ className }: { className?: string }) {
	const id = useId();
	const [attachments, setAttachments] = useState<readonly string[]>(INITIAL_ATTACHMENTS);
	const [query, setQuery] = useState("");
	const [notifications, setNotifications] = useState(true);
	const [includeDiff, setIncludeDiff] = useState(false);
	const [active, setActive] = useState<WorkspaceItem>("overview");
	const [decision, setDecision] = useState<Decision | null>(null);
	const [showChanges, setShowChanges] = useState(true);
	const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>("all");
	const availableAttachments = filterAttachments(query);

	return (
		<div
			className={cn("grid grid-cols-1 gap-basalt-layout md:grid-cols-2 xl:grid-cols-3", className)}
			data-micro-scene-wall=""
		>
			<LayerCard padding="none">
				<LayerCard.Header>Controls &amp; attachments</LayerCard.Header>
				<LayerCard.Body className="space-y-basalt-card-sm">
					<Input
						size="sm"
						aria-label="Search attachments"
						placeholder="Search attachments"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
					/>
					<div
						role="group"
						aria-label="Available attachments"
						className="flex flex-wrap gap-basalt-space-sm"
					>
						{availableAttachments.map((filename) => (
							<Button
								key={filename}
								size="sm"
								variant="outline"
								aria-pressed={attachments.includes(filename)}
								className="aria-pressed:bg-basalt-selected aria-pressed:text-basalt-selected-foreground"
								onClick={() => setAttachments((current) => toggleAttachment(current, filename))}
							>
								{filename}
							</Button>
						))}
						{availableAttachments.length === 0 && (
							<p className="text-basalt-sm text-basalt-muted-foreground">No matching files.</p>
						)}
					</div>
					<div
						role="group"
						className="flex flex-wrap gap-basalt-space-sm"
						aria-label="Attached files"
					>
						{attachments.map((filename) => (
							<Badge
								key={filename}
								variant="outline"
								dismissLabel={`Remove ${filename}`}
								onDismiss={() => setAttachments((current) => removeAttachment(current, filename))}
							>
								{filename}
							</Badge>
						))}
					</div>
					<Separator />
					<div className="flex flex-wrap items-center justify-between gap-basalt-space-lg">
						<Label htmlFor={`${id}-notifications`}>Notify on completion</Label>
						<Switch
							id={`${id}-notifications`}
							size="sm"
							checked={notifications}
							onCheckedChange={setNotifications}
						/>
					</div>
					<div className="flex items-center gap-basalt-space-lg">
						<Checkbox
							id={`${id}-diff`}
							size="sm"
							checked={includeDiff}
							onCheckedChange={(checked) => setIncludeDiff(checked === true)}
						/>
						<Label htmlFor={`${id}-diff`}>Include diff summary</Label>
					</div>
				</LayerCard.Body>
			</LayerCard>

			<LayerCard padding="none">
				<LayerCard.Header>Workspace navigation</LayerCard.Header>
				<SidebarNav aria-label="Workspace navigation" className="pt-0 pb-basalt-card">
					{WORKSPACE_ITEMS.map((item) => {
						const Icon = WORKSPACE_ICONS[item.id];
						const label = WORKSPACE_LABELS[item.id];
						return (
							<SidebarItem
								key={item.id}
								aria-label={`${label}${"count" in item ? ` ${item.count}` : ""}`}
								active={active === item.id}
								onClick={() => setActive((current) => selectWorkspaceItem(current, item.id))}
							>
								<Icon />
								<span className="flex-1">{label}</span>
								{"count" in item && <Badge variant="outline">{item.count}</Badge>}
							</SidebarItem>
						);
					})}
				</SidebarNav>
			</LayerCard>

			<LayerCard padding="none">
				<LayerCard.Header>Agent execution trace</LayerCard.Header>
				<LayerCard.Body className="space-y-basalt-card-sm">
					{TRACE_STEPS.map((step) => (
						<Collapsible key={step.id}>
							<CollapsibleTrigger>
								<span className="flex flex-wrap items-center gap-basalt-space-lg text-basalt-md">
									{step.status === "running" ? (
										<Loader size={14} showLabel={false} showElapsed={false} label="Running" />
									) : (
										<Badge tone="success">Complete</Badge>
									)}
									{STEP_COPY[step.id].label}
								</span>
							</CollapsibleTrigger>
							<CollapsibleContent unstyled>
								<p className="py-basalt-space-lg text-basalt-sm text-basalt-muted-foreground">
									{STEP_COPY[step.id].detail}
								</p>
							</CollapsibleContent>
						</Collapsible>
					))}
					<Separator />
					<Meter
						label="Token budget"
						value={TOKEN_BUDGET.value}
						customValue={`${TOKEN_BUDGET.value}% · ${TOKEN_BUDGET.reading}`}
						size="sm"
					/>
				</LayerCard.Body>
			</LayerCard>

			<LayerCard padding="none">
				<LayerCard.Header>Choose roll-out policy</LayerCard.Header>
				<LayerCard.Body className="space-y-basalt-card-sm">
					<p className="text-basalt-md text-basalt-muted-foreground">
						Select the next action before continuing.
					</p>
					<div
						role="group"
						aria-label="Choose roll-out policy"
						className="flex flex-col gap-basalt-space-sm"
					>
						{DECISIONS.map((option) => (
							<Button
								key={option.id}
								size="sm"
								variant="outline"
								className="justify-start aria-pressed:bg-basalt-selected aria-pressed:text-basalt-selected-foreground"
								aria-pressed={decision === option.id}
								onClick={() => setDecision((current) => selectDecision(current, option.id))}
							>
								{DECISION_LABELS[option.id]}
							</Button>
						))}
					</div>
					<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
						{decision ? `Selected: ${DECISION_LABELS[decision]}` : "Waiting for a decision."}
					</p>
				</LayerCard.Body>
			</LayerCard>

			<LayerCard padding="none">
				<LayerCard.Header>Operations &amp; allocation</LayerCard.Header>
				<LayerCard.Body className="space-y-basalt-card-sm">
					<div className="grid grid-cols-2 gap-basalt-card-sm">
						{METRICS.map((metric) => (
							<div key={metric.id}>
								<p className="text-basalt-sm text-basalt-muted-foreground">
									{METRIC_LABELS[metric.id]}
								</p>
								<p className="text-basalt-xl font-semibold tabular-nums">{metric.value}</p>
								{showChanges && (
									<p className="text-basalt-sm tabular-nums text-basalt-muted-foreground">
										{metric.change}
									</p>
								)}
							</div>
						))}
					</div>
					<Button
						size="sm"
						variant="ghost"
						aria-pressed={showChanges}
						onClick={() => setShowChanges((current) => !current)}
					>
						{showChanges ? "Hide changes" : "Show changes"}
					</Button>
					<Separator />
					<div className="space-y-basalt-card-sm">
						{ALLOCATIONS.map((item) => (
							<Meter
								key={item.id}
								label={ALLOCATION_LABELS[item.id]}
								value={item.value}
								size="sm"
								className={
									item.id === "compute"
										? undefined
										: "[&_[data-slot=meter-indicator]]:bg-basalt-muted-foreground"
								}
							/>
						))}
					</div>
				</LayerCard.Body>
			</LayerCard>

			<LayerCard padding="none">
				<LayerCard.Header>Compact ledger</LayerCard.Header>
				<LayerCard.Body className="space-y-basalt-card-sm">
					<div
						role="group"
						aria-label="Filter invoices"
						className="flex flex-wrap gap-basalt-space-sm"
					>
						{LEDGER_FILTERS.map((filter) => (
							<Button
								key={filter}
								variant="ghost"
								size="sm"
								aria-pressed={ledgerFilter === filter}
								className="aria-pressed:bg-basalt-selected aria-pressed:text-basalt-selected-foreground"
								onClick={() => setLedgerFilter(filter)}
							>
								{STATUS_LABELS[filter]}
							</Button>
						))}
					</div>
					<div className="overflow-x-auto">
						<Table density="compact" aria-label="Compact ledger">
							<TableHeader>
								<TableRow>
									<TableHead>Invoice</TableHead>
									<TableHead textAlign="end">Amount</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filterLedger(ledgerFilter).map((row) => (
									<TableRow key={row.id}>
										<TableCell className="font-basalt-mono">{row.id}</TableCell>
										<TableCell textAlign="end" className="font-basalt-mono">
											{MONEY.format(row.amount)}
										</TableCell>
										<TableCell>
											<Badge
												dot
												tone={
													row.status === "paid"
														? "success"
														: row.status === "failed"
															? "danger"
															: "warning"
												}
											>
												{STATUS_LABELS[row.status]}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</LayerCard.Body>
			</LayerCard>
		</div>
	);
}
