import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import feedback from "@/pages/ui/catalog-content/families/feedback";
import forms from "@/pages/ui/catalog-content/families/forms";
import foundation from "@/pages/ui/catalog-content/families/foundation";
import overlay from "@/pages/ui/catalog-content/families/overlay";
import { EXTRA_DOCS, EXTRA_EXAMPLES } from "@/pages/ui/catalog-ready";
import { UI_EXAMPLES as LEGACY_UI_EXAMPLES } from "@/pages/ui/demos";
import { CATALOG_DOCS as LEGACY_CATALOG_DOCS } from "@/pages/ui/docs";

const UI_EXAMPLES = {
	...LEGACY_UI_EXAMPLES,
	...Object.fromEntries(
		Object.entries(foundation).map(([slug, content]) => [slug, content.examples]),
	),
	...Object.fromEntries(Object.entries(forms).map(([slug, content]) => [slug, content.examples])),
	...Object.fromEntries(Object.entries(overlay).map(([slug, content]) => [slug, content.examples])),
	...Object.fromEntries(
		Object.entries(feedback).map(([slug, content]) => [slug, content.examples]),
	),
};
const CATALOG_DOCS = {
	...LEGACY_CATALOG_DOCS,
	...Object.fromEntries(Object.entries(foundation).map(([slug, content]) => [slug, content.docs])),
	...Object.fromEntries(Object.entries(forms).map(([slug, content]) => [slug, content.docs])),
	...Object.fromEntries(Object.entries(overlay).map(([slug, content]) => [slug, content.docs])),
	...Object.fromEntries(Object.entries(feedback).map(([slug, content]) => [slug, content.docs])),
};

import { LAYER_CARD_EXAMPLES } from "@/pages/ui/examples/layer-card";
import { SELECT_EXAMPLES } from "@/pages/ui/examples/select";
import { TEXT_EXAMPLES } from "@/pages/ui/examples/text";

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

describe("content scenario truth", () => {
	it("keeps audited scenario ids and counts", () => {
		expect(UI_EXAMPLES.text).toBe(TEXT_EXAMPLES);
		expect(UI_EXAMPLES.text?.map((item) => item.id)).toEqual(["text-sizes", "text-muted-tone"]);
		expect(UI_EXAMPLES.code?.map((item) => item.id)).toEqual(["code-typescript", "code-react"]);
		expect(UI_EXAMPLES["code-block"]?.map((item) => item.id)).toEqual(["code-block-basic"]);
		expect(UI_EXAMPLES.autocomplete?.map((item) => item.id)).toEqual(["autocomplete-default"]);
		expect(UI_EXAMPLES.select).toBe(SELECT_EXAMPLES);
		expect(UI_EXAMPLES.select?.map((item) => item.id)).toEqual([
			"select-basic",
			"select-placeholder",
			"select-disabled-options",
		]);
		expect(EXTRA_DOCS.select).toBeUndefined();
		expect(EXTRA_EXAMPLES.select).toBeUndefined();
		expect(UI_EXAMPLES.grid?.map((item) => item.id)).toEqual(["grid-grid"]);
		expect(UI_EXAMPLES.flow?.map((item) => item.id)).toEqual(["flow-sequential-flow"]);
		expect(UI_EXAMPLES["command-palette"]?.map((item) => item.id)).toEqual([
			"command-palette-with-grouped-items",
			"command-palette-simple-flat-list",
		]);
		expect(UI_EXAMPLES.sidebar?.map((item) => item.id)).toEqual(["sidebar-default"]);
		expect(UI_EXAMPLES["layer-card"]).toBe(LAYER_CARD_EXAMPLES);
		expect(UI_EXAMPLES["layer-card"]?.map((item) => item.id)).toEqual([
			"layer-card-basic-card",
			"layer-card-surface-style-card",
			"layer-card-multiple-cards",
		]);
	});

	it("keeps layer-card copyable code aligned with preview wrappers", () => {
		const basic = scenario("layer-card", "layer-card-basic-card");
		expect(basic.code).toContain('className="w-[250px]"');
		expect(basic.code).toContain("Next Steps");
		expect(basic.code).toContain("Hello");
		expect(basic.code).toContain("export default");
		const surface = scenario("layer-card", "layer-card-surface-style-card");
		expect(surface.code).toContain('className="w-[250px] p-4"');
		expect(surface.code).toContain("Quick start guide");
		const multiple = scenario("layer-card", "layer-card-multiple-cards");
		expect(multiple.code).toContain('className="flex w-full gap-4"');
		expect(multiple.code).toContain('className="w-[200px]"');
		expect(multiple.code).toContain("Browse all components");
		expect(multiple.code).toContain("View code examples");
	});

	it("describes text-sizes as sizes instead of semantic html", () => {
		const example = scenario("text", "text-sizes");
		expect(example.title).toBe("Sizes");
		expect(example.title).not.toMatch(/semantic html/i);
		expect(example.code).toContain('size="xl"');
		expect(example.code).toContain('size="xs"');
		expect(example.code).not.toMatch(/as=|<h[1-6]|<article/i);
	});

	it("describes text-muted-tone as muted tone instead of restrictions", () => {
		const example = scenario("text", "text-muted-tone");
		expect(example.title).toBe("Muted tone");
		expect(example.title).not.toMatch(/restriction/i);
		expect(example.code).toContain('tone="muted"');
	});

	it("describes code-block-basic without line numbers", () => {
		const example = scenario("code-block", "code-block-basic");
		expect(example.title).toBe("Basic");
		expect(example.title).not.toMatch(/line number/i);
		expect(example.code).toContain("<CodeBlock>");
		expect(example.code).not.toMatch(/lineNumber|showLineNumbers/i);
		expect(CATALOG_DOCS["code-block"]?.usage).toContain("<CodeBlock>const n = 1;</CodeBlock>");
		expect(CATALOG_DOCS["code-block"]?.usage).not.toContain("<CodeBlock>code</CodeBlock>");
	});

	it("includes autocomplete items in usage", () => {
		const usage = CATALOG_DOCS.autocomplete?.usage ?? "";
		expect(usage).toContain("items=");
		expect(usage).toContain("Apple");
		expect(usage).not.toMatch(/<Autocomplete\s*\/>/);
		expect(scenario("autocomplete", "autocomplete-default").code).toContain("items=");
	});

	it("shows select as a compound tree", () => {
		const usage = CATALOG_DOCS.select?.usage ?? "";
		expect(usage).toContain("SelectTrigger");
		expect(usage).toContain("SelectContent");
		expect(usage).toContain("SelectItem");
		expect(usage).not.toMatch(/return <Select\s*\/>/);
		expect(scenario("select", "select-basic").code).toContain("SelectContent");
		expect(scenario("select", "select-placeholder").code).toContain('placeholder="Choose…"');
		expect(scenario("select", "select-disabled-options").code).toContain("disabled");
	});

	it("renders select basic, placeholder, and disabled options from source modules", () => {
		expect(UI_EXAMPLES.select).toBe(SELECT_EXAMPLES);
		const basic = scenario("select", "select-basic");
		expect(basic.code).toContain("export default");
		expect(basic.code).toContain("@nocoo/basalt/components/select");
		expect(basic.code).toContain('aria-label="Version"');
		expect(basic.code).toContain('className="w-48"');
		expect(basic.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
		render(createElement(basic.render));
		const trigger = screen.getByRole("combobox", { name: "Version" });
		expect(trigger).toHaveTextContent("Select version");
		expect(trigger.className).toContain("w-48");
		fireEvent.click(trigger);
		fireEvent.click(screen.getByRole("option", { name: "v2" }));
		expect(trigger).toHaveTextContent("v2");
		cleanup();
		const placeholder = scenario("select", "select-placeholder");
		expect(placeholder.code).toContain('aria-label="Empty select"');
		expect(placeholder.code).toContain('placeholder="Choose…"');
		render(createElement(placeholder.render));
		const empty = screen.getByRole("combobox", { name: "Empty select" });
		expect(empty).toHaveTextContent("Choose…");
		fireEvent.click(empty);
		fireEvent.click(screen.getByRole("option", { name: "Alpha" }));
		expect(empty).toHaveTextContent("Alpha");
		cleanup();
		const disabled = scenario("select", "select-disabled-options");
		expect(disabled.code).toContain('aria-label="Disabled option"');
		expect(disabled.code).toContain("disabled");
		render(createElement(disabled.render));
		const disabledTrigger = screen.getByRole("combobox", { name: "Disabled option" });
		expect(disabledTrigger).toHaveTextContent("Choose…");
		fireEvent.click(disabledTrigger);
		const alpha = screen.getByRole("option", { name: "Alpha" });
		const beta = screen.getByRole("option", { name: "Beta" });
		expect(alpha).not.toHaveAttribute("aria-disabled", "true");
		expect(beta).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(beta);
		expect(disabledTrigger).toHaveTextContent("Choose…");
		cleanup();
	});

	it("shows grid items instead of an empty shell", () => {
		const usage = CATALOG_DOCS.grid?.usage ?? "";
		expect(usage).toContain("GridItem");
		expect(usage).not.toMatch(/return <Grid\s*\/>/);
		expect(scenario("grid", "grid-grid").code).toContain("<GridItem>4</GridItem>");
	});

	it("shows flow nodes instead of an empty shell", () => {
		const usage = CATALOG_DOCS.flow?.usage ?? "";
		expect(usage).toContain("FlowNode");
		expect(usage).not.toMatch(/return <Flow\s*\/>/);
		expect(scenario("flow", "flow-sequential-flow").code).toContain("FlowNode");
	});

	it("returns a single sidebar tree that matches the preview structure", () => {
		const usage = CATALOG_DOCS.sidebar?.usage ?? "";
		expect(usage).toContain("Sidebar");
		expect(usage).toContain("SidebarItem");
		expect(usage).toContain("ContentIsland");
		expect(usage).toContain("Catalog");
		expect(usage).toContain("Settings");
		expect(usage).toContain("At a glance");
		expect(usage).not.toMatch(/<\/Sidebar>\s*<ContentIsland/);
		expect(scenario("sidebar", "sidebar-default").code).toContain("ContentIsland");
	});

	it("shows command palette usage instead of only a trigger button", () => {
		const usage = CATALOG_DOCS["command-palette"]?.usage ?? "";
		expect(usage).toContain("CommandPalette");
		expect(usage).toContain("CommandInput");
		expect(usage).toContain("CommandItem");
		expect(usage).not.toMatch(/return <Button variant="outline">Search pages\.\.\.<\/Button>;/);
		expect(scenario("command-palette", "command-palette-with-grouped-items").code).toContain(
			"CommandGroup",
		);
		expect(scenario("command-palette", "command-palette-simple-flat-list").code).toContain(
			"CommandItem",
		);
		expect(scenario("command-palette", "command-palette-simple-flat-list").code).not.toContain(
			"CommandGroup",
		);
	});

	it("keeps highlighted code examples complete", () => {
		const usage = CATALOG_DOCS.code?.usage ?? "";
		expect(usage).toContain("CodeHighlighted");
		expect(usage).toContain("fetchUser");
		expect(usage).not.toContain("…");
		expect(scenario("code", "code-typescript").code).toContain("fetchUser");
		expect(scenario("code", "code-typescript").code).not.toContain("…");
		expect(scenario("code", "code-react").code).toContain("useState");
		expect(scenario("code", "code-react").code).not.toContain("…");
	});

	it("imports every jsx part used by content usage examples", () => {
		expectUsageImportsCover(CATALOG_DOCS.code?.usage ?? "", ["CodeHighlighted"]);
		expect(CATALOG_DOCS.code?.usage).not.toMatch(/import\s+\{\s*Code\s*\}/);
		expectUsageImportsCover(CATALOG_DOCS.select?.usage ?? "", [
			"Select",
			"SelectTrigger",
			"SelectValue",
			"SelectContent",
			"SelectItem",
		]);
		expectUsageImportsCover(CATALOG_DOCS.grid?.usage ?? "", ["Grid", "GridItem"]);
		expectUsageImportsCover(CATALOG_DOCS.flow?.usage ?? "", ["Flow", "FlowNode"]);
		expectUsageImportsCover(CATALOG_DOCS.sidebar?.usage ?? "", [
			"Sidebar",
			"SidebarItem",
			"ContentIsland",
		]);
	});

	it("declares command palette open state in copyable code", () => {
		for (const id of [
			"command-palette-with-grouped-items",
			"command-palette-simple-flat-list",
		] as const) {
			const source = scenario("command-palette", id).code;
			expect(source, id).toContain("open");
			expect(source, id).toContain("setOpen");
			expect(source, id).toContain("useState");
			expect(source, id).toMatch(/const \[open,\s*setOpen\]\s*=\s*useState/);
		}
	});
});
