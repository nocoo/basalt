import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG_BY_SLUG } from "./catalog";
import forms from "./catalog-content/families/forms";
import foundation from "./catalog-content/families/foundation";
import overlay from "./catalog-content/families/overlay";
import { loadCatalogContentRecord } from "./catalog-content-registry";
import {
	catalogDocsWithImplementation,
	githubSourceHref,
	githubSourceLabel,
	implementationFileFor,
	implementationSourceFor,
	provenanceFromLegacy,
} from "./catalog-source";
import { CATALOG_API } from "./generated/catalog-api";

const catalogContent = await loadCatalogContentRecord();
const CATALOG_DOCS = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.docs]),
);

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
			"packages/basalt/src/components/page-header.tsx",
		);
		expect(CATALOG_API["page-header"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"title",
			"description",
			"eyebrow",
			"breadcrumbs",
			"actions",
		]);
		expect(implementationFileFor(entry("stat-strip"))).toBe(
			"packages/basalt/src/components/stat-strip.tsx",
		);
		expect(CATALOG_API["stat-strip"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"className",
			"items",
			"loading",
		]);
		expect(implementationFileFor(entry("confirm-dialog"))).toBe(
			"packages/basalt/src/components/confirm-dialog.tsx",
		);
		expect(CATALOG_API["confirm-dialog"]?.map((surface) => surface.name)).toEqual([
			"ConfirmDialog",
			"useConfirm",
		]);
		expect(implementationFileFor(entry("table-pager"))).toBe(
			"packages/basalt/src/components/table-pager.tsx",
		);
		expect(CATALOG_API["table-pager"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"page",
			"pageSize",
			"totalCount",
			"onPageChange",
			"disabled",
			"formatRange",
			"className",
		]);
		expect(implementationFileFor(entry("link-button"))).toBe(
			"packages/basalt/src/components/button.tsx",
		);
		expect(foundation["link-button"]?.docs.api).toEqual(CATALOG_API["link-button"]);
		expect(CATALOG_API["link-button"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"icon",
		]);
		expect(implementationFileFor(entry("text"))).toBe("packages/basalt/src/components/text.tsx");
		expect(foundation.text?.docs.api).toEqual(CATALOG_API.text);
		expect(CATALOG_API.text?.[0]?.props.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(implementationFileFor(entry("label"))).toBe("packages/basalt/src/components/label.tsx");
		expect(foundation.label?.docs.api).toEqual(CATALOG_API.label);
		expect(CATALOG_API.label?.[0]?.props.map((prop) => prop.name)).toEqual([
			"showOptional",
			"tooltip",
		]);
		expect(implementationFileFor(entry("separator"))).toBe(
			"packages/basalt/src/components/separator.tsx",
		);
		expect(foundation.separator?.docs.api).toEqual(CATALOG_API.separator);
		expect(CATALOG_API.separator?.[0]?.props.map((prop) => prop.name)).toEqual([
			"orientation",
			"decorative",
		]);
		expect(implementationFileFor(entry("link"))).toBe("packages/basalt/src/components/link.tsx");
		expect(foundation.link?.docs.api).toEqual(CATALOG_API.link);
		expect(CATALOG_API.link?.[0]?.props.map((prop) => prop.name)).toEqual(["href"]);
		expect(implementationFileFor(entry("tooltip"))).toBe(
			"packages/basalt/src/components/tooltip.tsx",
		);
		expect(overlay.tooltip?.docs.api).toEqual(CATALOG_API.tooltip);
		expect(CATALOG_API.tooltip?.[0]?.props.map((prop) => prop.name)).toEqual(["delayDuration"]);
		expect(implementationFileFor(entry("theme-toggle"))).toBe(
			"packages/basalt/src/components/theme-toggle.tsx",
		);
		expect(foundation["theme-toggle"]?.docs.api).toEqual(CATALOG_API["theme-toggle"]);
		expect(CATALOG_API["theme-toggle"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"aria-label",
		]);
		expect(implementationFileFor(entry("layer-card"))).toBe(
			"packages/basalt/src/components/layer-card.tsx",
		);
		expect(foundation["layer-card"]?.docs.api).toEqual(CATALOG_API["layer-card"]);
		expect(CATALOG_API["layer-card"]?.map((surface) => surface.name)).toEqual([
			"LayerCard",
			"LayerCard.Primary",
			"LayerCard.Secondary",
			"LayerCard.Header",
			"LayerCard.Body",
			"LayerCard.Footer",
			"LayerCard.Loading",
			"LayerCard.Empty",
		]);
		expect(CATALOG_API["layer-card"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"className",
			"padding",
		]);
		expect(implementationFileFor(entry("basalt-mark"))).toBe(
			"packages/basalt/src/components/basalt-mark.tsx",
		);
		expect(foundation["basalt-mark"]?.docs.api).toEqual(CATALOG_API["basalt-mark"]);
		expect(CATALOG_API["basalt-mark"]?.[0]?.props.map((prop) => prop.name)).toEqual(["className"]);
		expect(implementationFileFor(entry("field"))).toBe("packages/basalt/src/components/field.tsx");
		expect(forms.field?.docs.api).toEqual(CATALOG_API.field);
		expect(CATALOG_API.field?.[0]?.props.map((prop) => prop.name)).toEqual([
			"label",
			"htmlFor",
			"hint",
			"error",
			"required",
			"labelTooltip",
			"className",
			"children",
		]);
		expect(implementationFileFor(entry("input"))).toBe("packages/basalt/src/components/input.tsx");
		expect(forms.input?.docs.api).toEqual(CATALOG_API.input);
		expect(CATALOG_API.input?.[0]?.props.map((prop) => prop.name)).toEqual([
			"type",
			"size",
			"passwordManagerIgnore",
		]);
		expect(implementationFileFor(entry("input-area"))).toBe(
			"packages/basalt/src/components/input-area.tsx",
		);
		expect(forms["input-area"]?.docs.api).toEqual(CATALOG_API["input-area"]);
		expect(CATALOG_API["input-area"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"rows",
			"size",
			"passwordManagerIgnore",
		]);
		expect(implementationFileFor(entry("sensitive-input"))).toBe(
			"packages/basalt/src/components/sensitive-input.tsx",
		);
		expect(forms["sensitive-input"]?.docs.api).toEqual(CATALOG_API["sensitive-input"]);
		expect(CATALOG_API["sensitive-input"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"revealLabel",
			"hideLabel",
		]);
		expect(implementationFileFor(entry("checkbox"))).toBe(
			"packages/basalt/src/components/checkbox.tsx",
		);
		expect(forms.checkbox?.docs.api).toEqual(CATALOG_API.checkbox);
		expect(CATALOG_API.checkbox?.[0]?.props.map((prop) => prop.name)).toEqual(["checked"]);
		expect(implementationFileFor(entry("radio"))).toBe("packages/basalt/src/components/radio.tsx");
		expect(forms.radio?.docs.api).toEqual(CATALOG_API.radio);
		expect(CATALOG_API.radio?.[0]?.props.map((prop) => prop.name)).toEqual(["value"]);
		expect(implementationFileFor(entry("switch"))).toBe(
			"packages/basalt/src/components/switch.tsx",
		);
		expect(forms.switch?.docs.api).toEqual(CATALOG_API.switch);
		expect(CATALOG_API.switch?.[0]?.props.map((prop) => prop.name)).toEqual(["checked", "size"]);
		expect(implementationFileFor(entry("select"))).toBe(
			"packages/basalt/src/components/select.tsx",
		);
		expect(forms.select?.docs.api).toEqual(CATALOG_API.select);
		expect(CATALOG_API.select?.map((surface) => surface.name)).toEqual([
			"Select",
			"SelectTrigger",
			"SelectValue",
			"SelectContent",
			"SelectGroup",
			"SelectItem",
		]);
		expect(CATALOG_API.select?.[0]?.props.map((prop) => prop.name)).toEqual(["value"]);
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
		expect(overlay.tooltip?.docs.api).toBe(CATALOG_API.tooltip);
		for (const slug of [
			"button",
			"link-button",
			"text",
			"label",
			"separator",
			"link",
			"theme-toggle",
			"layer-card",
			"basalt-mark",
		]) {
			expect(foundation[slug]?.docs.api).toBe(CATALOG_API[slug as keyof typeof CATALOG_API]);
		}
		for (const slug of [
			"field",
			"input",
			"input-area",
			"input-group",
			"sensitive-input",
			"checkbox",
			"radio",
			"switch",
			"select",
		]) {
			expect(forms[slug]?.docs.api).toBe(CATALOG_API[slug as keyof typeof CATALOG_API]);
		}
		expect(forms["input-group"]?.docs.api).toHaveLength(5);
		expect(forms["input-group"]?.docs.api.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
		expect(forms["sensitive-input"]?.docs.api).toHaveLength(1);
		expect(forms["sensitive-input"]?.docs.api.map((surface) => surface.name)).toEqual([
			"SensitiveInput",
		]);
		expect(forms.checkbox?.docs.api).toHaveLength(1);
		expect(forms.checkbox?.docs.api.map((surface) => surface.name)).toEqual(["Checkbox"]);
		expect(forms.radio?.docs.api).toHaveLength(1);
		expect(forms.radio?.docs.api.map((surface) => surface.name)).toEqual(["Radio"]);
		expect(forms.switch?.docs.api).toHaveLength(1);
		expect(forms.switch?.docs.api.map((surface) => surface.name)).toEqual(["Switch"]);
		expect(forms.select?.docs.api).toHaveLength(6);
		expect(forms.select?.docs.api.map((surface) => surface.name)).toEqual([
			"Select",
			"SelectTrigger",
			"SelectValue",
			"SelectContent",
			"SelectGroup",
			"SelectItem",
		]);
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
