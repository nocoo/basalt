import { TEMPLATE_MANIFEST, type TemplateMetadata } from "../models/template-manifest";
import {
	CATALOG,
	CATALOG_BY_SLUG,
	type CatalogEntry,
	catalogBarrelImport,
	catalogGranularImport,
	catalogNavName,
	libraryNavEntries,
} from "../pages/ui/catalog";
import {
	CATALOG_CATEGORIES,
	type CatalogCategory,
	catalogCategory,
	catalogCategoryPath,
} from "../pages/ui/catalog-categories";
import { CATEGORY_GUIDES } from "../pages/ui/catalog-category-guides";
import {
	DOCUMENTED_NATIVE_ONLY_SURFACES,
	formatNativeSurfaceStrategy,
	isDocumentedNativeSurface,
} from "../pages/ui/catalog-native-surfaces";
import type { CatalogScenario } from "../pages/ui/catalog-scenario";
import {
	type CatalogApiProp,
	type CatalogApiSurface,
	type CatalogDocs,
	catalogSourceCopyText,
} from "../pages/ui/catalog-source";
import { SITE, SITE_ORIGIN } from "./site";
import { APP_VERSION } from "./version";

export interface MarkdownGuideInfo {
	useWhen: string;
	avoidWhen: string;
	instead?: string;
	placement: string;
}

export interface MarkdownCatalogRoute {
	path: string;
	url: string;
	kind:
		| "home"
		| "ui-index"
		| "category"
		| "component"
		| "templates-index"
		| "template"
		| "agent-doc";
	title: string;
	description: string;
}

function normalizeOrigin(origin: string): string {
	return origin.replace(/\/+$/, "");
}

function fencedCode(lang: string, code: string): string {
	const trimmed = code.trimEnd();
	const fence = trimmed.includes("```") ? "````" : "```";
	return `${fence}${lang}\n${trimmed}\n${fence}`;
}

function formatPropLine(prop: CatalogApiProp, omitUndefinedRequired: boolean): string {
	const required =
		omitUndefinedRequired && prop.required === undefined
			? ""
			: prop.required
				? ", required"
				: ", optional";
	return `- ${prop.name} (${prop.type}${required}, default ${prop.default ?? "—"}): ${prop.description ?? ""}`;
}

export function catalogApiCopyLines(api: readonly CatalogApiSurface[]): string[] {
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
						...surface.parameters.map((param) => {
							const required = param.required ? ", required" : ", optional";
							return `- ${param.name} (${param.type}${required}): ${param.description ?? ""}`;
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
						...surface.options.props.map((prop) => formatPropLine(prop, false)),
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
					: surface.props.map((prop) => formatPropLine(prop, true))),
			];
		}),
	];
}

function renderGuideSection(guide: MarkdownGuideInfo, baseOrigin: string): string[] {
	const insteadEntry = guide.instead ? CATALOG_BY_SLUG.get(guide.instead) : undefined;
	const insteadSuffix = guide.instead
		? insteadEntry
			? ` Use [${catalogNavName(insteadEntry)}](${baseOrigin}/ui/${insteadEntry.slug}.md) instead.`
			: ` Use ${guide.instead} instead.`
		: "";
	return [
		"## When to use",
		[
			`- Use when: ${guide.useWhen}`,
			`- Avoid when: ${guide.avoidWhen}${insteadSuffix}`,
			`- Placement: ${guide.placement}`,
		].join("\n"),
	];
}

export function renderComponentMarkdown(input: {
	entry: CatalogEntry;
	docs: CatalogDocs;
	examples: readonly CatalogScenario[];
	guide?: MarkdownGuideInfo;
	origin?: string;
}): string {
	const { entry, docs, examples, guide } = input;
	const baseOrigin = normalizeOrigin(input.origin ?? SITE_ORIGIN);
	const barrel = catalogBarrelImport(entry);
	const granular = catalogGranularImport(entry);
	const installImports = barrel ? `${barrel}\n${granular}` : granular;
	const guideSection = guide ? renderGuideSection(guide, baseOrigin) : [];

	return [
		`# ${catalogNavName(entry)}`,
		`> ${docs.description}`,
		`URL: ${baseOrigin}/ui/${entry.slug} · Markdown: ${baseOrigin}/ui/${entry.slug}.md`,
		...guideSection,
		"## Installation",
		fencedCode("sh", "bun add @nocoo/basalt"),
		fencedCode("ts", installImports),
		"## Usage",
		fencedCode("tsx", docs.usage),
		"## Examples",
		...examples.flatMap((example) => [`### ${example.title}`, fencedCode("tsx", example.code)]),
		...catalogApiCopyLines(docs.api),
		catalogSourceCopyText(docs, entry.slug),
	].join("\n\n");
}

export function renderCategoryOverviewMarkdown(
	categoryId: CatalogCategory,
	origin = SITE_ORIGIN,
): string {
	const baseOrigin = normalizeOrigin(origin);
	const category = catalogCategory(categoryId);
	if (!category) {
		throw new Error(`Unknown catalog category: ${categoryId}`);
	}
	const guide = CATEGORY_GUIDES[categoryId];
	const entries = libraryNavEntries(categoryId);
	return [
		`# ${category.label}`,
		`> ${category.description}`,
		`URL: ${baseOrigin}${catalogCategoryPath(category.id)} · Markdown: ${baseOrigin}${catalogCategoryPath(category.id)}.md`,
		`Size contract: ${category.size}`,
		"## Rationale",
		guide.rationale,
		"## Geometry",
		guide.geometry,
		"## Interaction",
		guide.interaction,
		"## Best Practices",
		guide.practices.map((practice) => `- ${practice}`).join("\n"),
		"## Components",
		entries
			.map(
				(entry) =>
					`- [${catalogNavName(entry)}](${baseOrigin}/ui/${entry.slug}.md) (\`${entry.importPath}\`)`,
			)
			.join("\n"),
	].join("\n\n");
}

export function renderUiIndexMarkdown(
	guides: Readonly<Record<string, MarkdownGuideInfo>> = {},
	origin = SITE_ORIGIN,
): string {
	const baseOrigin = normalizeOrigin(origin);
	const sections = CATALOG_CATEGORIES.flatMap((category) => {
		const entries = libraryNavEntries(category.id);
		const lines = entries.map((entry) => {
			const guide = guides[entry.slug];
			const summary = guide ? ` — ${guide.useWhen}` : "";
			return `- [${catalogNavName(entry)}](${baseOrigin}/ui/${entry.slug}.md) (\`${entry.importPath}\`)${summary}`;
		});
		return [
			`## ${category.label}`,
			`${category.description} ([Category overview](${baseOrigin}${catalogCategoryPath(category.id)}.md))`,
			lines.join("\n"),
		];
	});
	return [
		"# Basalt UI Components",
		`> Browse all ${CATALOG.length} Basalt components, charts, providers, and blocks.`,
		`URL: ${baseOrigin}/ui · Markdown: ${baseOrigin}/ui.md`,
		...sections,
	].join("\n\n");
}

export function renderTemplatesIndexMarkdown(origin = SITE_ORIGIN): string {
	const baseOrigin = normalizeOrigin(origin);
	const items = TEMPLATE_MANIFEST.flatMap((template) => [
		`## ${template.title}`,
		template.description,
		[
			`- Category: \`${template.category}\``,
			`- Height: \`${template.heightRem}rem\``,
			`- Live preview: ${baseOrigin}/view/${template.slug}`,
			`- Markdown: ${baseOrigin}/templates/${template.slug}.md`,
		].join("\n"),
	]);
	return [
		"# Basalt Templates",
		`> Browse all ${TEMPLATE_MANIFEST.length} full-page application templates built with @nocoo/basalt.`,
		`URL: ${baseOrigin}/templates · Markdown: ${baseOrigin}/templates.md`,
		...items,
	].join("\n\n");
}

function extractPackageImports(source: string): string[] {
	const specifiers = new Set<string>();
	const pattern = /(?:^|\r?\n)import\s+(?:["']([^"']+)["']|[^;"']*?\sfrom\s+["']([^"']+)["'])/g;
	for (const match of source.matchAll(pattern)) {
		const specifier = match[1] ?? match[2];
		if (specifier) {
			specifiers.add(specifier);
		}
	}
	return [...specifiers].sort((a, b) => {
		const aBasalt = a.startsWith("@nocoo/basalt") ? 0 : 1;
		const bBasalt = b.startsWith("@nocoo/basalt") ? 0 : 1;
		if (aBasalt !== bBasalt) {
			return aBasalt - bBasalt;
		}
		return a.localeCompare(b, "en");
	});
}

export function renderTemplateMarkdown(input: {
	template: TemplateMetadata;
	consumerSource: string;
	origin?: string;
}): string {
	const { template, consumerSource } = input;
	const baseOrigin = normalizeOrigin(input.origin ?? SITE_ORIGIN);
	const imports = extractPackageImports(consumerSource);
	const importLines =
		imports.length > 0 ? imports.map((pkg) => `- \`${pkg}\``).join("\n") : "- None";

	return [
		`# ${template.title}`,
		`> ${template.description}`,
		`URL: ${baseOrigin}/view/${template.slug} · Markdown: ${baseOrigin}/templates/${template.slug}.md`,
		[
			`- Category: \`${template.category}\``,
			`- Height: \`${template.heightRem}rem\``,
			`- Live preview: ${baseOrigin}/view/${template.slug}`,
		].join("\n"),
		"## Package Imports",
		importLines,
		"## Customization Notes",
		[
			"- Wrap your application root in `ThemeProvider` and `LinkProvider`, and import `@nocoo/basalt/styles` (or `@nocoo/basalt/styles/tailwind` / `@nocoo/basalt/styles/standalone`) plus `@nocoo/basalt/fonts.css`.",
			"- Replace local mock state and sample arrays with your application ViewModel or API queries.",
			"- Connect `Sidebar` and header actions to your router and permission checks.",
		].join("\n"),
		"## Source",
		fencedCode("tsx", consumerSource),
	].join("\n\n");
}

export function renderHomeMarkdown(origin = SITE_ORIGIN): string {
	const baseOrigin = normalizeOrigin(origin);
	return [
		`# ${SITE.name}`,
		`> ${SITE.description}`,
		`URL: ${baseOrigin}/ · Markdown: ${baseOrigin}/index.md`,
		"## Installation",
		fencedCode("sh", "bun add @nocoo/basalt"),
		"## Machine-Readable Documentation",
		[
			`- [llms.txt](${baseOrigin}/llms.txt) — Concise site & package index`,
			`- [agents.md](${baseOrigin}/agents.md) — Agent rules, entrypoints, and workflow guidelines`,
			`- [setup.md](${baseOrigin}/setup.md) — Installation, CSS tokens, Tailwind v4, and provider setup`,
			`- [ui.md](${baseOrigin}/ui.md) — All ${CATALOG.length} UI components grouped by category`,
			`- [templates.md](${baseOrigin}/templates.md) — All ${TEMPLATE_MANIFEST.length} full-page application templates`,
			`- [md-catalog.json](${baseOrigin}/md-catalog.json) — Machine-readable JSON index of all Markdown routes`,
		].join("\n"),
	].join("\n\n");
}

export function buildMarkdownCatalog(
	routes: readonly MarkdownCatalogRoute[],
	origin = SITE_ORIGIN,
) {
	return {
		generatedFromVersion: APP_VERSION,
		origin: normalizeOrigin(origin),
		total: routes.length,
		routes: [...routes],
	};
}
