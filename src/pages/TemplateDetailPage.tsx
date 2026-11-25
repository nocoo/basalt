import { Badge } from "@nocoo/basalt/components/badge";
import { Button, LinkButton } from "@nocoo/basalt/components/button";
import { CodeHighlighted } from "@nocoo/basalt/components/code";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { TagBadge } from "@nocoo/basalt/components/tag-badge";
import { useTheme } from "@nocoo/basalt/providers/theme";
import { ArrowLeft, ArrowRight, Copy, ExternalLink, FileText, RotateCw } from "lucide-react";
import { type RefObject, useEffect, useRef, useSyncExternalStore } from "react";
import { useParams } from "react-router";
import { ShowcasePage } from "@/components/ShowcasePage";
import { getTemplateBySlug, type TemplateEntry } from "@/lib/template-catalog";
import {
	isKnownTemplateSlug,
	type TemplateCategory,
	type TemplateSlug,
	type TemplateViewport,
} from "@/models/template-manifest";
import {
	createTemplateFocusMessage,
	createTemplateThemeMessage,
	parseTemplateChildMessage,
} from "@/models/template-protocol";
import { getTemplateNeighbors, viewportContainerClass } from "@/models/templates";
import { CATALOG_BY_SLUG, catalogNavName } from "@/pages/ui/catalog";
import {
	type PreviewThemeOverride,
	useTemplateWorkbenchViewModel,
	type WorkbenchMode,
} from "@/viewmodels/useTemplateWorkbenchViewModel";

const VIEWPORTS: readonly TemplateViewport[] = ["desktop", "tablet", "mobile"];
const THEME_OPTIONS: readonly PreviewThemeOverride[] = ["site", "light", "dark"];
const mediaQuery = "(prefers-color-scheme: dark)";

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
	workspaces: "Workspaces",
	dashboards: "Dashboards",
	standalone: "Standalone",
};

const VIEWPORT_LABELS: Record<TemplateViewport, string> = {
	desktop: "Desktop",
	tablet: "Tablet",
	mobile: "Mobile",
};

const THEME_LABELS: Record<PreviewThemeOverride, string> = {
	site: "Site",
	light: "Light",
	dark: "Dark",
};

const SETUP_SNIPPET = `import "@nocoo/basalt/styles";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { LinkProvider } from "@nocoo/basalt/providers/link";

export function Root({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<LinkProvider>{children}</LinkProvider>
		</ThemeProvider>
	);
}`;

function subscribeSystemTheme(notify: () => void) {
	const media = window.matchMedia(mediaQuery);
	media.addEventListener("change", notify);
	return () => media.removeEventListener("change", notify);
}

function systemTheme() {
	return window.matchMedia(mediaQuery).matches;
}

function TemplateFrame({
	entry,
	theme,
	viewport,
	frameRef,
	onLoad,
}: {
	entry: TemplateEntry;
	theme: "light" | "dark";
	viewport: TemplateViewport;
	frameRef: RefObject<HTMLIFrameElement | null>;
	onLoad: () => void;
}) {
	const initialTheme = useRef(theme);
	return (
		<div className="overflow-hidden bg-basalt-background p-basalt-layout">
			<div className={viewportContainerClass(viewport)}>
				<iframe
					ref={frameRef}
					title={entry.fileName}
					src={`/view/${entry.slug}?theme=${initialTheme.current}`}
					className="block w-full border-0"
					style={{ height: `${entry.heightRem}rem` }}
					loading="lazy"
					onLoad={onLoad}
				/>
			</div>
		</div>
	);
}

function TemplateWorkbench({
	entry,
	slug,
	resolvedSiteTheme,
}: {
	entry: TemplateEntry;
	slug: TemplateSlug;
	resolvedSiteTheme: "light" | "dark";
}) {
	const vm = useTemplateWorkbenchViewModel(slug, resolvedSiteTheme);
	const frameRef = useRef<HTMLIFrameElement>(null);
	const pendingFocusRef = useRef<string | null>(null);
	const neighbors = getTemplateNeighbors(slug);

	function postTheme() {
		frameRef.current?.contentWindow?.postMessage(
			createTemplateThemeMessage(vm.effectiveTheme),
			window.location.origin,
		);
	}

	function postFocus(partId: string) {
		frameRef.current?.contentWindow?.postMessage(
			createTemplateFocusMessage(partId),
			window.location.origin,
		);
	}

	useEffect(() => {
		frameRef.current?.contentWindow?.postMessage(
			createTemplateThemeMessage(vm.effectiveTheme),
			window.location.origin,
		);
	}, [vm.effectiveTheme]);

	useEffect(() => {
		function onMessage(event: MessageEvent) {
			if (event.origin !== window.location.origin) return;
			const parsed = parseTemplateChildMessage(event.data);
			if (parsed && parsed.slug === slug) {
				vm.setActivePartId(parsed.partId);
			}
		}
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, [slug, vm.setActivePartId]);

	function focusPart(partId: string) {
		const wasPreview = vm.mode === "preview";
		vm.selectPart(partId);
		if (wasPreview && frameRef.current?.contentWindow) {
			postFocus(partId);
			return;
		}
		pendingFocusRef.current = partId;
	}

	function handleFrameLoad() {
		postTheme();
		if (pendingFocusRef.current) {
			postFocus(pendingFocusRef.current);
			pendingFocusRef.current = null;
		}
	}

	return (
		<ShowcasePage
			title={entry.title}
			description={entry.description}
			actions={
				<div className="flex flex-wrap items-center gap-basalt-space-lg">
					<Badge variant="outline">{CATEGORY_LABELS[entry.category]}</Badge>
					<LinkButton
						variant="outline"
						size="sm"
						href={`/templates/${entry.slug}.md`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<FileText />
						View .md
					</LinkButton>
					<LinkButton
						variant="outline"
						size="sm"
						href={`/view/${entry.slug}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<ExternalLink />
						Open fullscreen
					</LinkButton>
				</div>
			}
		>
			<LayerCard padding="none">
				<LayerCard.Header divided className="flex-wrap">
					<div className="flex flex-wrap items-center gap-basalt-space-lg">
						<SegmentControl
							aria-label="Display mode"
							value={vm.mode}
							onValueChange={(value) => vm.setMode(value as WorkbenchMode)}
							options={[
								{ value: "preview", label: "Preview" },
								{ value: "code", label: "Code" },
							]}
						/>
						{vm.mode === "preview" && (
							<>
								<SegmentControl
									aria-label="Preview width"
									value={vm.viewport}
									onValueChange={(value) => vm.setViewport(value as TemplateViewport)}
									options={VIEWPORTS.map((value) => ({
										value,
										label: VIEWPORT_LABELS[value],
									}))}
								/>
								<SegmentControl
									aria-label="Preview theme"
									value={vm.themeOverride}
									onValueChange={(value) => vm.setThemeOverride(value as PreviewThemeOverride)}
									options={THEME_OPTIONS.map((value) => ({
										value,
										label: THEME_LABELS[value],
									}))}
								/>
							</>
						)}
					</div>
					<div className="flex flex-wrap items-center gap-basalt-space-lg">
						{vm.mode === "preview" && (
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label="Reload preview"
								onClick={vm.reload}
							>
								<RotateCw />
							</Button>
						)}
						<Button variant="outline" size="sm" onClick={() => void vm.copySource()}>
							<Copy />
							{vm.copied ? "Copied" : "Copy code"}
						</Button>
					</div>
				</LayerCard.Header>
				{vm.copyError && (
					<LayerCard.Body>
						<p role="alert" className="text-basalt-sm text-basalt-danger">
							Could not copy. Check clipboard permissions and try again.
						</p>
					</LayerCard.Body>
				)}
				{vm.mode === "preview" ? (
					<TemplateFrame
						key={`${entry.slug}-${vm.reloadKey}`}
						entry={entry}
						theme={vm.effectiveTheme}
						viewport={vm.viewport}
						frameRef={frameRef}
						onLoad={handleFrameLoad}
					/>
				) : (
					<CodeHighlighted
						attached
						title={entry.fileName}
						code={entry.consumerSource}
						lineNumbers
						copyable={false}
					/>
				)}
			</LayerCard>

			<SectionRule
				title="What's inside"
				hint="Select any region to locate it in the preview or inspect its underlying Basalt components."
			>
				<div className="grid grid-cols-1 gap-basalt-layout @[44rem]/island:grid-cols-2">
					{entry.parts.map((part) => {
						const active = vm.activePartId === part.id;
						return (
							<LayerCard key={part.id} padding="none" outlined={active}>
								<LayerCard.Header className="flex-wrap">
									<span>{part.label}</span>
									<Button
										type="button"
										size="sm"
										variant={active ? "secondary" : "outline"}
										aria-pressed={active}
										onClick={() => focusPart(part.id)}
									>
										{active ? "Focused" : "Locate"}
									</Button>
								</LayerCard.Header>
								<LayerCard.Body className="space-y-basalt-card-sm">
									<p className="text-basalt-sm text-basalt-muted-foreground">{part.summary}</p>
									<div className="flex flex-wrap items-center gap-basalt-space-md">
										{part.components.map((componentSlug) => {
											const catalogEntry = CATALOG_BY_SLUG.get(componentSlug);
											if (!catalogEntry) return null;
											return (
												<Link
													key={componentSlug}
													href={`/ui/${componentSlug}`}
													className="basalt-focus inline-flex items-center rounded-basalt-full no-underline"
												>
													<TagBadge name={catalogNavName(catalogEntry)} size="sm" />
												</Link>
											);
										})}
									</div>
								</LayerCard.Body>
							</LayerCard>
						);
					})}
				</div>
			</SectionRule>

			<SectionRule
				title="Make it yours"
				hint="Adapt top-level configuration symbols and wire your application services."
			>
				<div className="grid grid-cols-1 gap-basalt-layout @[52rem]/island:grid-cols-2">
					<LayerCard padding="none">
						<LayerCard.Header>Adaptation steps</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card">
							{entry.customizeSteps.map((step, index) => (
								<div key={step.title} className="space-y-basalt-space-sm">
									<div className="flex flex-wrap items-center justify-between gap-basalt-space-md">
										<p className="text-basalt-base font-medium text-basalt-foreground">
											{index + 1}. {step.title}
										</p>
										<div className="flex items-center gap-basalt-space-md">
											{step.symbol && <Badge variant="outline">{step.symbol}</Badge>}
											{step.anchor && (
												<Button
													type="button"
													size="sm"
													variant="ghost"
													onClick={() => focusPart(step.anchor as string)}
												>
													Locate
												</Button>
											)}
										</div>
									</div>
									<p className="text-basalt-sm text-basalt-muted-foreground">{step.detail}</p>
								</div>
							))}
						</LayerCard.Body>
					</LayerCard>
					<LayerCard padding="none">
						<LayerCard.Header>Root setup</LayerCard.Header>
						<CodeHighlighted
							attached
							title="root.tsx"
							code={SETUP_SNIPPET}
							lineNumbers
							copyable={false}
						/>
					</LayerCard>
				</div>
			</SectionRule>

			<div className="flex flex-wrap items-center justify-between gap-basalt-layout">
				{neighbors.prev ? (
					<LinkButton variant="outline" href={`/templates/${neighbors.prev.slug}`}>
						<ArrowLeft />
						{neighbors.prev.title}
					</LinkButton>
				) : (
					<span />
				)}
				{neighbors.next && (
					<LinkButton variant="outline" href={`/templates/${neighbors.next.slug}`}>
						{neighbors.next.title}
						<ArrowRight />
					</LinkButton>
				)}
			</div>
		</ShowcasePage>
	);
}

export default function TemplateDetailPage() {
	const { slug = "" } = useParams();
	const { theme } = useTheme();
	const systemDark = useSyncExternalStore(subscribeSystemTheme, systemTheme, () => false);
	const resolvedSiteTheme: "light" | "dark" =
		theme === "system" ? (systemDark ? "dark" : "light") : theme;

	const entry = isKnownTemplateSlug(slug) ? getTemplateBySlug(slug) : undefined;
	if (!entry) {
		return (
			<ShowcasePage
				title="Template not found"
				description="The requested template does not exist in the Basalt catalog."
				actions={
					<LinkButton href="/templates/agent-workspace" variant="outline">
						Open Agent workspace
					</LinkButton>
				}
			>
				<LayerCard>
					<p className="text-basalt-sm text-basalt-muted-foreground">
						Choose any template from the Templates section in the sidebar.
					</p>
				</LayerCard>
			</ShowcasePage>
		);
	}

	return (
		<TemplateWorkbench
			key={entry.slug}
			entry={entry}
			slug={entry.slug}
			resolvedSiteTheme={resolvedSiteTheme}
		/>
	);
}
