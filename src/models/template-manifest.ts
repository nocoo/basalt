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
		category: "workspaces",
		featured: true,
		heightRem: 48,
		fileName: "AgentWorkspaceTemplate.tsx",
		title: "Agent workspace",
		description: "A collaborative agent session with a trace, composer and file inspector.",
	},
	{
		slug: "ops-inbox",
		category: "workspaces",
		featured: true,
		heightRem: 44,
		fileName: "OpsInboxTemplate.tsx",
		title: "Ops inbox",
		description: "Triage incidents, follow a runbook and update their status.",
	},
	{
		slug: "workspace-settings",
		category: "workspaces",
		featured: false,
		heightRem: 44,
		fileName: "WorkspaceSettingsTemplate.tsx",
		title: "Workspace settings",
		description: "Manage team preferences, active sessions, access keys and quotas.",
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
		slug: "visitor-login",
		category: "standalone",
		featured: true,
		heightRem: 42,
		fileName: "VisitorLoginTemplate.tsx",
		title: "Visitor login",
		description: "A compact sign-in badge with optional verification.",
	},
	{
		slug: "document-page",
		category: "standalone",
		featured: false,
		heightRem: 44,
		fileName: "DocumentPageTemplate.tsx",
		title: "Document page",
		description: "A standalone terms and policy reading page on a bounded card surface.",
	},
	{
		slug: "not-found",
		category: "standalone",
		featured: false,
		heightRem: 36,
		fileName: "NotFoundTemplate.tsx",
		title: "Error 404",
		description: "A full-viewport missing route page with a clear recovery action.",
	},
];

export function isKnownTemplateSlug(slug: string): slug is TemplateSlug {
	return (TEMPLATE_SLUGS as readonly string[]).includes(slug);
}
