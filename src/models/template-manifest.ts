export const TEMPLATE_SLUGS = [
	"agent-workspace",
	"ops-inbox",
	"workspace-settings",
	"executive-dashboard",
	"visitor-login",
	"document-page",
	"not-found",
] as const;

export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];
export type TemplateCategory = "workspaces" | "dashboards" | "standalone";
export type TemplateFilter = "featured" | "all" | TemplateCategory;
export type TemplateViewport = "desktop" | "tablet" | "mobile";

export interface TemplatePart {
	id: string;
	label: string;
	summary: string;
	components: readonly string[];
}

export interface TemplateCustomizeStep {
	title: string;
	detail: string;
	anchor?: string;
	symbol?: string;
}

export interface TemplateMetadata {
	slug: TemplateSlug;
	category: TemplateCategory;
	featured: boolean;
	heightRem: number;
	fileName: string;
	title: string;
	description: string;
	parts: readonly TemplatePart[];
	customizeSteps: readonly TemplateCustomizeStep[];
}

export const TEMPLATE_MANIFEST: readonly TemplateMetadata[] = [
	{
		slug: "agent-workspace",
		category: "workspaces",
		featured: true,
		heightRem: 48,
		fileName: "AgentWorkspaceTemplate.tsx",
		title: "Agent workspace",
		description: "A collaborative agent session with a trace, composer and file inspector.",
		parts: [
			{
				id: "agent-sidebar",
				label: "Session sidebar",
				summary:
					"Collapsible session switcher with search, new session trigger, and mobile drawer.",
				components: ["sidebar", "input", "button", "tooltip"],
			},
			{
				id: "agent-trace",
				label: "Execution trace",
				summary: "Collapsible step stream pairing Loader states, status badges, and attached logs.",
				components: ["layer-card", "collapsible", "loader", "badge", "code-block"],
			},
			{
				id: "agent-approval",
				label: "Approval gate",
				summary:
					"Human-in-the-loop review card for staged changes and deterministic follow-up prompts.",
				components: ["layer-card", "badge", "button"],
			},
			{
				id: "agent-composer",
				label: "Prompt composer",
				summary:
					"Multi-line prompt box with attached file pills, model selector, and context meter.",
				components: ["layer-card", "textarea", "badge", "select", "meter", "button"],
			},
			{
				id: "agent-inspector",
				label: "File inspector & tasks",
				summary:
					"Artifact selector synced with highlighted code preview and background worker toggle.",
				components: ["layer-card", "button", "code-block", "loader"],
			},
		],
		customizeSteps: [
			{
				title: "Configure workspace defaults",
				detail:
					"Edit AGENT_CONFIG to rename the assistant workspace brand, default model, and badge text.",
				anchor: "agent-sidebar",
				symbol: "AGENT_CONFIG",
			},
			{
				title: "Seed sessions and artifacts",
				detail:
					"Replace INITIAL_SESSIONS and ARTIFACTS with your API session history and workspace files.",
				anchor: "agent-inspector",
				symbol: "ARTIFACTS",
			},
			{
				title: "Wire execution and approval actions",
				detail:
					"Connect send() and approval handlers inside #agent-approval to your streaming agent backend.",
				anchor: "agent-approval",
				symbol: "INITIAL_SESSIONS",
			},
		],
	},
	{
		slug: "ops-inbox",
		category: "workspaces",
		featured: true,
		heightRem: 44,
		fileName: "OpsInboxTemplate.tsx",
		title: "Ops inbox",
		description: "Triage incidents, follow a runbook and update their status.",
		parts: [
			{
				id: "ops-sidebar",
				label: "Operations rail",
				summary: "Responsive navigation rail linking inbox queue and active runbook checklists.",
				components: ["sidebar", "button"],
			},
			{
				id: "ops-queue",
				label: "Incident queue",
				summary: "Searchable and tab-filtered incident list on a split-pane LayerCard surface.",
				components: ["layer-card", "input", "tabs", "sidebar"],
			},
			{
				id: "ops-detail",
				label: "Incident telemetry",
				summary: "Selected incident summary with severity status badge and SLA Meter progress.",
				components: ["layer-card", "badge", "meter", "empty"],
			},
			{
				id: "ops-runbook",
				label: "Runbook & triage actions",
				summary:
					"Interactive verification checklist paired with Resolve and Escalate state transitions.",
				components: ["checkbox", "button"],
			},
		],
		customizeSteps: [
			{
				title: "Adjust service branding",
				detail: "Update OPS_CONFIG to set the operations desk name, header title, and intro copy.",
				anchor: "ops-sidebar",
				symbol: "OPS_CONFIG",
			},
			{
				title: "Load live incidents",
				detail:
					"Replace INITIAL_INCIDENTS with your alerting API query and SLA percentage calculation.",
				anchor: "ops-queue",
				symbol: "INITIAL_INCIDENTS",
			},
			{
				title: "Customize runbook checklist",
				detail: "Edit RUNBOOK_STEPS and connect update() to persist incident status transitions.",
				anchor: "ops-runbook",
				symbol: "RUNBOOK_STEPS",
			},
		],
	},
	{
		slug: "workspace-settings",
		category: "workspaces",
		featured: false,
		heightRem: 44,
		fileName: "WorkspaceSettingsTemplate.tsx",
		title: "Workspace settings",
		description: "Manage team preferences, active sessions, access keys and quotas.",
		parts: [
			{
				id: "settings-sidebar",
				label: "Workspace rail",
				summary:
					"Synchronized left navigation switching settings sections across desktop and mobile drawers.",
				components: ["sidebar", "button"],
			},
			{
				id: "settings-header",
				label: "Settings header",
				summary: "PageHeader framing workspace context above tabbed administrative panels.",
				components: ["page-header"],
			},
			{
				id: "settings-tabs",
				label: "Section tabs",
				summary:
					"Primary underline Tabs synchronizing General, Members, Security, API Keys, and Quotas.",
				components: ["tabs"],
			},
			{
				id: "settings-panel",
				label: "Configuration panels",
				summary:
					"Structured LayerCard forms, session revocation, key lifecycle controls, and usage Meters.",
				components: ["layer-card", "input", "label", "switch", "badge", "meter", "button"],
			},
		],
		customizeSteps: [
			{
				title: "Update workspace metadata",
				detail:
					"Edit WORKSPACE_SETTINGS_CONFIG for brand name, headings, and initial contact fields.",
				anchor: "settings-header",
				symbol: "WORKSPACE_SETTINGS_CONFIG",
			},
			{
				title: "Bind sessions and API keys",
				detail:
					"Replace INITIAL_SESSIONS and INITIAL_KEYS with authenticated session and token endpoints.",
				anchor: "settings-panel",
				symbol: "INITIAL_SESSIONS",
			},
			{
				title: "Persist key mutations",
				detail: "Connect Create key and Revoke handlers to issue or invalidate workspace tokens.",
				anchor: "settings-tabs",
				symbol: "INITIAL_KEYS",
			},
		],
	},
	{
		slug: "executive-dashboard",
		category: "dashboards",
		featured: true,
		heightRem: 48,
		fileName: "ExecutiveDashboardTemplate.tsx",
		title: "Executive dashboard",
		description: "A concise performance overview with capacity and account data.",
		parts: [
			{
				id: "exec-sidebar",
				label: "Navigation rail",
				summary:
					"Workspace shell rail with anchor jump to the account ledger on mobile and desktop.",
				components: ["sidebar", "button"],
			},
			{
				id: "exec-kpis",
				label: "KPI stat grid",
				summary:
					"Four-column StatGrid displaying revenue, active accounts, retention, and open orders.",
				components: ["page-header", "stat-card"],
			},
			{
				id: "exec-capacity",
				label: "Capacity & channel meters",
				summary:
					"Side-by-side LayerCards summarizing utilization and acquisition mix with Meter bars.",
				components: ["layer-card", "meter"],
			},
			{
				id: "account-list",
				label: "Filterable account table",
				summary:
					"Attached DataTable with live search input, column sorting, and semantic status badges.",
				components: ["layer-card", "input", "data-table", "badge"],
			},
		],
		customizeSteps: [
			{
				title: "Set organization title and metrics",
				detail:
					"Edit EXECUTIVE_CONFIG to configure brand title, page description, and overview metadata.",
				anchor: "exec-kpis",
				symbol: "EXECUTIVE_CONFIG",
			},
			{
				title: "Supply account dataset",
				detail: "Replace ACCOUNTS with live CRM or billing data matching your domain model.",
				anchor: "account-list",
				symbol: "ACCOUNTS",
			},
			{
				title: "Extend table columns",
				detail: "Customize COLUMNS with additional sortable metrics, owners, or health indicators.",
				anchor: "account-list",
				symbol: "COLUMNS",
			},
		],
	},
	{
		slug: "visitor-login",
		category: "standalone",
		featured: true,
		heightRem: 42,
		fileName: "VisitorLoginTemplate.tsx",
		title: "Visitor login",
		description: "A compact sign-in badge with optional verification.",
		parts: [
			{
				id: "login-brand",
				label: "Identity header",
				summary:
					"High-contrast primary brand strip introducing the workspace authentication badge.",
				components: ["layer-card"],
			},
			{
				id: "login-form",
				label: "Credentials & 2FA form",
				summary: "Accessible email, password, and conditional one-time verification code inputs.",
				components: ["label", "input", "switch", "button"],
			},
			{
				id: "login-footer",
				label: "Security notice footer",
				summary: "Quiet footer slot clarifying session boundary and compliance messaging.",
				components: ["layer-card"],
			},
		],
		customizeSteps: [
			{
				title: "Brand the badge header",
				detail:
					"Update VISITOR_LOGIN_CONFIG to swap workspace name, headings, and security notice text.",
				anchor: "login-brand",
				symbol: "VISITOR_LOGIN_CONFIG",
			},
			{
				title: "Connect authentication handler",
				detail:
					"Replace the local demo submit handler in #login-form with your auth provider action.",
				anchor: "login-form",
				symbol: "VISITOR_LOGIN_CONFIG",
			},
			{
				title: "Mount standalone outside AppShell",
				detail:
					"Render VisitorLoginTemplate as a full-viewport route without Sidebar or ContentIsland.",
				anchor: "login-footer",
				symbol: "VISITOR_LOGIN_CONFIG",
			},
		],
	},
	{
		slug: "document-page",
		category: "standalone",
		featured: false,
		heightRem: 44,
		fileName: "DocumentPageTemplate.tsx",
		title: "Document page",
		description: "A standalone terms and policy reading page on a bounded card surface.",
		parts: [
			{
				id: "doc-header",
				label: "Document header",
				summary: "Divided LayerCard.Header with category badge, display title, and effective date.",
				components: ["layer-card", "badge", "link-button"],
			},
			{
				id: "doc-sections",
				label: "Structured sections",
				summary: "Readable policy clauses with balanced vertical rhythm and bulleted enumerations.",
				components: ["layer-card"],
			},
			{
				id: "doc-footer",
				label: "Acknowledgement footer",
				summary: "LayerCard.Footer summarizing compliance contact and acceptance guidance.",
				components: ["layer-card"],
			},
		],
		customizeSteps: [
			{
				title: "Set document metadata",
				detail:
					"Edit DOCUMENT_CONFIG to customize title, effective date, category badge, and back route.",
				anchor: "doc-header",
				symbol: "DOCUMENT_CONFIG",
			},
			{
				title: "Author policy sections",
				detail:
					"Populate DOCUMENT_SECTIONS with your terms, privacy clauses, or changelog entries.",
				anchor: "doc-sections",
				symbol: "DOCUMENT_SECTIONS",
			},
			{
				title: "Tailor footer guidance",
				detail: "Adjust DOCUMENT_CONFIG.footerNote for legal contact links or support channels.",
				anchor: "doc-footer",
				symbol: "DOCUMENT_CONFIG",
			},
		],
	},
	{
		slug: "not-found",
		category: "standalone",
		featured: false,
		heightRem: 36,
		fileName: "NotFoundTemplate.tsx",
		title: "Error 404",
		description: "A full-viewport missing route page with a clear recovery action.",
		parts: [
			{
				id: "not-found-card",
				label: "Centered recovery card",
				summary:
					"Compact matte LayerCard presenting the 404 code badge, explanation, and home link.",
				components: ["layer-card", "badge", "link-button"],
			},
		],
		customizeSteps: [
			{
				title: "Customize error messaging",
				detail: "Edit NOT_FOUND_CONFIG to change status badge text, headline, and recovery copy.",
				anchor: "not-found-card",
				symbol: "NOT_FOUND_CONFIG",
			},
			{
				title: "Point recovery link to app root",
				detail:
					"Set NOT_FOUND_CONFIG.actionHref to your application home or active dashboard route.",
				anchor: "not-found-card",
				symbol: "NOT_FOUND_CONFIG",
			},
			{
				title: "Preserve noindex metadata on 404",
				detail: "Pair this route with HTTP 404 status and noindex headers at your edge or router.",
				anchor: "not-found-card",
				symbol: "NOT_FOUND_CONFIG",
			},
		],
	},
];

export function isKnownTemplateSlug(slug: string): slug is TemplateSlug {
	return (TEMPLATE_SLUGS as readonly string[]).includes(slug);
}
