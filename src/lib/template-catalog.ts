import {
	TEMPLATE_MANIFEST,
	type TemplateFilter,
	type TemplateMetadata,
	type TemplateSlug,
} from "@/models/template-manifest";
import { normalizeConsumerTemplateSource } from "@/models/templates";
import agentWorkspace from "@/templates/AgentWorkspaceTemplate.tsx?raw";
import documentPage from "@/templates/DocumentPageTemplate.tsx?raw";
import executiveDashboard from "@/templates/ExecutiveDashboardTemplate.tsx?raw";
import notFound from "@/templates/NotFoundTemplate.tsx?raw";
import opsInbox from "@/templates/OpsInboxTemplate.tsx?raw";
import visitorLogin from "@/templates/VisitorLoginTemplate.tsx?raw";
import workspaceSettings from "@/templates/WorkspaceSettingsTemplate.tsx?raw";

export interface TemplateEntry extends TemplateMetadata {
	consumerSource: string;
}

const SOURCES: Record<TemplateSlug, string> = {
	"agent-workspace": agentWorkspace,
	"ops-inbox": opsInbox,
	"executive-dashboard": executiveDashboard,
	"workspace-settings": workspaceSettings,
	"visitor-login": visitorLogin,
	"document-page": documentPage,
	"not-found": notFound,
};

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
