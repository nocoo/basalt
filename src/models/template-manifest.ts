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
	titleKey: string;
	descriptionKey: string;
}

export const TEMPLATE_MANIFEST: readonly TemplateMetadata[] = [
	{
		slug: "agent-workspace",
		category: "agents",
		featured: true,
		heightRem: 48,
		fileName: "AgentWorkspaceTemplate.tsx",
		titleKey: "pages.templates.agentWorkspace.title",
		descriptionKey: "pages.templates.agentWorkspace.description",
	},
	{
		slug: "ops-inbox",
		category: "agents",
		featured: true,
		heightRem: 44,
		fileName: "OpsInboxTemplate.tsx",
		titleKey: "pages.templates.opsInbox.title",
		descriptionKey: "pages.templates.opsInbox.description",
	},
	{
		slug: "executive-dashboard",
		category: "dashboards",
		featured: true,
		heightRem: 48,
		fileName: "ExecutiveDashboardTemplate.tsx",
		titleKey: "pages.templates.executiveDashboard.title",
		descriptionKey: "pages.templates.executiveDashboard.description",
	},
	{
		slug: "workspace-settings",
		category: "workspaces",
		featured: false,
		heightRem: 44,
		fileName: "WorkspaceSettingsTemplate.tsx",
		titleKey: "pages.templates.workspaceSettings.title",
		descriptionKey: "pages.templates.workspaceSettings.description",
	},
	{
		slug: "visitor-login",
		category: "auth",
		featured: true,
		heightRem: 42,
		fileName: "VisitorLoginTemplate.tsx",
		titleKey: "pages.templates.visitorLogin.title",
		descriptionKey: "pages.templates.visitorLogin.description",
	},
];

export function isKnownTemplateSlug(slug: string): slug is TemplateSlug {
	return (TEMPLATE_SLUGS as readonly string[]).includes(slug);
}
