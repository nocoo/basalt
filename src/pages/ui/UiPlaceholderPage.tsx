import { Button } from "@nocoo/basalt/components/button";
import { Check, ChevronDown, Copy } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { Github } from "@/components/icons/github";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATALOG_BY_SLUG, type CatalogEntry, catalogImportPath, catalogNavName } from "./catalog";
import type { CatalogScenario } from "./catalog-scenario";
import {
	type CatalogApiSurface,
	type CatalogDocs,
	catalogSourceCopyText,
	githubSourceHref,
	githubSourceLabel,
} from "./catalog-source";
import { DocCode, DocExample } from "./DocCode";
import { type DocHeading, DocToc } from "./DocToc";
import { catalogHeroScenario, UI_EXAMPLES } from "./demos";
import { CATALOG_DOCS } from "./docs";

function barrelImport(entry: CatalogEntry): string | null {
	if (entry.kind !== "stable" && entry.kind !== "provider") {
		return null;
	}
	return `import { ${entry.name} } from "@nocoo/basalt";`;
}

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
		...api.flatMap((surface) => [
			`### ${surface.name}`,
			...(surface.props.length === 0
				? ["No component-specific props."]
				: surface.props.map((prop) => {
						const required =
							prop.required === undefined ? "" : prop.required ? ", required" : ", optional";
						return `- ${prop.name} (${prop.type}${required}, default ${prop.default ?? "—"}): ${prop.description ?? ""}`;
					})),
		]),
	];
}

export function CatalogApiReference({ api }: { api: CatalogApiSurface[] }) {
	return (
		<section id="api-reference" className="scroll-mt-6 space-y-4">
			<h2 className="text-2xl font-semibold tracking-tight">API Reference</h2>
			{api.map((surface) => (
				<div key={surface.name} className="space-y-4">
					<h3 id={catalogApiSurfaceId(surface.name)} className="scroll-mt-6 text-sm font-medium">
						{surface.name}
					</h3>
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
			))}
		</section>
	);
}

function ReadyDoc({
	entry,
	docs,
	hero,
}: {
	entry: CatalogEntry;
	docs: CatalogDocs;
	hero: CatalogScenario;
}) {
	const importPath = catalogImportPath(entry);
	const barrel = barrelImport(entry);
	const granular = `import { ${entry.name} } from "${importPath}";`;
	const examples = UI_EXAMPLES[entry.slug] ?? [];
	const pageMarkdown = [
		`# ${catalogNavName(entry)}`,
		docs.description,
		"## Installation",
		barrel ?? "",
		granular,
		"## Usage",
		docs.usage,
		"## Examples",
		...examples.flatMap((example) => [`### ${example.title}`, example.code]),
		...catalogApiCopyLines(docs.api),
		catalogSourceCopyText(docs),
	].join("\n\n");
	const headings: DocHeading[] = [
		{ id: "installation", text: "Installation", depth: 2 },
		...(barrel ? [{ id: "barrel", text: "Barrel", depth: 3 as const }] : []),
		{ id: "granular", text: "Granular", depth: 3 },
		{ id: "usage", text: "Usage", depth: 2 },
		{ id: "examples", text: "Examples", depth: 2 },
		...examples.map((example) => ({
			id: example.id,
			text: example.title,
			depth: 3 as const,
		})),
		{ id: "api-reference", text: "API Reference", depth: 2 },
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
							href={githubSourceHref(docs.implementationSource)}
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground transition-colors hover:text-foreground"
							aria-label="View Basalt implementation on GitHub"
						>
							<Github className="h-7 w-7" />
						</a>
					</div>
					<CopyPageButton markdown={pageMarkdown} />
				</div>
				<p className="max-w-3xl text-lg leading-normal text-muted-foreground">{docs.description}</p>
			</header>
			<div className="sticky top-0 z-10 border-b border-border bg-secondary py-2 xl:hidden">
				<div className="px-6">
					<DocToc headings={headings} />
				</div>
			</div>
			<div className="px-6 py-8 md:px-8 md:py-10 xl:grid xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-16">
				<article data-status="ready" data-slug={entry.slug} className="min-w-0 space-y-12">
					<div data-hero-scenario={hero.id}>
						<DocExample code={hero.code}>
							<hero.render />
						</DocExample>
					</div>
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
								<DocExample code={example.code}>
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
								href={githubSourceHref(docs.implementationSource)}
								target="_blank"
								rel="noopener noreferrer"
							>
								{githubSourceLabel(docs.implementationSource)}
							</a>{" "}
							{docs.implementationSource.file}
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
				<aside className="hidden min-w-0 xl:block">
					<div className="sticky top-4">
						<DocToc headings={headings} />
					</div>
				</aside>
			</div>
		</div>
	);
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

	const hero = catalogHeroScenario(entry.slug);
	const docs = CATALOG_DOCS[entry.slug];
	if (hero && docs) {
		return <ReadyDoc entry={entry} docs={docs} hero={hero} />;
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
