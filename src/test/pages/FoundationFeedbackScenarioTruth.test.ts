import { describe, expect, it } from "vitest";
import forms from "@/pages/ui/catalog-content/families/forms";
import foundation from "@/pages/ui/catalog-content/families/foundation";
import { UI_EXAMPLES as LEGACY_UI_EXAMPLES } from "@/pages/ui/demos";
import { CATALOG_DOCS as LEGACY_CATALOG_DOCS } from "@/pages/ui/docs";

const UI_EXAMPLES = {
	...LEGACY_UI_EXAMPLES,
	...Object.fromEntries(
		Object.entries(foundation).map(([slug, content]) => [slug, content.examples]),
	),
	...Object.fromEntries(Object.entries(forms).map(([slug, content]) => [slug, content.examples])),
};
const CATALOG_DOCS = {
	...LEGACY_CATALOG_DOCS,
	...Object.fromEntries(Object.entries(foundation).map(([slug, content]) => [slug, content.docs])),
	...Object.fromEntries(Object.entries(forms).map(([slug, content]) => [slug, content.docs])),
};

import { BASALT_MARK_EXAMPLES } from "@/pages/ui/examples/basalt-mark";
import { LABEL_EXAMPLES } from "@/pages/ui/examples/label";
import { LINK_EXAMPLES } from "@/pages/ui/examples/link";
import { SEPARATOR_EXAMPLES } from "@/pages/ui/examples/separator";
import { THEME_TOGGLE_EXAMPLES } from "@/pages/ui/examples/theme-toggle";
import { TOOLTIP_EXAMPLES } from "@/pages/ui/examples/tooltip";

function scenario(slug: string, id: string) {
	const match = UI_EXAMPLES[slug]?.find((item) => item.id === id);
	expect(match, id).toBeDefined();
	if (!match) {
		throw new Error(`missing scenario ${id}`);
	}
	return match;
}

function importedNames(source: string): Set<string> {
	const names = new Set<string>();
	for (const block of source.matchAll(/import\s+\{([^}]+)\}\s+from/g)) {
		for (const part of block[1].split(",")) {
			const name = part
				.trim()
				.split(/\s+as\s+/)[0]
				?.trim();
			if (name) {
				names.add(name);
			}
		}
	}
	return names;
}

function expectUsageImportsCover(usage: string, names: string[]) {
	const imported = importedNames(usage);
	for (const name of names) {
		expect(imported.has(name), `${name} imported`).toBe(true);
		expect(usage, name).toContain(`<${name}`);
	}
}

describe("foundation feedback scenario truth", () => {
	it("keeps audited scenario ids and counts", () => {
		expect(UI_EXAMPLES.badge?.map((item) => item.id)).toEqual([
			"badge-primary-badges",
			"badge-other-color-variants",
			"badge-color-tokens",
			"badge-dot-badges",
			"badge-in-a-sentence",
			"badge-with-an-icon",
			"badge-linked-badge",
		]);
		expect(UI_EXAMPLES.banner?.map((item) => item.id)).toEqual([
			"banner-variants",
			"banner-with-icon",
			"banner-with-action",
			"banner-with-multiple-actions",
			"banner-compact-size",
			"banner-custom-content",
		]);
		expect(UI_EXAMPLES.breadcrumbs?.map((item) => item.id)).toEqual([
			"breadcrumbs-basic",
			"breadcrumbs-loading",
		]);
		expect(UI_EXAMPLES.button?.map((item) => item.id)).toEqual([
			"button-variants",
			"button-sizes",
			"button-with-icon",
			"button-icon-only",
			"button-loading-state",
			"button-disabled-state",
			"button-title",
			"button-link-as-button",
			"button-link-with-tooltip",
			"button-disabled-link",
		]);
		expect(UI_EXAMPLES["link-button"]?.map((item) => item.id)).toEqual([
			"link-button-default",
			"link-button-disabled-link",
		]);
		expect(UI_EXAMPLES["clipboard-text"]?.map((item) => item.id)).toEqual([
			"clipboard-text-short-text",
			"clipboard-text-api-key",
			"clipboard-text-copy-alternate-text",
			"clipboard-text-long-text",
		]);
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]?.map((item) => item.id)).toEqual(["basalt-mark-default"]);
		expect(UI_EXAMPLES.empty?.map((item) => item.id)).toEqual(["empty-basic", "empty-with-icon"]);
		expect(UI_EXAMPLES.label).toBe(LABEL_EXAMPLES);
		expect(UI_EXAMPLES.label?.map((item) => item.id)).toEqual([
			"label-default-label",
			"label-optional-field",
			"label-with-tooltip",
		]);
		expect(UI_EXAMPLES.separator).toBe(SEPARATOR_EXAMPLES);
		expect(UI_EXAMPLES.separator?.map((item) => item.id)).toEqual(["separator-horizontal"]);
		expect(UI_EXAMPLES.link).toBe(LINK_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([
			"layer-card-basic-card",
			"layer-card-surface-style-card",
			"layer-card-multiple-cards",
		]);
		expect(UI_EXAMPLES.link?.map((item) => item.id)).toEqual([
			"link-basic-link",
			"link-inline-in-paragraph",
			"link-external-links",
		]);
		expect(UI_EXAMPLES.loader?.map((item) => item.id)).toEqual([
			"loader-default-size",
			"loader-custom-size",
		]);
		expect(UI_EXAMPLES.meter?.map((item) => item.id)).toEqual([
			"meter-basic-meter",
			"meter-custom-value-display",
			"meter-hidden-value",
			"meter-full-meter",
			"meter-low-value",
		]);
		expect(UI_EXAMPLES["skeleton-line"]?.map((item) => item.id)).toEqual([
			"skeleton-line-default",
			"skeleton-line-width",
			"skeleton-line-height",
		]);
		expect(UI_EXAMPLES.toast?.map((item) => item.id)).toEqual([
			"toast-title-only",
			"toast-title-and-description",
			"toast-success-variant",
			"toast-error-variant",
			"toast-warning-variant",
			"toast-info-variant",
			"toast-close-button",
			"toast-hidden-close",
			"toast-custom-icon",
			"toast-hidden-icon",
		]);
		expect(UI_EXAMPLES.tooltip).toBe(TOOLTIP_EXAMPLES);
		expect(UI_EXAMPLES.tooltip?.map((item) => item.id)).toEqual([
			"tooltip-basic-tooltip",
			"tooltip-multiple-tooltips",
		]);
		expect(UI_EXAMPLES["theme-toggle"]).toBe(THEME_TOGGLE_EXAMPLES);
		expect(UI_EXAMPLES["theme-toggle"]?.map((item) => item.id)).toEqual(["theme-toggle-default"]);
		expect(UI_EXAMPLES["theme-provider"]?.map((item) => item.id)).toEqual([
			"theme-provider-default",
		]);
	});

	it("does not document empty as an empty shell", () => {
		const usage = CATALOG_DOCS.empty?.usage ?? "";
		expect(usage).not.toMatch(/<Empty\s*\/>/);
		expect(usage).toContain("title=");
		expect(usage).toContain("description=");
		expectUsageImportsCover(usage, ["Empty"]);
		expect(scenario("empty", "empty-basic").code).toContain("title=");
	});

	it("keeps clipboard text free of secret-looking values", () => {
		const usage = CATALOG_DOCS["clipboard-text"]?.usage ?? "";
		expect(usage).not.toContain("…");
		expect(usage).toContain("text=");
		expectUsageImportsCover(usage, ["ClipboardText"]);
		for (const example of UI_EXAMPLES["clipboard-text"] ?? []) {
			expect(example.code, example.id).not.toMatch(/sk-|secret/i);
		}
		expect(scenario("clipboard-text", "clipboard-text-api-key").code).toContain("copyText=");
		expect(scenario("clipboard-text", "clipboard-text-api-key").code).toContain("project-atlas");
	});

	it("requires breadcrumbs items in usage", () => {
		const usage = CATALOG_DOCS.breadcrumbs?.usage ?? "";
		expect(usage).not.toMatch(/<Breadcrumbs\s*\/>/);
		expect(usage).toContain("items=");
		expectUsageImportsCover(usage, ["Breadcrumbs"]);
	});

	it("wraps tooltip and link examples with their providers", () => {
		expectUsageImportsCover(CATALOG_DOCS.tooltip?.usage ?? "", [
			"TooltipProvider",
			"Tooltip",
			"TooltipTrigger",
			"TooltipContent",
			"Button",
		]);
		expectUsageImportsCover(CATALOG_DOCS.link?.usage ?? "", ["LinkProvider", "Link"]);
		expect(scenario("tooltip", "tooltip-basic-tooltip").code).toContain("TooltipProvider");
		expect(scenario("tooltip", "tooltip-multiple-tooltips").code).not.toContain("…");
		expect(scenario("tooltip", "tooltip-multiple-tooltips").code).toContain("TooltipProvider");
		expect(scenario("link", "link-basic-link").code).toContain("LinkProvider");
		expect(scenario("button", "button-link-with-tooltip").code).toContain("TooltipProvider");
		expect(scenario("button", "button-link-with-tooltip").code).toContain("LinkButton");
		const disabledLink = scenario("button", "button-disabled-link").code;
		expect(disabledLink).toContain('aria-disabled="true"');
		expect(disabledLink).toContain("tabIndex={-1}");
		expect(disabledLink).toContain('className="opacity-50"');
		expect(disabledLink).not.toContain("href=");
	});

	it("aligns skeleton line and loader codes with current sizes", () => {
		expect(scenario("skeleton-line", "skeleton-line-default").code).toContain("minWidth={40}");
		expect(scenario("skeleton-line", "skeleton-line-width").code).toContain("minWidth={80}");
		expect(scenario("skeleton-line", "skeleton-line-width").code).toContain("minWidth={40}");
		expect(scenario("skeleton-line", "skeleton-line-height").code).toContain('className="h-8"');
		expectUsageImportsCover(CATALOG_DOCS["skeleton-line"]?.usage ?? "", ["SkeletonLine"]);
		expect(scenario("loader", "loader-custom-size").code).toContain("size={16}");
		expect(scenario("loader", "loader-custom-size").code).toContain("size={24}");
		expect(scenario("loader", "loader-custom-size").code).toContain("size={32}");
	});

	it("shows toast triggers instead of bare toast calls", () => {
		const usage = CATALOG_DOCS.toast?.usage ?? "";
		expectUsageImportsCover(usage, ["Button"]);
		expect(importedNames(usage).has("toast")).toBe(true);
		expect(usage).toContain("onClick=");
		for (const example of UI_EXAMPLES.toast ?? []) {
			expect(example.code, example.id).toContain("<Button");
			expect(example.code, example.id).toContain("onClick=");
			expect(example.code, example.id).toContain("toast");
		}
	});

	it("keeps banner custom content class and meter label", () => {
		expect(scenario("banner", "banner-custom-content").code).toContain("text-inherit");
		expectUsageImportsCover(CATALOG_DOCS.banner?.usage ?? "", ["Banner", "Info"]);
		expectUsageImportsCover(CATALOG_DOCS.meter?.usage ?? "", ["Meter"]);
		expect(CATALOG_DOCS.meter?.usage).toContain("label=");
	});

	it("does not expand basalt mark beyond the current mark", () => {
		expect(UI_EXAMPLES["basalt-mark"]).toBe(BASALT_MARK_EXAMPLES);
		expect(UI_EXAMPLES["basalt-mark"]).toHaveLength(1);
		const example = scenario("basalt-mark", "basalt-mark-default");
		expect(example.title).toBe("Default");
		expect(example.code).toContain("export default function Example");
		expect(example.code).toContain("@nocoo/basalt/components/basalt-mark");
		expect(example.code).toContain("<BasaltMark />");
		expect(example.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
		expect(CATALOG_DOCS["basalt-mark"]?.description).toBe("Basalt mark.");
		expect(CATALOG_DOCS["basalt-mark"]?.variants).toEqual([]);
		expect(CATALOG_DOCS["basalt-mark"]?.api).toEqual([
			{
				name: "BasaltMark",
				props: [
					{
						name: "className",
						type: "string",
						required: false,
						description: "Additional classes for the mark.",
					},
				],
			},
		]);
		expect(CATALOG_DOCS["basalt-mark"]?.usage).toContain("<BasaltMark />");
		expect(CATALOG_DOCS["basalt-mark"]?.usage).toContain("@nocoo/basalt/components/basalt-mark");
		expect(CATALOG_DOCS["basalt-mark"]?.provenance).toEqual({
			owner: "nocoo",
			repo: "pew",
			ref: "97a890fabe6e",
			file: "packages/web/src/components",
		});
	});
});
