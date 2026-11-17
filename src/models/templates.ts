import agentWorkspace from "@/templates/AgentWorkspaceTemplate.tsx?raw";
import executiveDashboard from "@/templates/ExecutiveDashboardTemplate.tsx?raw";
import opsInbox from "@/templates/OpsInboxTemplate.tsx?raw";
import visitorLogin from "@/templates/VisitorLoginTemplate.tsx?raw";
import workspaceSettings from "@/templates/WorkspaceSettingsTemplate.tsx?raw";
import {
	TEMPLATE_MANIFEST,
	type TemplateFilter,
	type TemplateMetadata,
	type TemplateSlug,
	type TemplateViewport,
} from "./template-manifest";

export interface TemplateEntry extends TemplateMetadata {
	consumerSource: string;
}

const SOURCES: Record<TemplateSlug, string> = {
	"agent-workspace": agentWorkspace,
	"ops-inbox": opsInbox,
	"executive-dashboard": executiveDashboard,
	"workspace-settings": workspaceSettings,
	"visitor-login": visitorLogin,
};

export function normalizeConsumerTemplateSource(raw: string): string {
	return raw
		.replace(/^\uFEFF?[ \t]*\/\*[\s\S]*?\*\/[ \t]*(?:\r?\n|$)/, "")
		.replace(/^[ \t]*\/\/[ \t]*(?:@ts-\S+|preview helper).*?(?:\r?\n|$)/gim, "")
		.trim();
}

export const TEMPLATES: readonly TemplateEntry[] = TEMPLATE_MANIFEST.map((entry) => ({
	...entry,
	consumerSource: normalizeConsumerTemplateSource(SOURCES[entry.slug]),
}));

export function getTemplateBySlug(slug: string): TemplateEntry | undefined {
	return TEMPLATES.find((entry) => entry.slug === slug);
}

export function filterTemplates(filter: TemplateFilter): readonly TemplateEntry[] {
	return TEMPLATES.filter((entry) =>
		filter === "all" ? true : filter === "featured" ? entry.featured : entry.category === filter,
	);
}

export function viewportContainerClass(viewport: TemplateViewport): string {
	return {
		desktop: "w-full",
		tablet: "mx-auto w-full max-w-[48rem]",
		mobile: "mx-auto w-full max-w-[24.375rem]",
	}[viewport];
}
