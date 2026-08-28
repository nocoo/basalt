import { BookOpen } from "lucide-react";
import { type ComponentType, useState } from "react";
import { Link, useParams } from "react-router";
import { PageIntro } from "@/components/PageIntro";
import { CATALOG_BY_SLUG, type CatalogEntry, catalogImportPath } from "./catalog";
import { DocCode } from "./DocCode";
import { type DocHeading, DocToc } from "./DocToc";
import { UI_DEMOS, UI_EXAMPLES } from "./demos";
import { CATALOG_DOCS, type CatalogDocs } from "./docs";

const ROOT_NAMES = new Set([
	"Button",
	"Checkbox",
	"Input",
	"Label",
	"LayerCard",
	"Link",
	"Separator",
	"Switch",
	"ThemeToggle",
	"Tooltip",
	"LinkProvider",
	"ThemeProvider",
]);

function sourceHref(source: CatalogDocs["source"]): string {
	return `https://github.com/nocoo/${source.repo}/blob/${source.sha}/${source.file}`;
}

function ReadyDoc({
	entry,
	docs,
	Demo,
}: {
	entry: CatalogEntry;
	docs: CatalogDocs;
	Demo: ComponentType;
}) {
	const [copiedPage, setCopiedPage] = useState(false);
	const importPath = catalogImportPath(entry);
	const barrel = ROOT_NAMES.has(entry.name)
		? `import { ${entry.name} } from "@nocoo/basalt";`
		: null;
	const granular = `import { ${entry.name} } from "${importPath}";`;
	const examples = UI_EXAMPLES[entry.slug] ?? [];
	const pageMarkdown = [
		`# ${entry.name}`,
		docs.description,
		"## Installation",
		barrel ?? "",
		granular,
		"## Usage",
		docs.usage,
		"## Examples",
		...examples.flatMap((example) => [`### ${example.title}`, example.code]),
		"## API Reference",
		...docs.props.map(
			(prop) =>
				`- ${prop.name} (${prop.type}, default ${prop.default ?? "—"}): ${prop.description ?? ""}`,
		),
		"## Source",
		`${docs.source.repo}@${docs.source.sha} ${docs.source.file}`,
	].join("\n\n");
	const headings: DocHeading[] = [
		{ id: "preview", text: "Preview", depth: 2 },
		{ id: "installation", text: "Installation", depth: 2 },
		...(barrel ? [{ id: "barrel", text: "Barrel", depth: 3 as const }] : []),
		{ id: "granular", text: "Granular", depth: 3 },
		{ id: "usage", text: "Usage", depth: 2 },
		{ id: "examples", text: "Examples", depth: 2 },
		...examples.map((example, index) => ({
			id: `example-${index}`,
			text: example.title,
			depth: 3 as const,
		})),
		{ id: "api-reference", text: "API Reference", depth: 2 },
		{ id: "source", text: "Source", depth: 2 },
	];
	return (
		<div className="space-y-6">
			<div className="xl:hidden sticky top-0 z-10 bg-card py-2">
				<DocToc headings={headings} />
			</div>
			<div className="xl:grid xl:grid-cols-[minmax(0,1fr)_12rem] xl:gap-10">
				<article data-status="ready" data-slug={entry.slug} className="space-y-10 min-w-0">
					<header className="space-y-3">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<p className="text-xs font-medium tracking-wide text-muted-foreground">LIBRARY</p>
							<button
								type="button"
								className="text-xs underline underline-offset-4"
								onClick={async () => {
									await navigator.clipboard.writeText(pageMarkdown);
									setCopiedPage(true);
								}}
							>
								{copiedPage ? "Copied page" : "Copy page"}
							</button>
						</div>
						<h1 className="text-4xl font-semibold text-foreground">{entry.name}</h1>
						<p className="text-lg text-muted-foreground">{docs.description}</p>
					</header>
					<section id="preview" className="space-y-3">
						<h2 className="text-xl font-semibold">Preview</h2>
						<div className="rounded-card bg-secondary p-5 md:p-6">
							<Demo />
						</div>
					</section>
					<section id="installation" className="space-y-3">
						<h2 className="text-xl font-semibold">Installation</h2>
						{barrel ? (
							<>
								<h3 id="barrel" className="text-sm font-medium">
									Barrel
								</h3>
								<DocCode code={barrel} />
							</>
						) : null}
						<h3 id="granular" className="text-sm font-medium">
							Granular
						</h3>
						<DocCode code={granular} />
					</section>
					<section id="usage" className="space-y-3">
						<h2 className="text-xl font-semibold">Usage</h2>
						<DocCode code={docs.usage} />
					</section>
					<section id="examples" className="space-y-6">
						<h2 className="text-xl font-semibold">Examples</h2>
						{examples.map((example, index) => (
							<div key={example.title} id={`example-${index}`} className="space-y-3">
								<h3 className="text-sm font-medium">{example.title}</h3>
								<div className="rounded-card bg-secondary p-5">
									<example.render />
								</div>
								<DocCode code={example.code} />
							</div>
						))}
					</section>
					<section id="api-reference" className="space-y-3">
						<h2 className="text-xl font-semibold">API Reference</h2>
						<table className="w-full text-sm">
							<thead>
								<tr className="text-left text-muted-foreground">
									<th className="py-2 pr-4 font-medium">Prop</th>
									<th className="py-2 pr-4 font-medium">Type</th>
									<th className="py-2 pr-4 font-medium">Default</th>
									<th className="py-2 font-medium">Description</th>
								</tr>
							</thead>
							<tbody>
								{docs.props.map((prop) => (
									<tr key={prop.name} className="border-t border-border">
										<td className="py-2 pr-4 font-medium text-foreground">{prop.name}</td>
										<td className="py-2 pr-4 text-muted-foreground">
											<code>{prop.type}</code>
										</td>
										<td className="py-2 pr-4 text-muted-foreground">{prop.default ?? "—"}</td>
										<td className="py-2 text-muted-foreground">{prop.description ?? prop.name}</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
					<section id="source" className="space-y-2">
						<h2 className="text-xl font-semibold">Source</h2>
						<p className="text-sm text-muted-foreground">
							<a
								className="underline underline-offset-4 text-foreground"
								href={sourceHref(docs.source)}
							>
								{docs.source.repo}@{docs.source.sha}
							</a>{" "}
							{docs.source.file}
						</p>
					</section>
				</article>
				<div className="hidden xl:block">
					<DocToc headings={headings} />
				</div>
			</div>
		</div>
	);
}

export default function UiPlaceholderPage() {
	const { slug } = useParams<{ slug: string }>();
	const entry = slug ? CATALOG_BY_SLUG.get(slug) : undefined;

	if (!entry) {
		return (
			<div data-status="missing" className="space-y-4">
				<PageIntro
					title={slug ?? "Unknown"}
					description="This slug is not a 6.2 public export."
					eyebrow="Library"
					icon={BookOpen}
				/>
			</div>
		);
	}

	const Demo = UI_DEMOS[entry.slug];
	const docs = CATALOG_DOCS[entry.slug];
	if (Demo && docs) {
		return <ReadyDoc entry={entry} docs={docs} Demo={Demo} />;
	}

	return (
		<div data-status="placeholder" data-slug={entry.slug} className="space-y-4">
			<PageIntro
				title={entry.name}
				description="未实现. This catalog page is a placeholder until the control ships."
				eyebrow="Library"
				icon={BookOpen}
			/>
			<div className="rounded-card bg-secondary p-5 text-sm text-muted-foreground space-y-2">
				<p>
					<Link className="text-foreground underline underline-offset-4" to="/ui">
						Library index
					</Link>
				</p>
			</div>
		</div>
	);
}
