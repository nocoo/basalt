import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import {
	CATALOG,
	catalogImportPath,
	catalogNavName,
	inScopeCatalogSlugs,
	libraryDocEntries,
	libraryNavEntries,
} from "@/pages/ui/catalog";
import { UI_DEMOS } from "@/pages/ui/demos";
import { CATALOG_DOCS } from "@/pages/ui/docs";
import { KUMO_DOCS_SLUGS } from "@/pages/ui/kumo-list";
import UiIndexPage from "@/pages/ui/UiIndexPage";
import UiPlaceholderPage from "@/pages/ui/UiPlaceholderPage";

function renderCatalog(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route path="/ui" element={<UiIndexPage />} />
				<Route path="/ui/:slug" element={<UiPlaceholderPage />} />
			</Routes>
		</MemoryRouter>,
	);
}

describe("ui catalog", () => {
	it("covers every in-scope catalog slug", () => {
		expect(inScopeCatalogSlugs().length).toBeGreaterThan(40);
	});

	it("lists unique catalog slugs", () => {
		const slugs = CATALOG.map((entry) => entry.slug);
		expect(slugs).toHaveLength(96);
		expect(new Set(slugs).size).toBe(96);
	});

	it("renders the index with links to every export", () => {
		renderCatalog("/ui");
		expect(document.querySelector("[data-status='index']")).toBeTruthy();
		expect(document.querySelector("li.bg-bright")).toBeTruthy();
		expect(screen.getByRole("link", { name: "Button" })).toHaveAttribute("href", "/ui/button");
		expect(screen.getByRole("link", { name: "Toolbar" })).toHaveAttribute("href", "/ui/toolbar");
		for (const entry of CATALOG.filter((item) => item.category !== "docs")) {
			const href = `/ui/${entry.slug}`;
			const match = screen.getAllByRole("link").some((link) => link.getAttribute("href") === href);
			expect(match, entry.slug).toBe(true);
		}
	});

	it("renders a placeholder catalog page for a known slug", () => {
		renderCatalog("/ui/maps");
		expect(screen.getByRole("heading", { name: "Maps" })).toBeInTheDocument();
		expect(document.querySelector("[data-status='placeholder']")).toBeTruthy();
		expect(screen.getByText(/未实现/)).toBeInTheDocument();
	});

	it("marks unknown slugs as missing", () => {
		renderCatalog("/ui/not-a-control");
		expect(document.querySelector("[data-status='missing']")).toBeTruthy();
	});

	it("keeps generated usage examples self-contained", () => {
		expect(CATALOG_DOCS["data-table"]?.usage).toContain('name: "Atlas"');
		expect(CATALOG_DOCS["data-table"]?.usage).not.toContain("data={rows}");
		expect(CATALOG_DOCS.radar?.usage).toContain("subject:");
		expect(CATALOG_DOCS.timeline?.usage).toContain("Created");
		expect(CATALOG_DOCS.sankey?.usage).toContain("nodes:");
	});

	it("maps CodeBlock to the code module path", () => {
		const entry = CATALOG.find((item) => item.slug === "code-block");
		expect(entry).toBeDefined();
		if (!entry) {
			return;
		}
		expect(catalogImportPath(entry)).toBe("@nocoo/basalt/components/code");
	});

	it.each(inScopeCatalogSlugs())("documents ready catalog page %s", (slug) => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(UI_DEMOS[slug], slug).toBeDefined();
		const docs = CATALOG_DOCS[slug];
		expect(docs, slug).toBeDefined();
		if (!docs) {
			return;
		}
		cleanup();
		renderCatalog(`/ui/${slug}`);
		expect(document.querySelector(`[data-status='ready'][data-slug='${slug}']`)).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Installation" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Usage" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "API Reference" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Copy page" })).toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: "Copy" }).length).toBeGreaterThan(0);
		expect(screen.getAllByRole("navigation", { name: "On this page" }).length).toBeGreaterThan(0);
		expect(document.querySelector("aside .sticky")).toBeTruthy();
		expect(screen.getAllByRole("combobox", { name: "Jump to section" }).length).toBeGreaterThan(0);
		expect(screen.getByRole("link", { name: new RegExp(docs.source.sha) })).toBeInTheDocument();
	});

	it("orders library nav like kumo", () => {
		expect(libraryDocEntries().map(catalogNavName)).toEqual([
			"Installation",
			"Contributing",
			"Colors",
			"Accessibility",
			"Figma Resources",
			"CLI",
			"Design skill",
			"Registry",
			"Changelog",
		]);
		const components = libraryNavEntries("component");
		expect(catalogNavName(components[0])).toBe("Accordion");
		expect(components.map(catalogNavName)).toEqual(
			[...components.map(catalogNavName)].sort((a, b) => a.localeCompare(b, "en")),
		);
		expect(libraryNavEntries("chart").slice(0, 6).map(catalogNavName)).toEqual([
			"Charts",
			"Colors",
			"Timeseries",
			"Maps",
			"Sankey",
			"Custom Chart",
		]);
		expect(libraryNavEntries("block").map(catalogNavName)).toEqual([
			"Page Header",
			"Resource List",
			"Delete Resource",
		]);
	});

	it("does not cite meowth or pika as catalog sources", () => {
		for (const [slug, docs] of Object.entries(CATALOG_DOCS)) {
			expect(docs.source.repo, slug).not.toMatch(/^(meowth|pika)$/);
		}
	});

	it("opens overlay demos with the button control", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const triggers: Record<string, string> = {
			collapsible: "What is Kumo?",
			dialog: "Click me",
			popover: "Open",
			"dropdown-menu": "Open",
			sheet: "Open",
		};
		for (const [slug, name] of Object.entries(triggers)) {
			cleanup();
			renderCatalog(`/ui/${slug}`);
			expect(screen.getAllByRole("button", { name }).length).toBeGreaterThan(0);
		}
	});

	it("opens the command palette from a search trigger", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		Element.prototype.scrollIntoView = vi.fn();
		renderCatalog("/ui/command-palette");
		expect(screen.getByRole("heading", { name: "Command Palette" })).toBeInTheDocument();
		fireEvent.click(screen.getAllByRole("button", { name: /Search pages/ })[0]);
		expect(screen.getByPlaceholderText("Search pages...")).toBeInTheDocument();
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByText("Button")).toBeInTheDocument();
	});

	it("renders example previews on a themed bordered surface", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/button");
		const preview = document.querySelector(".min-h-\\[140px\\]");
		expect(preview).toHaveClass("bg-bright");
		expect(preview?.parentElement).toHaveClass("border", "border-border");
	});

	it("documents banner examples like kumo", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/banner");
		expect(screen.getByRole("heading", { name: "Banner" })).toBeInTheDocument();
		for (const title of [
			"Variants",
			"With icon",
			"With action",
			"With multiple actions",
			"Compact size",
			"Custom content",
		]) {
			expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
		}
		expect(screen.getAllByText("Update available").length).toBeGreaterThan(0);
		expect(screen.getAllByRole("button", { name: "Update" }).length).toBeGreaterThan(0);
	});

	it.each([
		[
			"badge",
			[
				"Primary Badges",
				"Other color variants",
				"Color tokens",
				"Dot badges",
				"In a sentence",
				"With an icon",
				"Linked badge",
			],
		],
		["checkbox", ["Default", "Checked", "Indeterminate", "Disabled", "Error"]],
		["switch", ["Off State", "On State", "Disabled", "Sizes"]],
		["input", ["With Label and Description", "With Error (String)", "Disabled", "Input Types"]],
		["loader", ["Default Size", "Custom Size"]],
		["empty", ["Basic", "With icon"]],
		["meter", ["Basic Meter", "Custom Value Display", "Hidden Value"]],
		["pagination", ["Full Controls (Default)", "Simple Controls"]],
		[
			"toast",
			[
				"Title Only",
				"Success Variant",
				"Error Variant",
				"Close button",
				"Hidden close",
				"Custom icon",
				"Hidden icon",
			],
		],
		["clipboard-text", ["Short Text", "API Key", "Copy Alternate Text"]],
		["label", ["Default Label", "Optional Field", "With Tooltip"]],
		[
			"dialog",
			[
				"Basic Dialog",
				"Sizes",
				"Alert Dialog",
				"Confirmation Dialog",
				"With Actions",
				"Custom Max Width",
				"With Select",
				"With Combobox",
				"With Dropdown",
			],
		],
	] as const)("documents kumo examples for %s", (slug, titles) => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog(`/ui/${slug}`);
		for (const title of titles) {
			expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
		}
	});

	it("documents button examples like kumo", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/button");
		for (const title of [
			"Variants",
			"Sizes",
			"With Icon",
			"Icon Only",
			"Loading State",
			"Disabled State",
			"Title",
			"Link as Button",
			"Link with Tooltip",
			"Disabled Link",
		]) {
			expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
		}
	});

	it("keeps the disabled link example inert", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/button");
		const link = screen.getByRole("link", { name: "Disabled link" });
		expect(link).toHaveAttribute("aria-disabled", "true");
		expect(link).toHaveAttribute("tabindex", "-1");
		expect(link).not.toHaveAttribute("href");
		fireEvent.click(link);
		expect(window.location.hash).not.toBe("#docs");
	});

	it("shows a barrel install for stable controls", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/badge");
		expect(screen.getByRole("heading", { name: "Barrel" })).toBeInTheDocument();
		expect(document.body.textContent).toContain('import { Badge } from "@nocoo/basalt"');
	});

	it("omits the barrel install for catalog-only controls", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/accordion");
		expect(screen.queryByRole("heading", { name: "Barrel" })).not.toBeInTheDocument();
	});

	it("covers every Kumo docs component slug", () => {
		const slugs = new Set(CATALOG.map((entry) => entry.slug));
		expect(KUMO_DOCS_SLUGS).toHaveLength(41);
		for (const slug of KUMO_DOCS_SLUGS) {
			expect(slugs.has(slug), slug).toBe(true);
		}
	});
});
