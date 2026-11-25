import { Badge } from "@nocoo/basalt/components/badge";
import { Button, LinkButton } from "@nocoo/basalt/components/button";
import { CodeHighlighted } from "@nocoo/basalt/components/code";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { useTheme } from "@nocoo/basalt/providers/theme";
import { Copy, ExternalLink, RotateCw } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { ShowcasePage } from "@/components/ShowcasePage";
import type { TemplateEntry } from "@/lib/template-catalog";
import type { TemplateFilter, TemplateViewport } from "@/models/template-manifest";
import { viewportContainerClass } from "@/models/templates";
import { useTemplatesShowcaseViewModel } from "@/viewmodels/useTemplatesShowcaseViewModel";

const FILTERS: readonly TemplateFilter[] = [
	"all",
	"featured",
	"workspaces",
	"dashboards",
	"standalone",
];
const VIEWPORTS: readonly TemplateViewport[] = ["desktop", "tablet", "mobile"];
const mediaQuery = "(prefers-color-scheme: dark)";

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
	viewport,
	theme,
}: {
	entry: TemplateEntry;
	viewport: TemplateViewport;
	theme: "light" | "dark";
}) {
	const frame = useRef<HTMLIFrameElement>(null);
	const initialTheme = useRef(theme);
	function syncTheme() {
		frame.current?.contentWindow?.postMessage(
			{ type: "basalt-template-theme", theme },
			window.location.origin,
		);
	}
	useEffect(syncTheme, [theme]);
	return (
		<div className="overflow-hidden bg-basalt-background p-basalt-layout">
			<div className={viewportContainerClass(viewport)}>
				<iframe
					ref={frame}
					title={entry.fileName}
					src={`/view/${entry.slug}?theme=${initialTheme.current}`}
					className="block w-full border-0"
					style={{ height: `${entry.heightRem}rem` }}
					loading="lazy"
					onLoad={syncTheme}
				/>
			</div>
		</div>
	);
}

const FILTER_LABELS: Record<TemplateFilter, string> = {
	all: "All",
	featured: "Featured",
	workspaces: "Workspaces",
	dashboards: "Dashboards",
	standalone: "Standalone",
};

const VIEWPORT_LABELS: Record<TemplateViewport, string> = {
	desktop: "Desktop",
	tablet: "Tablet",
	mobile: "Mobile",
};

export default function TemplatesPage() {
	const { theme } = useTheme();
	const systemDark = useSyncExternalStore(subscribeSystemTheme, systemTheme, () => false);
	const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
	const vm = useTemplatesShowcaseViewModel();
	return (
		<ShowcasePage
			title="Templates"
			description="Explore complete interfaces, resize the preview, and copy standalone source."
		>
			<SegmentControl
				aria-label="Filter templates"
				value={vm.filter}
				onValueChange={(value) => vm.setFilter(value as TemplateFilter)}
				options={FILTERS.map((value) => ({ value, label: FILTER_LABELS[value] }))}
			/>
			{vm.entries.map((entry) => (
				<SectionRule key={entry.slug} title={entry.title}>
					<LayerCard padding="none">
						<LayerCard.Header className="flex-wrap justify-between">
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-basalt-space-lg">
									<span>{entry.title}</span>
									<Badge variant="outline">{FILTER_LABELS[entry.category]}</Badge>
								</div>
								<p className="text-basalt-sm font-normal text-basalt-muted-foreground">
									{entry.description}
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-basalt-space-lg">
								<SegmentControl
									aria-label="Display mode"
									value={vm.mode(entry.slug)}
									onValueChange={(value) => vm.setMode(entry.slug, value as "preview" | "code")}
									options={[
										{ value: "preview", label: "Preview" },
										{ value: "code", label: "Code" },
									]}
								/>
								{vm.mode(entry.slug) === "preview" && (
									<>
										<SegmentControl
											aria-label="Preview width"
											value={vm.viewport(entry.slug)}
											onValueChange={(value) =>
												vm.setViewport(entry.slug, value as TemplateViewport)
											}
											options={VIEWPORTS.map((value) => ({
												value,
												label: VIEWPORT_LABELS[value],
											}))}
										/>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Reload preview"
											onClick={() => vm.reload(entry.slug)}
										>
											<RotateCw />
										</Button>
									</>
								)}
								<LinkButton
									variant="outline"
									size="sm"
									href={`/view/${entry.slug}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink />
									Open standalone
								</LinkButton>
								<Button variant="outline" size="sm" onClick={() => void vm.copySource(entry.slug)}>
									<Copy />
									{vm.copiedSlug === entry.slug ? "Copied" : "Copy code"}
								</Button>
							</div>
						</LayerCard.Header>
						{vm.copyError === entry.slug && (
							<LayerCard.Body>
								<p role="alert">Could not copy. Check clipboard permissions and try again.</p>
							</LayerCard.Body>
						)}
						{vm.mode(entry.slug) === "preview" ? (
							<TemplateFrame
								key={`${entry.slug}-${vm.reloadKey(entry.slug)}`}
								entry={entry}
								viewport={vm.viewport(entry.slug)}
								theme={resolvedTheme}
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
				</SectionRule>
			))}
		</ShowcasePage>
	);
}
