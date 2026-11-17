import { ThemeProvider, useTheme } from "@nocoo/basalt/providers/theme";
import { lazy, Suspense, useEffect } from "react";
import { useParams, useSearchParams } from "react-router";
import { isKnownTemplateSlug, type TemplateSlug } from "@/models/template-manifest";
import NotFound from "./NotFound";

const COMPONENTS: Record<TemplateSlug, ReturnType<typeof lazy>> = {
	"agent-workspace": lazy(() => import("@/templates/AgentWorkspaceTemplate")),
	"ops-inbox": lazy(() => import("@/templates/OpsInboxTemplate")),
	"executive-dashboard": lazy(() => import("@/templates/ExecutiveDashboardTemplate")),
	"workspace-settings": lazy(() => import("@/templates/WorkspaceSettingsTemplate")),
	"visitor-login": lazy(() => import("@/templates/VisitorLoginTemplate")),
};

function Viewport({ slug }: { slug: TemplateSlug }) {
	const { setTheme } = useTheme();
	const [params] = useSearchParams();
	const requestedTheme = params.get("theme");
	useEffect(() => {
		if (requestedTheme === "light" || requestedTheme === "dark") setTheme(requestedTheme);
	}, [requestedTheme, setTheme]);
	useEffect(() => {
		function onMessage(event: MessageEvent) {
			if (event.origin !== window.location.origin || event.data?.type !== "basalt-template-theme")
				return;
			if (event.data.theme === "light" || event.data.theme === "dark") setTheme(event.data.theme);
		}
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, [setTheme]);
	const Template = COMPONENTS[slug];
	return (
		<Suspense fallback={<div role="status">Loading template…</div>}>
			<Template />
		</Suspense>
	);
}

export default function TemplateViewportPage() {
	const { slug = "" } = useParams();
	const [params] = useSearchParams();
	const { theme } = useTheme();
	const requestedTheme = params.get("theme");
	return (
		<ThemeProvider
			persist={false}
			defaultTheme={
				requestedTheme === "light" || requestedTheme === "dark" ? requestedTheme : theme
			}
		>
			{isKnownTemplateSlug(slug) ? <Viewport slug={slug} /> : <NotFound />}
		</ThemeProvider>
	);
}
