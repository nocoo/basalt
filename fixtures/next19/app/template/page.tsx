import AgentWorkspaceTemplate from "./AgentWorkspaceTemplate";
import ExecutiveDashboardTemplate from "./ExecutiveDashboardTemplate";
import OpsInboxTemplate from "./OpsInboxTemplate";
import VisitorLoginTemplate from "./VisitorLoginTemplate";
import WorkspaceSettingsTemplate from "./WorkspaceSettingsTemplate";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ example?: string }>;
}) {
	const { example } = await searchParams;
	const templates: Record<string, typeof VisitorLoginTemplate> = {
		agent: AgentWorkspaceTemplate,
		executive: ExecutiveDashboardTemplate,
		ops: OpsInboxTemplate,
		settings: WorkspaceSettingsTemplate,
	};
	const Template = templates[example ?? ""] ?? VisitorLoginTemplate;
	return <Template />;
}
