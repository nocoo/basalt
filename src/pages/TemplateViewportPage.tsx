import { ThemeProvider, useTheme } from "@nocoo/basalt/providers/theme";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router";
import { isKnownTemplateSlug, type TemplateSlug } from "@/models/template-manifest";
import {
	createTemplateActivePartMessage,
	parseTemplateParentMessage,
} from "@/models/template-protocol";
import { getTemplateByManifestSlug } from "@/models/templates";
import NotFound from "./NotFound";

const COMPONENTS: Record<TemplateSlug, ReturnType<typeof lazy>> = {
	"agent-workspace": lazy(() => import("@/templates/AgentWorkspaceTemplate")),
	"ops-inbox": lazy(() => import("@/templates/OpsInboxTemplate")),
	"executive-dashboard": lazy(() => import("@/templates/ExecutiveDashboardTemplate")),
	"workspace-settings": lazy(() => import("@/templates/WorkspaceSettingsTemplate")),
	"visitor-login": lazy(() => import("@/templates/VisitorLoginTemplate")),
	"document-page": lazy(() => import("@/templates/DocumentPageTemplate")),
	"not-found": lazy(() => import("@/templates/NotFoundTemplate")),
};

const FOCUS_HIGHLIGHT_MS = 1400;

function Viewport({ slug }: { slug: TemplateSlug }) {
	const { setTheme } = useTheme();
	const [params] = useSearchParams();
	const requestedTheme = params.get("theme");
	const highlightedRef = useRef<HTMLElement | null>(null);
	const focusTimerRef = useRef<number | null>(null);

	useEffect(() => {
		if (requestedTheme === "light" || requestedTheme === "dark") setTheme(requestedTheme);
	}, [requestedTheme, setTheme]);

	useEffect(() => {
		function clearHighlight() {
			if (focusTimerRef.current !== null) {
				window.clearTimeout(focusTimerRef.current);
				focusTimerRef.current = null;
			}
			if (highlightedRef.current) {
				delete highlightedRef.current.dataset.basaltTemplateFocus;
				highlightedRef.current = null;
			}
		}

		function onMessage(event: MessageEvent) {
			if (event.origin !== window.location.origin) return;
			const message = parseTemplateParentMessage(event.data);
			if (!message) return;
			if (message.type === "basalt-template-theme") {
				setTheme(message.theme);
				return;
			}
			const target = document.getElementById(message.partId);
			if (!target) return;
			clearHighlight();
			const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
			target.scrollIntoView?.({
				behavior: reducedMotion ? "auto" : "smooth",
				block: "nearest",
			});
			target.dataset.basaltTemplateFocus = "true";
			highlightedRef.current = target;
			focusTimerRef.current = window.setTimeout(clearHighlight, FOCUS_HIGHLIGHT_MS);
		}

		window.addEventListener("message", onMessage);
		return () => {
			window.removeEventListener("message", onMessage);
			clearHighlight();
		};
	}, [setTheme]);

	useEffect(() => {
		if (typeof IntersectionObserver === "undefined" || window.parent === window) return;
		const manifest = getTemplateByManifestSlug(slug);
		if (!manifest || manifest.parts.length === 0) return;

		const partIds = manifest.parts.map((part) => part.id);
		const ratios = new Map<string, number>();
		const observed = new Set<string>();
		let lastPosted: string | null = null;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = (entry.target as HTMLElement).id;
					if (!id) continue;
					ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
				}
				let bestId: string | null = null;
				let bestRatio = 0;
				for (const id of partIds) {
					const ratio = ratios.get(id) ?? 0;
					if (ratio > bestRatio) {
						bestRatio = ratio;
						bestId = id;
					}
				}
				if (bestId && bestId !== lastPosted) {
					lastPosted = bestId;
					window.parent.postMessage(
						createTemplateActivePartMessage(slug, bestId),
						window.location.origin,
					);
				}
			},
			{ threshold: [0.25, 0.5, 0.75] },
		);

		function attachParts() {
			for (const id of partIds) {
				if (observed.has(id)) continue;
				const element = document.getElementById(id);
				if (element) {
					observer.observe(element);
					observed.add(id);
				}
			}
			return observed.size === partIds.length;
		}

		const mutation = attachParts()
			? null
			: new MutationObserver(() => {
					if (attachParts()) {
						mutation?.disconnect();
					}
				});

		mutation?.observe(document.body, { childList: true, subtree: true });

		return () => {
			mutation?.disconnect();
			observer.disconnect();
		};
	}, [slug]);

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
