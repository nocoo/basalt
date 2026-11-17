export const AVAILABLE_ATTACHMENTS = [
	"tokens.diff",
	"sidebar-audit.json",
	"contrast-report.csv",
] as const;
export const INITIAL_ATTACHMENTS: readonly string[] = ["tokens.diff", "sidebar-audit.json"];

export function toggleAttachment(attached: readonly string[], filename: string): string[] {
	return attached.includes(filename)
		? removeAttachment(attached, filename)
		: [...attached, filename];
}

export function removeAttachment(attached: readonly string[], filename: string): string[] {
	return attached.filter((item) => item !== filename);
}

export function filterAttachments(query: string): readonly string[] {
	const normalized = query.trim().toLowerCase();
	return AVAILABLE_ATTACHMENTS.filter((filename) => filename.toLowerCase().includes(normalized));
}

export const WORKSPACE_ITEMS = [
	{ id: "overview", label: "Overview" },
	{ id: "inbox", label: "Inbox", count: 12 },
	{ id: "schedules", label: "Schedules" },
	{ id: "members", label: "Members" },
	{ id: "billing", label: "Billing" },
] as const;

export type WorkspaceItem = (typeof WORKSPACE_ITEMS)[number]["id"];

export function selectWorkspaceItem(current: WorkspaceItem, next: string): WorkspaceItem {
	return WORKSPACE_ITEMS.find((item) => item.id === next)?.id ?? current;
}

export const TRACE_STEPS = [
	{
		id: "indexed",
		label: "Indexed 148 tokens",
		status: "complete",
		detail: "Indexed the current workspace files.",
	},
	{
		id: "contrast",
		label: "Auditing contrast pairs",
		status: "complete",
		detail: "Verified the foreground and surface pairs.",
	},
	{
		id: "rail",
		label: "Verifying sidebar rail",
		status: "running",
		detail: "Checking the collapsed rail geometry.",
	},
] as const;

export const TOKEN_BUDGET = { value: 68, reading: "1,360 / 2,000 tok" } as const;

export const DECISIONS = [
	{ id: "canary", label: "Canary 10%" },
	{ id: "staged", label: "Staged workspace" },
	{ id: "draft", label: "Draft changelog only" },
] as const;

export type Decision = (typeof DECISIONS)[number]["id"];

export function selectDecision(current: Decision | null, next: string): Decision | null {
	return DECISIONS.find((item) => item.id === next)?.id ?? current;
}

export const METRICS = [
	{ id: "deploys", label: "Weekly deploys", value: "42", change: "+12%" },
	{ id: "failure", label: "Failure rate", value: "0.4%", change: "-0.2%" },
] as const;

export const ALLOCATIONS = [
	{ id: "compute", label: "Compute", value: 68 },
	{ id: "storage", label: "Storage", value: 42 },
	{ id: "bandwidth", label: "Bandwidth", value: 24 },
] as const;

export const LEDGER = [
	{ id: "INV-2041", amount: 1240, status: "paid" },
	{ id: "INV-2042", amount: 480, status: "pending" },
	{ id: "INV-2043", amount: 1825, status: "failed" },
	{ id: "INV-2044", amount: 96, status: "paid" },
] as const;

export type LedgerStatus = (typeof LEDGER)[number]["status"];
export type LedgerFilter = "all" | LedgerStatus;

export function filterLedger(filter: LedgerFilter) {
	return LEDGER.filter((row) => filter === "all" || row.status === filter);
}
