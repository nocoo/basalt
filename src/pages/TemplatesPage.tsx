import { Badge } from "@nocoo/basalt/components/badge";
import { Button, LinkButton } from "@nocoo/basalt/components/button";
import { CodeHighlighted } from "@nocoo/basalt/components/code";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { useTheme } from "@nocoo/basalt/providers/theme";
import { Copy, ExternalLink, RotateCw } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";
import type { TemplateFilter, TemplateViewport } from "@/models/template-manifest";
import { type TemplateEntry, viewportContainerClass } from "@/models/templates";
import { useTemplatesShowcaseViewModel } from "@/viewmodels/useTemplatesShowcaseViewModel";

const FILTERS: readonly TemplateFilter[] = [
	"all",
	"featured",
	"agents",
	"dashboards",
	"workspaces",
	"auth",
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

export default function TemplatesPage() {
	const { t } = useTranslation();
	const { theme } = useTheme();
	const systemDark = useSyncExternalStore(subscribeSystemTheme, systemTheme, () => false);
	const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
	const vm = useTemplatesShowcaseViewModel();
	return (
		<ShowcasePage title={t("pages.templates.title")} description={t("pages.templates.description")}>
			<SegmentControl
				aria-label={t("pages.templates.filter")}
				value={vm.filter}
				onValueChange={(value) => vm.setFilter(value as TemplateFilter)}
				options={FILTERS.map((value) => ({ value, label: t(`pages.templates.filters.${value}`) }))}
			/>
			{vm.entries.map((entry) => (
				<SectionRule key={entry.slug} title={t(entry.titleKey)}>
					<LayerCard padding="none">
						<LayerCard.Header className="flex-wrap justify-between">
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-basalt-space-lg">
									<span>{t(entry.titleKey)}</span>
									<Badge variant="outline">{t(`pages.templates.filters.${entry.category}`)}</Badge>
								</div>
								<p className="text-basalt-sm font-normal text-basalt-muted-foreground">
									{t(entry.descriptionKey)}
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-basalt-space-lg">
								<SegmentControl
									aria-label={t("pages.templates.mode")}
									value={vm.mode(entry.slug)}
									onValueChange={(value) => vm.setMode(entry.slug, value as "preview" | "code")}
									options={[
										{ value: "preview", label: t("pages.templates.preview") },
										{ value: "code", label: t("pages.templates.code") },
									]}
								/>
								{vm.mode(entry.slug) === "preview" && (
									<>
										<SegmentControl
											aria-label={t("pages.templates.viewport")}
											value={vm.viewport(entry.slug)}
											onValueChange={(value) =>
												vm.setViewport(entry.slug, value as TemplateViewport)
											}
											options={VIEWPORTS.map((value) => ({
												value,
												label: t(`pages.templates.${value}`),
											}))}
										/>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label={t("pages.templates.reload")}
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
									{t("pages.templates.open")}
								</LinkButton>
								<Button variant="outline" size="sm" onClick={() => void vm.copySource(entry.slug)}>
									<Copy />
									{vm.copiedSlug === entry.slug
										? t("pages.templates.copied")
										: t("pages.templates.copy")}
								</Button>
							</div>
						</LayerCard.Header>
						{vm.copyError === entry.slug && (
							<LayerCard.Body>
								<p role="alert">{t("pages.templates.copyError")}</p>
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
