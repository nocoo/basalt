import { Button, LinkButton } from "@nocoo/basalt/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nocoo/basalt/components/dropdown-menu";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { Check, ChevronDown, Copy } from "lucide-react";
import { use, useState } from "react";
import { useParams } from "react-router";
import { Github } from "@/components/icons/github";
import { ShowcasePage } from "@/components/ShowcasePage";
import { renderComponentMarkdown } from "@/lib/catalog-markdown";
import {
	CATALOG_BY_SLUG,
	type CatalogEntry,
	catalogBarrelImport,
	catalogGranularImport,
	catalogNavName,
} from "./catalog";
import { loadCatalogPageContent } from "./catalog-content-loader";
import { getCatalogComponentGuide } from "./catalog-guides";
import {
	DOCUMENTED_NATIVE_ONLY_SURFACES,
	formatNativeSurfaceStrategy,
	isDocumentedNativeSurface,
} from "./catalog-native-surfaces";
import type { CatalogScenario } from "./catalog-scenario";
import {
	type CatalogApiSurface,
	type CatalogDocs,
	catalogSourceViewerHref,
	githubSourceHref,
	githubSourceLabel,
} from "./catalog-source";
import { DocCode, DocExample } from "./DocCode";
import { type DocHeading, DocToc } from "./DocToc";

function CopyPageButton({ markdown, slug }: { markdown: string; slug: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<div className="flex shrink-0 items-stretch">
			<Button
				variant="outline"
				size="sm"
				className="rounded-r-none"
				onClick={async () => {
					await navigator.clipboard.writeText(markdown);
					setCopied(true);
				}}
			>
				{copied ? <Check /> : <Copy />}
				Copy page
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="rounded-l-none border-l-0"
						aria-label="Copy page options"
					>
						<ChevronDown />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={async () => {
							await navigator.clipboard.writeText(window.location.href);
						}}
					>
						Copy page link
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							window.open(`/ui/${slug}.md`, "_blank", "noopener,noreferrer");
						}}
					>
						View as Markdown
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={async () => {
							await navigator.clipboard.writeText(`${window.location.origin}/ui/${slug}.md`);
						}}
					>
						Copy Markdown URL
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export function catalogApiSurfaceId(name: string): string {
	return `api-${name}`;
}

export function CatalogApiReference({ api }: { api: CatalogApiSurface[] }) {
	return (
		<SectionRule variant="heading" id="api-reference" title="API Reference" className="scroll-mt-6">
			{api.map((surface) => {
				if (surface.callSignature) {
					return (
						<div key={surface.name} className="space-y-basalt-card-sm">
							<h3
								id={catalogApiSurfaceId(surface.name)}
								className="scroll-mt-6 text-basalt-base font-medium"
							>
								{surface.name}
							</h3>
							<LayerCard className="min-w-0 space-y-basalt-card text-basalt-base [overflow-wrap:anywhere]">
								<div>
									<code className="text-basalt-sm font-mono text-basalt-link font-semibold">
										{surface.callSignature}
									</code>
								</div>
								{surface.description ? (
									<p className="text-basalt-base text-basalt-muted-foreground">
										{surface.description}
									</p>
								) : null}
								{surface.parameters && surface.parameters.length > 0 ? (
									<div className="space-y-basalt-space-sm">
										<p className="text-basalt-sm font-medium text-basalt-foreground">Parameters</p>
										<ul className="list-inside list-disc text-basalt-sm text-basalt-muted-foreground space-y-basalt-space-xs">
											{surface.parameters.map((p) => (
												<li key={p.name}>
													<code>{p.name}</code> ({p.type}
													{p.required ? ", required" : ", optional"})
													{p.description ? ` — ${p.description}` : ""}
												</li>
											))}
										</ul>
									</div>
								) : null}
								{surface.returns ? (
									<div className="text-basalt-sm text-basalt-muted-foreground">
										<span className="font-medium text-basalt-foreground">Returns: </span>
										<code>{surface.returns.type}</code>
										{surface.returns.description ? ` — ${surface.returns.description}` : ""}
									</div>
								) : null}
								{surface.options && surface.options.props.length > 0 ? (
									<div className="space-y-basalt-card-sm pt-basalt-card-sm border-t border-basalt-border">
										<p className="text-basalt-sm font-medium text-basalt-foreground">
											Options (<code>{surface.options.name}</code>)
										</p>
										<div
											role="region"
											// biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow regions need keyboard scrolling.
											tabIndex={0}
											aria-label={`${surface.options.name} API scrolling table`}
											className="basalt-focus basalt-focus-inset max-w-full overflow-x-auto rounded-basalt-md border border-basalt-border"
										>
											<Table
												aria-label={`${surface.options.name} props`}
												className="w-full min-w-[36rem] text-basalt-sm"
											>
												<TableHeader>
													<TableRow>
														<TableHead className="ps-basalt-table-edge">Option</TableHead>
														<TableHead>Type</TableHead>
														<TableHead>Default</TableHead>
														<TableHead className="pe-basalt-table-edge">Description</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{surface.options.props.map((opt) => (
														<TableRow key={opt.name}>
															<TableCell className="font-medium text-basalt-foreground ps-basalt-table-edge">
																{opt.name}
																{opt.required === false ? "?" : ""}
															</TableCell>
															<TableCell className="text-basalt-muted-foreground">
																<code>{opt.type}</code>
															</TableCell>
															<TableCell className="text-basalt-muted-foreground">
																{opt.default ?? "—"}
															</TableCell>
															<TableCell className="text-basalt-muted-foreground pe-basalt-table-edge">
																{opt.description ?? opt.name}
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									</div>
								) : null}
							</LayerCard>
						</div>
					);
				}
				const nativeDoc = DOCUMENTED_NATIVE_ONLY_SURFACES[surface.name];
				const isNative = isDocumentedNativeSurface(
					surface.name,
					surface.props.length,
					surface.props[0]?.name,
				);
				const notes = (
					<>
						{surface.typeParameters ? (
							<p className="text-basalt-sm text-basalt-muted-foreground break-words [overflow-wrap:anywhere]">
								Type parameters: <code>{surface.typeParameters}</code>
							</p>
						) : null}
						{isNative && nativeDoc ? (
							<p className="text-basalt-sm text-basalt-muted-foreground">
								{formatNativeSurfaceStrategy(nativeDoc)}
							</p>
						) : null}
					</>
				);
				return (
					<div key={surface.name} className="space-y-basalt-card-sm">
						<h3
							id={catalogApiSurfaceId(surface.name)}
							className="scroll-mt-6 font-mono text-basalt-base font-semibold text-basalt-foreground"
						>
							{surface.name}
						</h3>
						{surface.props.length === 0 ? (
							<LayerCard className="space-y-basalt-card-sm">
								{notes}
								<p className="text-basalt-base text-basalt-muted-foreground">
									No component-specific props.
								</p>
							</LayerCard>
						) : (
							<LayerCard padding="none" className="overflow-hidden">
								{surface.typeParameters || (isNative && nativeDoc) ? (
									<div className="space-y-basalt-space-sm border-b border-basalt-border/60 px-basalt-card py-basalt-card-sm">
										{notes}
									</div>
								) : null}
								<div
									role="region"
									// biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow regions need keyboard scrolling.
									tabIndex={0}
									aria-label={`${surface.name} API scrolling table`}
									className="basalt-focus basalt-focus-inset max-w-full overflow-x-auto"
								>
									<Table
										aria-label={`${surface.name} props`}
										className="w-full min-w-[36rem] text-basalt-base [&_code]:break-words [&_code]:[overflow-wrap:anywhere]"
									>
										<TableHeader>
											<TableRow>
												<TableHead className="ps-basalt-table-edge">Prop</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Default</TableHead>
												<TableHead className="pe-basalt-table-edge">Description</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{surface.props.map((prop) => (
												<TableRow key={prop.name}>
													<TableCell className="font-medium text-basalt-foreground ps-basalt-table-edge">
														{prop.name}
														{prop.required === false ? "?" : ""}
													</TableCell>
													<TableCell className="text-basalt-muted-foreground">
														<code>{prop.type}</code>
													</TableCell>
													<TableCell className="text-basalt-muted-foreground">
														{prop.default ?? "—"}
													</TableCell>
													<TableCell className="text-basalt-muted-foreground pe-basalt-table-edge">
														{prop.description ?? prop.name}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</LayerCard>
						)}
					</div>
				);
			})}
		</SectionRule>
	);
}

function ReadyDoc({
	entry,
	docs,
	examples,
}: {
	entry: CatalogEntry;
	docs: CatalogDocs;
	examples: readonly CatalogScenario[];
}) {
	const hero = examples[0];
	const widePreview = [
		"inline-editable",
		"editable-nav-item",
		"icon-picker",
		"tag-badge",
		"tag-color-picker",
		"responsive-master-detail",

		"skeleton",
		"table",
		"data-table",
		"multi-select",
		"filter-bar",
		"file-dropzone",
		"upload-queue",
	].includes(entry.slug);
	if (!hero) {
		throw new Error(`Ready catalog page "${entry.slug}" is missing examples[0].`);
	}
	const barrel = catalogBarrelImport(entry);
	const granular = catalogGranularImport(entry);
	const pageMarkdown = renderComponentMarkdown({
		entry,
		docs,
		examples,
		guide: getCatalogComponentGuide(entry.slug),
	});
	const headings: DocHeading[] = [
		{ id: "installation", text: "Installation", depth: 2 as const },
		...(barrel ? [{ id: "barrel", text: "Barrel", depth: 3 as const }] : []),
		{ id: "granular", text: "Granular", depth: 3 as const },
		{ id: "usage", text: "Usage", depth: 2 },
		{ id: "examples", text: "Examples", depth: 2 },
		...examples.map((example) => ({
			id: example.id,
			text: example.title,
			depth: 3 as const,
		})),
		{ id: "api-reference", text: "API Reference", depth: 2 as const },
		...docs.api.map((surface) => ({
			id: catalogApiSurfaceId(surface.name),
			text: surface.name,
			depth: 3 as const,
		})),
	];
	return (
		<ShowcasePage
			variant="document"
			title={catalogNavName(entry)}
			description={docs.description}
			actions={
				<>
					<LinkButton
						href={catalogSourceViewerHref(entry.slug, docs.implementationSource.hash)}
						variant="outline"
						size="sm"
						aria-label="View Basalt component source"
					>
						<Github />
						Source
					</LinkButton>
					<CopyPageButton markdown={pageMarkdown} slug={entry.slug} />
				</>
			}
		>
			<div data-doc-toc-bar="" className="sticky top-0 z-10 xl:hidden">
				<DocToc headings={headings} />
			</div>
			<div className="xl:grid xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-basalt-layout-xl">
				<article
					data-status="ready"
					data-slug={entry.slug}
					className="min-w-0 space-y-basalt-layout-lg"
				>
					<div data-hero-scenario={hero.id}>
						<DocExample code={hero.code} wide={widePreview}>
							<hero.render />
						</DocExample>
					</div>
					{granular ? (
						<SectionRule
							variant="heading"
							id="installation"
							title="Installation"
							className="scroll-mt-6"
						>
							{barrel ? (
								<>
									<h3
										id="barrel"
										className="scroll-mt-6 text-basalt-base font-medium text-basalt-muted-foreground"
									>
										Barrel
									</h3>
									<DocCode code={barrel} />
								</>
							) : null}
							<h3
								id="granular"
								className="scroll-mt-6 text-basalt-base font-medium text-basalt-muted-foreground"
							>
								Granular
							</h3>
							<DocCode code={granular} />
						</SectionRule>
					) : null}
					<SectionRule variant="heading" id="usage" title="Usage" className="scroll-mt-6">
						<DocCode code={docs.usage} />
					</SectionRule>
					<SectionRule variant="heading" id="examples" title="Examples" className="scroll-mt-6">
						{examples.map((example) => (
							<div
								key={example.id}
								id={example.id}
								data-scenario={example.id}
								className="scroll-mt-6 space-y-basalt-layout-sm"
							>
								<h3 className="text-basalt-base font-medium">{example.title}</h3>
								<DocExample code={example.code} wide={widePreview}>
									<example.render />
								</DocExample>
							</div>
						))}
					</SectionRule>
					<CatalogApiReference api={docs.api} />
					<LayerCard className="space-y-basalt-space-sm text-basalt-base text-basalt-muted-foreground [overflow-wrap:anywhere]">
						<p>
							Implementation{" "}
							<a
								className="text-basalt-foreground underline underline-offset-4"
								href={catalogSourceViewerHref(entry.slug, docs.implementationSource.hash)}
							>
								{githubSourceLabel(docs.implementationSource)}
							</a>{" "}
							{docs.implementationSource.file}
							{docs.implementationSource.hash ? ` (sha256: ${docs.implementationSource.hash})` : ""}
						</p>
						{docs.provenance ? (
							<p>
								Provenance{" "}
								<a
									className="text-basalt-foreground underline underline-offset-4"
									href={githubSourceHref(docs.provenance)}
									target="_blank"
									rel="noopener noreferrer"
								>
									{githubSourceLabel(docs.provenance)}
								</a>{" "}
								{docs.provenance.file}
							</p>
						) : null}
					</LayerCard>
				</article>
				<aside className="hidden min-w-0 xl:block">
					<div className="sticky top-4">
						<DocToc headings={headings} />
					</div>
				</aside>
			</div>
		</ShowcasePage>
	);
}

function ReadyCatalogPage({ entry }: { entry: CatalogEntry }) {
	const content = use(loadCatalogPageContent(entry.slug));
	if (!content) {
		throw new Error(`Ready catalog page "${entry.slug}" did not load content.`);
	}
	return <ReadyDoc entry={entry} docs={content.docs} examples={content.examples} />;
}

export default function ComponentDocPage() {
	const { slug } = useParams<{ slug: string }>();
	const entry = slug ? CATALOG_BY_SLUG.get(slug) : undefined;

	if (!entry) {
		return (
			<ShowcasePage
				variant="document"
				data-status="missing"
				title={slug ?? "Unknown"}
				description="This slug is not a public catalog export."
			/>
		);
	}

	return <ReadyCatalogPage entry={entry} />;
}
