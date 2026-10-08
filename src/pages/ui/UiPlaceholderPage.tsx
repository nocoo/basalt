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
import { Link, useParams } from "react-router";
import { Github } from "@/components/icons/github";
import { ShowcasePage } from "@/components/ShowcasePage";
import {
	CATALOG_BY_SLUG,
	type CatalogEntry,
	catalogBarrelImport,
	catalogGranularImport,
	catalogNavName,
} from "./catalog";
import { loadCatalogPageContent } from "./catalog-content-loader";
import {
	DOCUMENTED_NATIVE_ONLY_SURFACES,
	formatNativeSurfaceStrategy,
	isDocumentedNativeSurface,
} from "./catalog-native-surfaces";
import { catalogPageStatus } from "./catalog-page-status";
import type { CatalogScenario } from "./catalog-scenario";
import {
	type CatalogApiSurface,
	type CatalogDocs,
	catalogSourceCopyText,
	catalogSourceViewerHref,
	githubSourceHref,
	githubSourceLabel,
} from "./catalog-source";
import { DocCode, DocExample } from "./DocCode";
import { type DocHeading, DocToc } from "./DocToc";

function CopyPageButton({ markdown }: { markdown: string }) {
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
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export function catalogApiSurfaceId(name: string): string {
	return `api-${name}`;
}

function catalogApiCopyLines(api: CatalogApiSurface[]): string[] {
	return [
		"## API Reference",
		...api.flatMap((surface) => {
			if (surface.callSignature) {
				const lines = [`### ${surface.name}`, `\`${surface.callSignature}\``];
				if (surface.description) {
					lines.push(surface.description);
				}
				if (surface.parameters && surface.parameters.length > 0) {
					lines.push(
						"Parameters:",
						...surface.parameters.map((p) => {
							const req = p.required ? ", required" : ", optional";
							return `- ${p.name} (${p.type}${req}): ${p.description ?? ""}`;
						}),
					);
				}
				if (surface.returns) {
					const retDesc = surface.returns.description ? `: ${surface.returns.description}` : "";
					lines.push(`Returns: \`${surface.returns.type}\`${retDesc}`);
				}
				if (surface.options && surface.options.props.length > 0) {
					lines.push(
						`Options (${surface.options.name}):`,
						...surface.options.props.map((p) => {
							const req = p.required ? ", required" : ", optional";
							return `- ${p.name} (${p.type}${req}, default ${p.default ?? "—"}): ${p.description ?? ""}`;
						}),
					);
				}
				return lines;
			}
			const nativeDoc = DOCUMENTED_NATIVE_ONLY_SURFACES[surface.name];
			const isNative = isDocumentedNativeSurface(
				surface.name,
				surface.props.length,
				surface.props[0]?.name,
			);
			const strategyLine = isNative && nativeDoc ? [formatNativeSurfaceStrategy(nativeDoc)] : [];
			return [
				`### ${surface.name}`,
				...(surface.typeParameters ? [`Type parameters: \`${surface.typeParameters}\``] : []),
				...strategyLine,
				...(surface.props.length === 0
					? ["No component-specific props."]
					: surface.props.map((prop) => {
							const required =
								prop.required === undefined ? "" : prop.required ? ", required" : ", optional";
							return `- ${prop.name} (${prop.type}${required}, default ${prop.default ?? "—"}): ${prop.description ?? ""}`;
						})),
			];
		}),
	];
}

export function CatalogApiReference({ api }: { api: CatalogApiSurface[] }) {
	return (
		<SectionRule variant="heading" id="api-reference" title="API Reference" className="scroll-mt-6">
			{api.map((surface) => {
				if (surface.callSignature) {
					return (
						<div key={surface.name} className="space-y-basalt-space-lg">
							<h3
								id={catalogApiSurfaceId(surface.name)}
								className="scroll-mt-6 text-basalt-base font-medium"
							>
								{surface.name}
							</h3>
							<LayerCard className="min-w-0 space-y-basalt-space-lg text-basalt-base [overflow-wrap:anywhere]">
								<div>
									<code className="text-basalt-sm font-mono text-primary font-semibold">
										{surface.callSignature}
									</code>
								</div>
								{surface.description ? (
									<p className="text-basalt-base text-muted-foreground">{surface.description}</p>
								) : null}
								{surface.parameters && surface.parameters.length > 0 ? (
									<div className="space-y-basalt-space-sm">
										<p className="text-basalt-sm font-medium text-foreground">Parameters</p>
										<ul className="list-inside list-disc text-basalt-sm text-muted-foreground space-y-basalt-space-xs">
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
									<div className="text-basalt-sm text-muted-foreground">
										<span className="font-medium text-foreground">Returns: </span>
										<code>{surface.returns.type}</code>
										{surface.returns.description ? ` — ${surface.returns.description}` : ""}
									</div>
								) : null}
								{surface.options && surface.options.props.length > 0 ? (
									<div className="space-y-basalt-space-lg pt-basalt-space-lg border-t border-border">
										<p className="text-basalt-sm font-medium text-foreground">
											Options (<code>{surface.options.name}</code>)
										</p>
										<div
											role="region"
											// biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow regions need keyboard scrolling.
											tabIndex={0}
											aria-label={`${surface.options.name} API scrolling table`}
											className="max-w-full overflow-x-auto rounded-basalt-md border border-border focus-visible:outline-2 focus-visible:outline-primary"
										>
											<Table
												aria-label={`${surface.options.name} props`}
												className="w-full min-w-[36rem] text-basalt-sm"
											>
												<TableHeader>
													<TableRow>
														<TableHead>Option</TableHead>
														<TableHead>Type</TableHead>
														<TableHead>Default</TableHead>
														<TableHead>Description</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{surface.options.props.map((opt) => (
														<TableRow key={opt.name}>
															<TableCell className="font-medium text-foreground">
																{opt.name}
																{opt.required === false ? "?" : ""}
															</TableCell>
															<TableCell className="text-muted-foreground">
																<code>{opt.type}</code>
															</TableCell>
															<TableCell className="text-muted-foreground">
																{opt.default ?? "—"}
															</TableCell>
															<TableCell className="text-muted-foreground">
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
				return (
					<div key={surface.name} className="space-y-basalt-space-lg">
						<h3
							id={catalogApiSurfaceId(surface.name)}
							className="scroll-mt-6 text-basalt-base font-medium"
						>
							{surface.name}
						</h3>
						{surface.typeParameters && (
							<p className="text-basalt-sm text-muted-foreground break-words [overflow-wrap:anywhere]">
								Type parameters: <code>{surface.typeParameters}</code>
							</p>
						)}
						{isNative && nativeDoc ? (
							<p className="text-basalt-sm text-muted-foreground">
								{formatNativeSurfaceStrategy(nativeDoc)}
							</p>
						) : null}
						{surface.props.length === 0 ? (
							<p className="text-basalt-base text-muted-foreground">No component-specific props.</p>
						) : (
							<div
								role="region"
								// biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow regions need keyboard scrolling.
								tabIndex={0}
								aria-label={`${surface.name} API scrolling table`}
								className="max-w-full overflow-x-auto rounded-basalt-md border border-border focus-visible:outline-2 focus-visible:outline-primary"
							>
								<Table
									aria-label={`${surface.name} props`}
									className="w-full min-w-[36rem] text-basalt-base [&_code]:break-words [&_code]:[overflow-wrap:anywhere]"
								>
									<TableHeader>
										<TableRow>
											<TableHead>Prop</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Default</TableHead>
											<TableHead>Description</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{surface.props.map((prop) => (
											<TableRow key={prop.name}>
												<TableCell className="font-medium text-foreground">
													{prop.name}
													{prop.required === false ? "?" : ""}
												</TableCell>
												<TableCell className="text-muted-foreground">
													<code>{prop.type}</code>
												</TableCell>
												<TableCell className="text-muted-foreground">
													{prop.default ?? "—"}
												</TableCell>
												<TableCell className="text-muted-foreground">
													{prop.description ?? prop.name}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
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

		"skeleton-line",
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
	const pageMarkdown = [
		`# ${catalogNavName(entry)}`,
		docs.description,
		"## Installation",
		...(barrel ? [barrel] : []),
		granular,
		"## Usage",
		docs.usage,
		"## Examples",
		...examples.flatMap((example) => [`### ${example.title}`, example.code]),
		...catalogApiCopyLines(docs.api),
		catalogSourceCopyText(docs, entry.slug),
	].join("\n\n");
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
					<CopyPageButton markdown={pageMarkdown} />
				</>
			}
		>
			<div data-doc-toc-bar="" className={`sticky top-0 z-10 ${widePreview ? "" : "xl:hidden"}`}>
				<DocToc headings={headings} compact={widePreview} />
			</div>
			<div
				className={
					widePreview ? "" : "xl:grid xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-basalt-layout-xl"
				}
			>
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
										className="scroll-mt-6 text-basalt-base font-medium text-muted-foreground"
									>
										Barrel
									</h3>
									<DocCode code={barrel} />
								</>
							) : null}
							<h3
								id="granular"
								className="scroll-mt-6 text-basalt-base font-medium text-muted-foreground"
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
					<div className="space-y-basalt-space-sm text-basalt-base text-muted-foreground [overflow-wrap:anywhere]">
						<p>
							Implementation{" "}
							<a
								className="text-foreground underline underline-offset-4"
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
									className="text-foreground underline underline-offset-4"
									href={githubSourceHref(docs.provenance)}
									target="_blank"
									rel="noopener noreferrer"
								>
									{githubSourceLabel(docs.provenance)}
								</a>{" "}
								{docs.provenance.file}
							</p>
						) : null}
					</div>
				</article>
				<aside className={widePreview ? "hidden" : "hidden min-w-0 xl:block"}>
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

export default function UiPlaceholderPage() {
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

	if (catalogPageStatus(entry.slug) === "ready") {
		return <ReadyCatalogPage entry={entry} />;
	}

	return (
		<ShowcasePage
			variant="document"
			data-status="placeholder"
			data-slug={entry.slug}
			title={catalogNavName(entry)}
			description="未实现. This catalog page is a placeholder until the control ships."
		>
			<div className="text-basalt-base text-muted-foreground">
				<Link className="text-foreground underline underline-offset-4" to="/ui">
					Library index
				</Link>
			</div>
		</ShowcasePage>
	);
}
