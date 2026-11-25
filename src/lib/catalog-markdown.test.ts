import { describe, expect, it } from "vitest";
import { TEMPLATE_MANIFEST } from "../models/template-manifest";
import { CATALOG, CATALOG_BY_SLUG, type CatalogEntry } from "../pages/ui/catalog";
import { CATALOG_CATEGORIES, type CatalogCategory } from "../pages/ui/catalog-categories";
import type { CatalogScenario } from "../pages/ui/catalog-scenario";
import type { CatalogApiSurface, CatalogDocs } from "../pages/ui/catalog-source";
import {
	buildMarkdownCatalog,
	catalogApiCopyLines,
	type MarkdownCatalogRoute,
	renderCategoryOverviewMarkdown,
	renderComponentMarkdown,
	renderHomeMarkdown,
	renderTemplateMarkdown,
	renderTemplatesIndexMarkdown,
	renderUiIndexMarkdown,
} from "./catalog-markdown";
import { SITE_ORIGIN } from "./site";
import { APP_VERSION } from "./version";

function requireEntry(slug: string): CatalogEntry {
	const entry = CATALOG_BY_SLUG.get(slug);
	if (!entry) {
		throw new Error(`Missing catalog fixture entry for ${slug}`);
	}
	return entry;
}

const DUMMY_RENDER = () => null;

function makeScenario(id: string, title: string, code: string): CatalogScenario {
	return { id, title, code, render: DUMMY_RENDER };
}

describe("catalogApiCopyLines", () => {
	it("formats callable signatures with parameters, returns, and options", () => {
		const api: CatalogApiSurface[] = [
			{
				name: "toast",
				callSignature: "toast(message: string, options?: ToastOptions): string",
				description: "Dispatches a transient notification.",
				parameters: [
					{ name: "message", type: "string", required: true, description: "Toast body" },
					{ name: "options", type: "ToastOptions", required: false },
				],
				returns: { type: "string", description: "Created toast id" },
				options: {
					name: "ToastOptions",
					props: [
						{ name: "duration", type: "number", required: true, default: "4000" },
						{ name: "tone", type: "string", description: "Visual tone" },
					],
				},
				props: [],
			},
			{
				name: "minimalCallable",
				callSignature: "minimalCallable(): void",
				returns: { type: "void" },
				props: [],
			},
		];

		const lines = catalogApiCopyLines(api);
		expect(lines).toEqual([
			"## API Reference",
			"### toast",
			"`toast(message: string, options?: ToastOptions): string`",
			"Dispatches a transient notification.",
			"Parameters:",
			"- message (string, required): Toast body",
			"- options (ToastOptions, optional): ",
			"Returns: `string`: Created toast id",
			"Options (ToastOptions):",
			"- duration (number, required, default 4000): ",
			"- tone (string, optional, default —): Visual tone",
			"### minimalCallable",
			"`minimalCallable(): void`",
			"Returns: `void`",
		]);
	});

	it("formats component props, typeParameters, empty props, and native-only surfaces", () => {
		const api: CatalogApiSurface[] = [
			{
				name: "DataTable",
				typeParameters: "TData extends object",
				props: [
					{ name: "data", type: "TData[]", required: true, description: "Rows to display" },
					{ name: "dense", type: "boolean", required: false, default: "false" },
					{ name: "caption", type: "string" },
				],
			},
			{
				name: "Table",
				props: [{ name: "className", type: "string" }],
			},
			{
				name: "EmptySurface",
				props: [],
			},
		];

		const lines = catalogApiCopyLines(api);
		expect(lines).toContain("Type parameters: `TData extends object`");
		expect(lines).toContain("- data (TData[], required, default —): Rows to display");
		expect(lines).toContain("- dense (boolean, optional, default false): ");
		expect(lines).toContain("- caption (string, default —): ");
		expect(lines).toContain(
			"Native element wrapper: inherits and forwards all standard HTMLTableElement attributes (including children); forwards ref to root.",
		);
		expect(lines).toContain("No component-specific props.");
	});
});

describe("renderComponentMarkdown", () => {
	const baseDocs: CatalogDocs = {
		description: "Triggers an action or submits a form.",
		usage:
			'import { Button } from "@nocoo/basalt";\n\nexport default function Demo() {\n\treturn <Button>Save</Button>;\n}',
		variants: ["solid", "outline"],
		api: [
			{
				name: "Button",
				props: [{ name: "variant", type: "string", required: false, default: '"solid"' }],
			},
		],
		implementationSource: {
			owner: "nocoo",
			repo: "basalt",
			ref: "main",
			file: "packages/basalt/src/components/button.tsx",
			hash: "abc123",
		},
	};

	it("renders full markdown with barrel import, catalog slug guide target, and examples", () => {
		const entry = requireEntry("button");
		const md = renderComponentMarkdown({
			entry,
			docs: baseDocs,
			examples: [
				makeScenario("button-default", "Default", "<Button>Save</Button>"),
				makeScenario("button-fenced", "Code Fence", "const note = '```tsx```';"),
			],
			guide: {
				useWhen: "Committing an operation or form action.",
				avoidWhen: "Navigating to another route.",
				instead: "link-button",
				placement: "Form footers and toolbars.",
			},
			origin: "https://example.test/",
		});

		expect(md).toContain("# Button");
		expect(md).toContain("> Triggers an action or submits a form.");
		expect(md).toContain(
			"URL: https://example.test/ui/button · Markdown: https://example.test/ui/button.md",
		);
		expect(md).toContain("## When to use");
		expect(md).toContain(
			"- Avoid when: Navigating to another route. Use [LinkButton](https://example.test/ui/link-button.md) instead.",
		);
		expect(md).toContain("bun add @nocoo/basalt");
		expect(md).toContain('import { Button } from "@nocoo/basalt";');
		expect(md).toContain('import { Button } from "@nocoo/basalt/components/button";');
		expect(md).toContain("````tsx\nconst note = '```tsx```';\n````");
		expect(md).toContain("## API Reference");
		expect(md).toContain("## Implementation");
	});

	it("renders granular-only components, plain-text instead targets, and omitted guide", () => {
		const granularEntry = requireEntry("link-button");
		const withTextInstead = renderComponentMarkdown({
			entry: granularEntry,
			docs: baseDocs,
			examples: [
				makeScenario("link-button-default", "Default", "<LinkButton href='/'>Go</LinkButton>"),
			],
			guide: {
				useWhen: "Navigation styled as a button.",
				avoidWhen: "Simple inline sentence links.",
				instead: "native <a> or Link",
				placement: "Headers and empty states.",
			},
		});
		expect(withTextInstead).not.toContain('import { LinkButton } from "@nocoo/basalt";');
		expect(withTextInstead).toContain(
			'import { LinkButton } from "@nocoo/basalt/components/button";',
		);
		expect(withTextInstead).toContain("Use native <a> or Link instead.");
		expect(withTextInstead).toContain(`URL: ${SITE_ORIGIN}/ui/link-button`);

		const withoutGuide = renderComponentMarkdown({
			entry: granularEntry,
			docs: baseDocs,
			examples: [],
		});
		expect(withoutGuide).not.toContain("## When to use");

		const noInstead = renderComponentMarkdown({
			entry: granularEntry,
			docs: baseDocs,
			examples: [],
			guide: {
				useWhen: "Navigation styled as a button.",
				avoidWhen: "In-page mutations.",
				placement: "Toolbars.",
			},
		});
		expect(noInstead).toContain("- Avoid when: In-page mutations.\n- Placement: Toolbars.");
	});
});

describe("category, index, home, and template renderers", () => {
	it("renders category overview markdown and rejects unknown categories", () => {
		for (const category of CATALOG_CATEGORIES) {
			const md = renderCategoryOverviewMarkdown(category.id);
			expect(md).toContain(`# ${category.label}`);
			expect(md).toContain("## Rationale");
			expect(md).toContain("## Best Practices");
			expect(md).toContain("## Components");
		}
		expect(() => renderCategoryOverviewMarkdown("unknown" as CatalogCategory)).toThrow(
			"Unknown catalog category: unknown",
		);
	});

	it("renders UI index grouped by all categories with optional guide summaries", () => {
		const md = renderUiIndexMarkdown({
			button: {
				useWhen: "Triggering immediate operations.",
				avoidWhen: "Navigating between pages.",
				placement: "Toolbars.",
			},
		});
		expect(md).toContain(`Browse all ${CATALOG.length} Basalt components`);
		expect(md).toContain(
			`[Button](${SITE_ORIGIN}/ui/button.md) (\`@nocoo/basalt/components/button\`) — Triggering immediate operations.`,
		);
		expect(md).toContain(`([Category overview](${SITE_ORIGIN}/ui/overview/action.md))`);
	});

	it("renders templates index and template markdown with extracted package imports", () => {
		const indexMd = renderTemplatesIndexMarkdown();
		expect(indexMd).toContain(
			`Browse all ${TEMPLATE_MANIFEST.length} full-page application templates`,
		);
		for (const template of TEMPLATE_MANIFEST) {
			expect(indexMd).toContain(`${SITE_ORIGIN}/templates/${template.slug}`);
			expect(indexMd).toContain(`${SITE_ORIGIN}/view/${template.slug}`);
			expect(indexMd).toContain(`${SITE_ORIGIN}/templates/${template.slug}.md`);
		}

		const sampleTemplate = TEMPLATE_MANIFEST[0];
		const templateMd = renderTemplateMarkdown({
			template: sampleTemplate,
			consumerSource: [
				'import "virtual:side-effect";',
				'import { useState } from "react";',
				'import {\n\tButton,\n} from "@nocoo/basalt/components/button";',
				'import { Badge } from "@nocoo/basalt/components/badge";',
				'import { Bot } from "lucide-react";',
				"",
				"export default function Demo() { return <Button />; }",
			].join("\n"),
		});
		expect(templateMd).toContain(`# ${sampleTemplate.title}`);
		expect(templateMd).toContain(`${SITE_ORIGIN}/templates/${sampleTemplate.slug}`);
		expect(templateMd).toContain("## Package Imports");
		expect(templateMd).toContain("## What's inside");
		expect(templateMd).toContain("## Make it yours");
		expect(templateMd).toContain("- `@nocoo/basalt/components/badge`");
		expect(templateMd).toContain("- `@nocoo/basalt/components/button`");
		expect(templateMd).toContain("- `lucide-react`");
		expect(templateMd).toContain("- `react`");
		expect(templateMd).toContain("- `virtual:side-effect`");

		const emptyImportsMd = renderTemplateMarkdown({
			template: sampleTemplate,
			consumerSource: "export default function Plain() { return null; }",
		});
		expect(emptyImportsMd).toContain("## Package Imports\n\n- None");
	});

	it("renders home markdown and builds md-catalog.json payload", () => {
		const homeMd = renderHomeMarkdown("https://basaltui.com/");
		expect(homeMd).toContain("# Basalt");
		expect(homeMd).toContain("https://basaltui.com/llms.txt");
		expect(homeMd).toContain("https://basaltui.com/agents.md");
		expect(homeMd).toContain("https://basaltui.com/setup.md");
		expect(homeMd).toContain("https://basaltui.com/ui.md");
		expect(homeMd).toContain("https://basaltui.com/templates.md");
		expect(homeMd).toContain("https://basaltui.com/md-catalog.json");

		const routes: MarkdownCatalogRoute[] = [
			{
				path: "/index.md",
				url: `${SITE_ORIGIN}/index.md`,
				kind: "home",
				title: "Basalt",
				description: "Home",
			},
		];
		const catalog = buildMarkdownCatalog(routes);
		expect(catalog).toEqual({
			generatedFromVersion: APP_VERSION,
			origin: SITE_ORIGIN,
			total: 1,
			routes,
		});
	});
});
