import { describe, expect, it } from "vitest";
import { loadCatalogContentRecord } from "@/pages/ui/catalog-content-registry";

const catalogContent = await loadCatalogContentRecord();
const UI_EXAMPLES = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.examples]),
);
const CATALOG_DOCS = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.docs]),
);

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

function declaresPageState(source: string) {
	return /const \[page,\s*setPage\]\s*=\s*useState/.test(source);
}

function hasSingleJsxRoot(source: string) {
	const trimmed = source.trim();
	return trimmed.startsWith("<>") && trimmed.endsWith("</>");
}

describe("overlay data scenario truth", () => {
	it("keeps audited scenario ids and counts", () => {
		expect(UI_EXAMPLES.collapsible?.map((item) => item.id)).toEqual([
			"collapsible-with-default-styling",
			"collapsible-custom-trigger",
		]);
		expect(UI_EXAMPLES.dialog?.map((item) => item.id)).toEqual([
			"dialog-basic-dialog",
			"dialog-sizes",
			"dialog-alert-dialog",
			"dialog-confirmation-dialog",
			"dialog-with-actions",
			"dialog-custom-max-width",
			"dialog-with-select",
			"dialog-with-combobox",
			"dialog-with-dropdown",
		]);
		expect(UI_EXAMPLES["dropdown-menu"]?.map((item) => item.id)).toEqual([
			"dropdown-menu-basic-dropdown",
		]);
		expect(UI_EXAMPLES.pagination?.map((item) => item.id)).toEqual([
			"pagination-full-controls-default",
			"pagination-simple-controls",
			"pagination-mid-page-state",
			"pagination-uncontrolled",
			"pagination-disabled",
		]);
		expect(UI_EXAMPLES.popover?.map((item) => item.id)).toEqual([
			"popover-basic-popover",
			"popover-sides",
		]);
		expect(UI_EXAMPLES.table?.map((item) => item.id)).toEqual([
			"table-basic",
			"table-selected-row",
		]);
		expect(UI_EXAMPLES["table-of-contents"]?.map((item) => item.id)).toEqual([
			"table-of-contents-options",
			"table-of-contents-no-active-item",
			"table-of-contents-without-title",
		]);
		expect(UI_EXAMPLES.tabs?.map((item) => item.id)).toEqual(["tabs-variants", "tabs-many-tabs"]);
		expect(UI_EXAMPLES.toolbar?.map((item) => item.id)).toEqual([
			"toolbar-input-shorthand",
			"toolbar-button-actions",
		]);
	});

	it("shows collapsible content instead of ellipsis shells", () => {
		const usage = CATALOG_DOCS.collapsible?.usage ?? "";
		expectUsageImportsCover(usage, ["Collapsible", "CollapsibleTrigger", "CollapsibleContent"]);
		expect(usage).toContain("This project is a React component library.");
		expect(usage).not.toContain("…");
		expect(scenario("collapsible", "collapsible-with-default-styling").code).toContain(
			"This project is a React component library.",
		);
		expect(scenario("collapsible", "collapsible-with-default-styling").code).not.toContain("…");
		expect(scenario("collapsible", "collapsible-custom-trigger").code).toContain("<Collapsible");
		expect(scenario("collapsible", "collapsible-custom-trigger").code).toContain(
			"CollapsibleContent",
		);
		expect(scenario("collapsible", "collapsible-custom-trigger").code).toContain("Expanded copy.");
	});

	it("keeps dropdown menus with content and items", () => {
		const usage = CATALOG_DOCS["dropdown-menu"]?.usage ?? "";
		expectUsageImportsCover(usage, [
			"Button",
			"DropdownMenu",
			"DropdownMenuTrigger",
			"DropdownMenuContent",
			"DropdownMenuItem",
		]);
		expect(usage).toContain("Copy");
		expect(scenario("dropdown-menu", "dropdown-menu-basic-dropdown").code).toContain(
			"DropdownMenuContent",
		);
		expect(scenario("dropdown-menu", "dropdown-menu-basic-dropdown").code).toContain("Copy");
		expect(scenario("dropdown-menu", "dropdown-menu-basic-dropdown").code).toContain("Delete");
	});

	it("declares pagination page state instead of a dangling setter", () => {
		const usage = CATALOG_DOCS.pagination?.usage ?? "";
		expectUsageImportsCover(usage, ["Pagination"]);
		expect(importedNames(usage).has("useState")).toBe(true);
		expect(declaresPageState(usage)).toBe(true);
		expect(usage).toContain("onPageChange={setPage}");
		for (const id of [
			"pagination-full-controls-default",
			"pagination-simple-controls",
			"pagination-mid-page-state",
		] as const) {
			const code = scenario("pagination", id).code;
			expect(code, id).toContain("useState");
			expect(declaresPageState(code), id).toBe(true);
		}
		expect(scenario("pagination", "pagination-simple-controls").code).toContain("simple");
		expect(scenario("pagination", "pagination-mid-page-state").code).toContain("pageCount={12}");
		expect(scenario("pagination", "pagination-uncontrolled").code).toContain("defaultPage={2}");
		expect(scenario("pagination", "pagination-disabled").code).toContain("disabled");
	});

	it("keeps table header body and cells complete", () => {
		const usage = CATALOG_DOCS.table?.usage ?? "";
		expectUsageImportsCover(usage, [
			"Table",
			"TableHeader",
			"TableBody",
			"TableRow",
			"TableHead",
			"TableCell",
		]);
		expect(usage).toContain("Report 1");
		expect(scenario("table", "table-basic").code).toContain("Report 2");
		expect(scenario("table", "table-basic").code).toContain("Report 3");
		expect(scenario("table", "table-selected-row").code).toContain('variant="selected"');
		expect(scenario("table", "table-selected-row").code).toContain("TableHeader");
		expect(scenario("table", "table-selected-row").code).toContain("Idle");
		expect(scenario("table", "table-selected-row").code).not.toContain("…");
	});

	it("keeps table of contents items instead of empty roots", () => {
		const usage = CATALOG_DOCS["table-of-contents"]?.usage ?? "";
		expectUsageImportsCover(usage, ["TableOfContents", "TableOfContentsItem"]);
		expect(usage).not.toMatch(/<TableOfContents\s*\/>/);
		expect(scenario("table-of-contents", "table-of-contents-options").code).toContain("Intro");
		expect(scenario("table-of-contents", "table-of-contents-options").code).toContain("Usage");
		expect(scenario("table-of-contents", "table-of-contents-no-active-item").code).toContain(
			"<TableOfContents",
		);
		expect(scenario("table-of-contents", "table-of-contents-no-active-item").code).not.toMatch(
			/^<TableOfContentsItem/,
		);
		expect(scenario("table-of-contents", "table-of-contents-without-title").code).toContain(
			'title=""',
		);
		expect(scenario("table-of-contents", "table-of-contents-without-title").code).toContain(
			"TableOfContentsItem",
		);
		expect(scenario("table-of-contents", "table-of-contents-without-title").code).not.toContain(
			"…",
		);
	});

	it("shows tabs lists instead of empty roots or ellipsis triggers", () => {
		const usage = CATALOG_DOCS.tabs?.usage ?? "";
		expectUsageImportsCover(usage, ["Tabs", "TabsList", "TabsTrigger", "TabsContent"]);
		expect(usage).not.toMatch(/<Tabs\s*\/>/);
		expect(usage).toContain("TabsContent");
		expect(scenario("tabs", "tabs-variants").code).toContain('value="b"');
		expect(scenario("tabs", "tabs-variants").code).toContain("TabsContent");
		expect(scenario("tabs", "tabs-many-tabs").code).toContain("<Tabs");
		expect(scenario("tabs", "tabs-many-tabs").code).toContain("Changelog");
		expect(scenario("tabs", "tabs-many-tabs").code).not.toContain("…");
		expect(scenario("tabs", "tabs-many-tabs").code).toContain("TabsContent");
		expect(scenario("tabs", "tabs-many-tabs").code).toContain('defaultValue="overview"');
		expect(scenario("tabs", "tabs-many-tabs").code).toContain('value="overview"');
		expect(scenario("tabs", "tabs-many-tabs").code).not.toContain('defaultValue="a"');
	});

	it("imports dialog and popover overlay parts used by docs usage", () => {
		expectUsageImportsCover(CATALOG_DOCS.dialog?.usage ?? "", [
			"Button",
			"Dialog",
			"DialogTrigger",
			"DialogContent",
			"DialogTitle",
			"DialogDescription",
			"DialogClose",
		]);
		expectUsageImportsCover(CATALOG_DOCS.popover?.usage ?? "", [
			"Button",
			"Popover",
			"PopoverTrigger",
			"PopoverContent",
			"PopoverTitle",
			"PopoverDescription",
		]);
		expect(scenario("dialog", "dialog-basic-dialog").code).toContain("DialogTrigger");
		expect(scenario("dialog", "dialog-basic-dialog").code).toContain("DialogClose");
		expect(hasSingleJsxRoot(scenario("dialog", "dialog-sizes").code)).toBe(true);
		expect(scenario("dialog", "dialog-sizes").code).toContain('size="sm"');
		expect(scenario("dialog", "dialog-sizes").code).toContain('size="xl"');
		expect(scenario("dialog", "dialog-sizes").code).toContain("DialogTrigger");
		expect(scenario("dialog", "dialog-sizes").code).not.toContain("…");
		expect(scenario("dialog", "dialog-confirmation-dialog").code).toContain("DialogClose");
		expect(scenario("dialog", "dialog-custom-max-width").code).toContain("DialogTrigger");
		expect(scenario("dialog", "dialog-custom-max-width").code).toContain('className="max-w-lg"');
		expect(scenario("dialog", "dialog-with-select").code).toContain("DialogTrigger");
		expect(scenario("dialog", "dialog-with-select").code).toContain("SelectItem");
		expect(scenario("dialog", "dialog-with-combobox").code).toContain("DialogTrigger");
		expect(scenario("dialog", "dialog-with-dropdown").code).toContain("DialogTrigger");
		expect(scenario("popover", "popover-basic-popover").code).toContain('variant="outline"');
		expect(hasSingleJsxRoot(scenario("popover", "popover-sides").code)).toBe(true);
		expect(scenario("popover", "popover-sides").code).toContain('side="top"');
		expect(scenario("popover", "popover-sides").code).toContain('side="bottom"');
		expect(scenario("popover", "popover-sides").code).toContain("PopoverTrigger");
		expect(scenario("popover", "popover-sides").code).not.toContain("…");
	});

	it("keeps toolbar compound members and button names", () => {
		const usage = CATALOG_DOCS.toolbar?.usage ?? "";
		expectUsageImportsCover(usage, ["Toolbar"]);
		expect(importedNames(usage).has("Search")).toBe(true);
		expect(importedNames(usage).has("Plus")).toBe(true);
		expect(usage).toContain("Toolbar.Input");
		expect(usage).toContain("Toolbar.Button");
		expect(usage).toContain('aria-label="Search records"');
		expect(usage).toContain('aria-label="Search"');
		expect(usage).toContain('aria-label="Add"');
		expect(scenario("toolbar", "toolbar-input-shorthand").code).toContain(
			'aria-label="Search records"',
		);
		expect(scenario("toolbar", "toolbar-input-shorthand").code).toContain("icon={<Search />}");
		expect(scenario("toolbar", "toolbar-input-shorthand").code).toContain("icon={<Plus />}");
		expect(scenario("toolbar", "toolbar-button-actions").code).toContain("Upload");
		expect(scenario("toolbar", "toolbar-button-actions").code).toContain("Download");
	});
});
