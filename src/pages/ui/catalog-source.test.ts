import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG_BY_SLUG } from "./catalog";
import {
	catalogDocsWithImplementation,
	githubSourceHref,
	githubSourceLabel,
	implementationFileFor,
	implementationSourceFor,
	provenanceFromLegacy,
} from "./catalog-source";
import { CATALOG_DOCS } from "./docs";
import { CATALOG_API } from "./generated/catalog-api";

function entry(slug: string) {
	const found = CATALOG_BY_SLUG.get(slug);
	if (!found) {
		throw new Error(`missing catalog entry ${slug}`);
	}
	return found;
}

describe("catalog source contract", () => {
	it("builds github urls from explicit owner, repo, ref, and file", () => {
		expect(
			githubSourceHref({
				owner: "cloudflare",
				repo: "kumo",
				ref: "1159868dfe32",
				file: "packages/kumo/src/components/dialog/dialog.tsx",
			}),
		).toBe(
			"https://github.com/cloudflare/kumo/blob/1159868dfe32/packages/kumo/src/components/dialog/dialog.tsx",
		);
		expect(
			githubSourceHref({
				owner: "nocoo",
				repo: "pew",
				ref: "97a890fabe6e",
				file: "packages/web/src/components/ui/button.tsx",
			}),
		).toBe(
			"https://github.com/nocoo/pew/blob/97a890fabe6e/packages/web/src/components/ui/button.tsx",
		);
	});

	it("does not infer github owner from the repo name", () => {
		const href = githubSourceHref({
			owner: "cloudflare",
			repo: "kumo",
			ref: "main",
			file: "README.md",
		});
		expect(href).not.toContain("github.com/nocoo/kumo");
		expect(href).toBe("https://github.com/cloudflare/kumo/blob/main/README.md");
	});

	it("labels sources with owner, repo, and ref", () => {
		expect(
			githubSourceLabel({
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: "packages/basalt/src/components/button.tsx",
			}),
		).toBe("nocoo/basalt@main");
	});

	it("assigns cloudflare to kumo provenance and nocoo to personal repos", () => {
		expect(
			provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/utils/link-provider.tsx",
			}),
		).toEqual({
			owner: "cloudflare",
			repo: "kumo",
			ref: "1159868dfe32",
			file: "packages/kumo/src/utils/link-provider.tsx",
		});
		expect(
			provenanceFromLegacy({
				repo: "pew",
				sha: "97a890fabe6e",
				file: "packages/web/src/components/ui/button.tsx",
			}),
		).toEqual({
			owner: "nocoo",
			repo: "pew",
			ref: "97a890fabe6e",
			file: "packages/web/src/components/ui/button.tsx",
		});
		expect(
			provenanceFromLegacy({
				repo: "basalt",
				sha: "2727ae6a8d3f",
				file: "src/components/ThemeToggle.tsx",
			}).owner,
		).toBe("nocoo");
		expect(
			provenanceFromLegacy({
				repo: "signoff.now",
				sha: "92033c89d807",
				file: "apps/web/src/components/Field.tsx",
			}).owner,
		).toBe("nocoo");
	});

	it("derives implementation files from catalog import paths", () => {
		expect(implementationFileFor(entry("button"))).toBe(
			"packages/basalt/src/components/button.tsx",
		);
		expect(implementationFileFor(entry("theme-provider"))).toBe(
			"packages/basalt/src/providers/theme.tsx",
		);
		expect(implementationFileFor(entry("bar"))).toBe("packages/basalt/src/charts/bar.tsx");
	});

	it("maps shared and renamed implementation files", () => {
		expect(implementationFileFor(entry("page-header"))).toBe(
			"packages/basalt/src/components/app-header.tsx",
		);
		expect(implementationFileFor(entry("link-button"))).toBe(
			"packages/basalt/src/components/button.tsx",
		);
		expect(CATALOG_DOCS["link-button"]?.api).toEqual(CATALOG_API["link-button"]);
		expect(CATALOG_API["link-button"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"icon",
		]);
		expect(implementationFileFor(entry("text"))).toBe("packages/basalt/src/components/text.tsx");
		expect(CATALOG_DOCS.text?.api).toEqual(CATALOG_API.text);
		expect(CATALOG_API.text?.[0]?.props.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(implementationFileFor(entry("label"))).toBe("packages/basalt/src/components/label.tsx");
		expect(CATALOG_DOCS.label?.api).toEqual(CATALOG_API.label);
		expect(CATALOG_API.label?.[0]?.props.map((prop) => prop.name)).toEqual([
			"showOptional",
			"tooltip",
		]);
		expect(implementationFileFor(entry("separator"))).toBe(
			"packages/basalt/src/components/separator.tsx",
		);
		expect(CATALOG_DOCS.separator?.api).toEqual(CATALOG_API.separator);
		expect(CATALOG_API.separator?.[0]?.props.map((prop) => prop.name)).toEqual([
			"orientation",
			"decorative",
		]);
		expect(implementationFileFor(entry("link"))).toBe("packages/basalt/src/components/link.tsx");
		expect(CATALOG_DOCS.link?.api).toEqual(CATALOG_API.link);
		expect(CATALOG_API.link?.[0]?.props.map((prop) => prop.name)).toEqual(["href"]);
		expect(implementationFileFor(entry("tooltip"))).toBe(
			"packages/basalt/src/components/tooltip.tsx",
		);
		expect(CATALOG_DOCS.tooltip?.api).toEqual(CATALOG_API.tooltip);
		expect(CATALOG_API.tooltip?.[0]?.props.map((prop) => prop.name)).toEqual(["delayDuration"]);
		expect(implementationFileFor(entry("theme-toggle"))).toBe(
			"packages/basalt/src/components/theme-toggle.tsx",
		);
		expect(CATALOG_DOCS["theme-toggle"]?.api).toEqual(CATALOG_API["theme-toggle"]);
		expect(CATALOG_API["theme-toggle"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"aria-label",
		]);
		expect(implementationFileFor(entry("layer-card"))).toBe(
			"packages/basalt/src/components/layer-card.tsx",
		);
		expect(CATALOG_DOCS["layer-card"]?.api).toEqual(CATALOG_API["layer-card"]);
		expect(CATALOG_API["layer-card"]?.[0]?.props.map((prop) => prop.name)).toEqual(["className"]);
		expect(implementationFileFor(entry("basalt-mark"))).toBe(
			"packages/basalt/src/components/basalt-mark.tsx",
		);
		expect(CATALOG_DOCS["basalt-mark"]?.api).toEqual(CATALOG_API["basalt-mark"]);
		expect(CATALOG_API["basalt-mark"]?.[0]?.props.map((prop) => prop.name)).toEqual(["className"]);
		expect(implementationFileFor(entry("field"))).toBe("packages/basalt/src/components/field.tsx");
		expect(CATALOG_DOCS.field?.api).toEqual(CATALOG_API.field);
		expect(CATALOG_API.field?.[0]?.props.map((prop) => prop.name)).toEqual([
			"label",
			"htmlFor",
			"hint",
			"error",
			"className",
			"children",
		]);
		expect(implementationFileFor(entry("input"))).toBe("packages/basalt/src/components/input.tsx");
		expect(CATALOG_DOCS.input?.api).toEqual(CATALOG_API.input);
		expect(CATALOG_API.input?.[0]?.props.map((prop) => prop.name)).toEqual(["type"]);
		expect(implementationFileFor(entry("input-area"))).toBe(
			"packages/basalt/src/components/input-area.tsx",
		);
		expect(CATALOG_DOCS["input-area"]?.api).toEqual(CATALOG_API["input-area"]);
		expect(CATALOG_API["input-area"]?.[0]?.props.map((prop) => prop.name)).toEqual(["rows"]);
		expect(implementationFileFor(entry("code-block"))).toBe(
			"packages/basalt/src/components/code.tsx",
		);
	});

	it("preserves generated required semantics on catalog docs", () => {
		const docs = catalogDocsWithImplementation({
			button: {
				description: "Primary actions, including loading and icon slots.",
				usage: 'import { Button } from "@nocoo/basalt/components/button";',
				variants: [],
				api: [
					{
						name: "Button",
						props: [
							{
								name: "loading",
								type: "boolean",
								required: false,
								description: "Shows a spinner.",
							},
						],
					},
				],
			},
		});
		expect(docs.button?.api).toEqual([
			{
				name: "Button",
				props: [
					{
						name: "loading",
						type: "boolean",
						required: false,
						description: "Shows a spinner.",
					},
				],
			},
		]);
		expect(docs.button).not.toHaveProperty("props");
	});

	it("does not keep a legacy CatalogDocs.props field", () => {
		const source = readFileSync(path.join(process.cwd(), "src/pages/ui/catalog-source.ts"), "utf8");
		expect(source).toContain("api: CatalogApiSurface[]");
		expect(source).not.toMatch(/props:\s*\{/);
		for (const [slug, docs] of Object.entries(CATALOG_DOCS)) {
			expect(docs, slug).not.toHaveProperty("props");
			expect(Array.isArray(docs.api), slug).toBe(true);
			expect(docs.api.length, slug).toBeGreaterThan(0);
			const names = docs.api.map((surface) => surface.name);
			expect(new Set(names).size, slug).toBe(names.length);
			for (const surface of docs.api) {
				expect(surface.name.length, slug).toBeGreaterThan(0);
				expect(Array.isArray(surface.props), slug).toBe(true);
			}
		}
		const generated = [
			"button",
			"link-button",
			"text",
			"label",
			"separator",
			"link",
			"tooltip",
			"theme-toggle",
			"layer-card",
			"basalt-mark",
			"field",
			"input",
			"input-area",
		];
		for (const slug of generated) {
			expect(CATALOG_DOCS[slug]?.api).toBe(CATALOG_API[slug as keyof typeof CATALOG_API]);
		}
	});

	it("always points implementation source at nocoo/basalt@main", () => {
		expect(implementationSourceFor(entry("dialog"))).toEqual({
			owner: "nocoo",
			repo: "basalt",
			ref: "main",
			file: "packages/basalt/src/components/dialog.tsx",
		});
	});
});
