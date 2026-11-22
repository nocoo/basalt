export const TEMPLATE_SLUGS = [
	"agent-workspace",
	"ops-inbox",
	"executive-dashboard",
	"workspace-settings",
	"visitor-login",
] as const;

export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];
export type TemplateCategory = "agents" | "dashboards" | "workspaces" | "auth";
export type TemplateFilter = "featured" | "all" | TemplateCategory;
export type TemplateViewport = "desktop" | "tablet" | "mobile";

export interface TemplateMetadata {
	slug: TemplateSlug;
	category: TemplateCategory;
	featured: boolean;
	heightRem: number;
	fileName: string;
	title: string;
	description: string;
}

export const TEMPLATE_MANIFEST: readonly TemplateMetadata[] = [
	{
		slug: "agent-workspace",
		category: "agents",
		featured: true,
		heightRem: 48,
		fileName: "AgentWorkspaceTemplate.tsx",
		title: "Agent workspace",
		description: "A collaborative agent session with a trace, composer and file inspector.",
	},
	{
		slug: "ops-inbox",
		category: "agents",
		featured: true,
		heightRem: 44,
		fileName: "OpsInboxTemplate.tsx",
		title: "Ops inbox",
		description: "Triage incidents, follow a runbook and update their status.",
	},
	{
		slug: "executive-dashboard",
		category: "dashboards",
		featured: true,
		heightRem: 48,
		fileName: "ExecutiveDashboardTemplate.tsx",
		title: "Executive dashboard",
		description: "A concise performance overview with capacity and account data.",
	},
	{
		slug: "workspace-settings",
		category: "workspaces",
		featured: false,
		heightRem: 44,
		fileName: "WorkspaceSettingsTemplate.tsx",
		title: "Workspace settings",
		description: "Manage team preferences, access keys and quotas.",
	},
	{
		slug: "visitor-login",
		category: "auth",
		featured: true,
		heightRem: 42,
		fileName: "VisitorLoginTemplate.tsx",
		title: "Visitor login",
		description: "A compact sign-in badge with optional verification.",
	},
];

export function isKnownTemplateSlug(slug: string): slug is TemplateSlug {
	return (TEMPLATE_SLUGS as readonly string[]).includes(slug);
}
