import { Button } from "@nocoo/basalt/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nocoo/basalt/components/dropdown-menu";
import { Check, ChevronDown, Copy } from "lucide-react";
import { use, useState } from "react";
import { Link, useParams } from "react-router";
import { Github } from "@/components/icons/github";
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
		<div className="flex shrink-0 items-center">
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
						className="rounded-l-none border-l-0 px-2"
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
		<section id="api-reference" className="scroll-mt-6 space-y-4">
			<h2 className="text-2xl font-semibold tracking-tight">API Reference</h2>
			{api.map((surface) => {
				if (surface.callSignature) {
					return (
						<div key={surface.name} className="space-y-4">
							<h3
								id={catalogApiSurfaceId(surface.name)}
								className="scroll-mt-6 text-sm font-medium"
							>
								{surface.name}
							</h3>
							<div className="overflow-hidden rounded-lg border border-border bg-card p-4 space-y-3 text-sm">
								<div>
									<code className="text-xs font-mono text-primary font-semibold">
										{surface.callSignature}
									</code>
								</div>
								{surface.description ? (
									<p className="text-sm text-muted-foreground">{surface.description}</p>
								) : null}
								{surface.parameters && surface.parameters.length > 0 ? (
									<div className="space-y-1">
										<p className="text-xs font-medium text-foreground">Parameters</p>
										<ul className="list-inside list-disc text-xs text-muted-foreground space-y-0.5">
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
									<div className="text-xs text-muted-foreground">
										<span className="font-medium text-foreground">Returns: </span>
										<code>{surface.returns.type}</code>
										{surface.returns.description ? ` — ${surface.returns.description}` : ""}
									</div>
								) : null}
								{surface.options && surface.options.props.length > 0 ? (
									<div className="space-y-2 pt-2 border-t border-border">
										<p className="text-xs font-medium text-foreground">
											Options (<code>{surface.options.name}</code>)
										</p>
										<div className="overflow-hidden rounded-md border border-border">
											<table
												aria-label={`${surface.options.name} props`}
												className="w-full text-xs"
											>
												<thead>
													<tr className="border-b border-border bg-background text-left text-muted-foreground">
														<th className="px-3 py-2 font-medium">Option</th>
														<th className="px-3 py-2 font-medium">Type</th>
														<th className="px-3 py-2 font-medium">Default</th>
														<th className="px-3 py-2 font-medium">Description</th>
													</tr>
												</thead>
												<tbody>
													{surface.options.props.map((opt) => (
														<tr key={opt.name} className="border-t border-border">
															<td className="px-3 py-2 font-medium text-foreground">
																{opt.name}
																{opt.required === false ? "?" : ""}
															</td>
															<td className="px-3 py-2 text-muted-foreground">
																<code>{opt.type}</code>
															</td>
															<td className="px-3 py-2 text-muted-foreground">
																{opt.default ?? "—"}
															</td>
															<td className="px-3 py-2 text-muted-foreground">
																{opt.description ?? opt.name}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								) : null}
							</div>
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
					<div key={surface.name} className="space-y-4">
						<h3 id={catalogApiSurfaceId(surface.name)} className="scroll-mt-6 text-sm font-medium">
							{surface.name}
						</h3>
						{isNative && nativeDoc ? (
							<p className="text-xs text-muted-foreground">
								{formatNativeSurfaceStrategy(nativeDoc)}
							</p>
						) : null}
						{surface.props.length === 0 ? (
							<p className="text-sm text-muted-foreground">No component-specific props.</p>
						) : (
							<div className="overflow-hidden rounded-lg border border-border">
								<table aria-label={`${surface.name} props`} className="w-full text-sm">
									<thead>
										<tr className="border-b border-border bg-background text-left text-muted-foreground">
											<th className="px-4 py-2.5 font-medium">Prop</th>
											<th className="px-4 py-2.5 font-medium">Type</th>
											<th className="px-4 py-2.5 font-medium">Default</th>
											<th className="px-4 py-2.5 font-medium">Description</th>
										</tr>
									</thead>
									<tbody>
										{surface.props.map((prop) => (
											<tr key={prop.name} className="border-t border-border">
												<td className="px-4 py-2.5 font-medium text-foreground">
													{prop.name}
													{prop.required === false ? "?" : ""}
												</td>
												<td className="px-4 py-2.5 text-muted-foreground">
													<code>{prop.type}</code>
												</td>
												<td className="px-4 py-2.5 text-muted-foreground">{prop.default ?? "—"}</td>
												<td className="px-4 py-2.5 text-muted-foreground">
													{prop.description ?? prop.name}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				);
			})}
		</section>
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
	const widePreview = ["skeleton-line", "table", "data-table"].includes(entry.slug);
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
		<div>
			<header className="border-b border-border px-6 py-8 md:px-8 md:py-10">
				<div className="mb-3 flex items-start justify-between gap-4">
					<div className="flex min-w-0 items-center gap-3">
						<h1 className="text-4xl font-semibold tracking-tight text-foreground">
							{catalogNavName(entry)}
						</h1>
						<a
							href={catalogSourceViewerHref(entry.slug, docs.implementationSource.hash)}
							className="text-muted-foreground transition-colors hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium rounded-basalt-md border border-border px-2.5 py-1"
							aria-label="View Basalt component source"
						>
							<Github className="h-4 w-4" />
							<span>Source</span>
						</a>
					</div>
					<CopyPageButton markdown={pageMarkdown} />
				</div>
				<p className="max-w-3xl text-lg leading-normal text-muted-foreground">{docs.description}</p>
			</header>
			<div
				className={`sticky top-0 z-10 border-b border-border bg-secondary py-2 ${widePreview ? "" : "xl:hidden"}`}
			>
				<div className="px-6">
					<DocToc headings={headings} compact={widePreview} />
				</div>
			</div>
			<div
				className={`px-6 py-8 md:px-8 md:py-10 ${widePreview ? "" : "xl:grid xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-16"}`}
			>
				<article data-status="ready" data-slug={entry.slug} className="min-w-0 space-y-12">
					<div data-hero-scenario={hero.id}>
						<DocExample code={hero.code} wide={widePreview}>
							<hero.render />
						</DocExample>
					</div>
					{granular ? (
						<section id="installation" className="scroll-mt-6 space-y-4">
							<h2 className="text-2xl font-semibold tracking-tight">Installation</h2>
							{barrel ? (
								<>
									<h3 id="barrel" className="scroll-mt-6 text-sm font-medium text-muted-foreground">
										Barrel
									</h3>
									<DocCode code={barrel} />
								</>
							) : null}
							<h3 id="granular" className="scroll-mt-6 text-sm font-medium text-muted-foreground">
								Granular
							</h3>
							<DocCode code={granular} />
						</section>
					) : null}
					<section id="usage" className="scroll-mt-6 space-y-4">
						<h2 className="text-2xl font-semibold tracking-tight">Usage</h2>
						<DocCode code={docs.usage} />
					</section>
					<section id="examples" className="scroll-mt-6 space-y-8">
						<h2 className="text-2xl font-semibold tracking-tight">Examples</h2>
						{examples.map((example) => (
							<div
								key={example.id}
								id={example.id}
								data-scenario={example.id}
								className="scroll-mt-6 space-y-3"
							>
								<h3 className="text-sm font-medium">{example.title}</h3>
								<DocExample code={example.code} wide={widePreview}>
									<example.render />
								</DocExample>
							</div>
						))}
					</section>
					<CatalogApiReference api={docs.api} />
					<div className="space-y-1 text-sm text-muted-foreground">
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
		</div>
	);
}

function ReadyCatalogPage({ entry }: { entry: CatalogEntry }) {
	const content = use(loadCatalogPageContent(entry.slug));
	if (!content) {
		throw new Error(`Ready catalog page "${entry.slug}" did not load content.`);
	}
	return <ReadyDoc entry={entry} docs={content.docs} examples={content.examples} />;
}

function CatalogHero({ title, description }: { title: string; description: string }) {
	return (
		<header className="border-b border-border px-6 py-8 md:px-8 md:py-10">
			<h1 className="text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
			<p className="mt-3 text-lg leading-normal text-muted-foreground">{description}</p>
		</header>
	);
}

export default function UiPlaceholderPage() {
	const { slug } = useParams<{ slug: string }>();
	const entry = slug ? CATALOG_BY_SLUG.get(slug) : undefined;

	if (!entry) {
		return (
			<div data-status="missing">
				<CatalogHero
					title={slug ?? "Unknown"}
					description="This slug is not a 6.2 public export."
				/>
			</div>
		);
	}

	if (catalogPageStatus(entry.slug) === "ready") {
		return <ReadyCatalogPage entry={entry} />;
	}

	return (
		<div data-status="placeholder" data-slug={entry.slug}>
			<CatalogHero
				title={catalogNavName(entry)}
				description="未实现. This catalog page is a placeholder until the control ships."
			/>
			<div className="px-6 py-8 text-sm text-muted-foreground md:px-8">
				<Link className="text-foreground underline underline-offset-4" to="/ui">
					Library index
				</Link>
			</div>
		</div>
	);
}
