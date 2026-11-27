import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CatalogApiReference, catalogApiSurfaceId } from "@/pages/ui/ComponentDocPage";
import {
	CATALOG,
	catalogImportPath,
	catalogNavName,
	inScopeCatalogSlugs,
	libraryNavEntries,
} from "@/pages/ui/catalog";
import {
	catalogSourceCopyText,
	catalogSourceViewerHref,
	githubSourceHref,
	githubSourceLabel,
} from "@/pages/ui/catalog-source";
import { CATALOG_API } from "@/pages/ui/generated/catalog-api";
import {
	CATALOG_DOCS,
	CATALOG_INDEX_GROUPS,
	CATALOG_INDEX_ITEMS,
	catalogHeroScenario,
	renderCatalog,
	UI_EXAMPLES,
} from "./ui-catalog-test-helpers";

describe("ui catalog", () => {
	it("covers every in-scope catalog slug", () => {
		expect(inScopeCatalogSlugs().length).toBeGreaterThan(40);
	});

	it("lists unique catalog slugs", () => {
		const slugs = CATALOG.map((entry) => entry.slug);
		expect(slugs).toHaveLength(81);
		expect(new Set(slugs).size).toBe(81);
	});

	it("renders the categorized index with orthogonal release and page states", () => {
		renderCatalog("/ui");
		expect(document.querySelector("[data-status='index']")).toBeTruthy();
		expect(document.querySelector("[data-ready-summary]")).toBeNull();
		const banner = screen.getByRole("banner", { name: "Component library", hidden: true });
		expect(banner).toBeVisible();
		expect(within(banner).getByRole("heading", { name: "Component library" })).toBeInTheDocument();
		const filtersToggle = within(banner).getByRole("button", { name: "Filters" });
		expect(filtersToggle).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByRole("searchbox", { name: "Search" })).not.toBeInTheDocument();
		fireEvent.click(filtersToggle);
		expect(filtersToggle).toHaveAttribute("aria-expanded", "true");
		expect(document.querySelector('search[aria-label="Filter components"]')).toBeInTheDocument();
		expect(screen.getByRole("searchbox", { name: "Search" })).toBeInTheDocument();
		expect(document.getElementById("catalog-filters")).toHaveAttribute("data-basalt-surface");
		expect(document.getElementById("catalog-filters")).toHaveClass("p-basalt-card");

		const tableSlugs = new Set(["table", "data-table", "table-pager"]);
		for (const group of CATALOG_INDEX_GROUPS) {
			const section = screen.getByRole("region", { name: group.label, hidden: true });
			expect(section).toBeVisible();
			const remaining = group.items.filter((item) => !tableSlugs.has(item.entry.slug));
			expect(within(section).getByText(`${remaining.length} items`)).toBeInTheDocument();
			expect(section.querySelectorAll("[data-catalog-card]")).toHaveLength(remaining.length);
		}
		const tablesSection = screen.getByRole("region", { name: "Tables", hidden: true });
		expect(tablesSection.querySelectorAll("[data-catalog-card]")).toHaveLength(3);
		expect(
			Array.from(tablesSection.querySelectorAll<HTMLElement>("[data-catalog-card]")).map(
				(card) => card.dataset.catalogCard,
			),
		).toEqual(["table", "data-table", "table-pager"]);
		expect(within(tablesSection).getByText("3 items")).toBeInTheDocument();
		expect(within(tablesSection).queryByRole("link", { name: "Tables overview" })).toBeNull();
		const tablesGrid = tablesSection.querySelector("ul");
		expect(tablesGrid).toHaveClass("@[44rem]/island:grid-cols-2");
		expect(tablesGrid).not.toHaveClass("@[60rem]/island:grid-cols-3");
		expect(tablesGrid).not.toHaveClass("@[84rem]/island:grid-cols-4");
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(81);
		expect(document.querySelectorAll('[data-catalog-card="input"]')).toHaveLength(1);
		expect(screen.queryByText("Input (with validation)")).not.toBeInTheDocument();

		for (const item of CATALOG_INDEX_ITEMS) {
			const card = document.querySelector(`[data-catalog-card="${item.entry.slug}"]`);
			expect(card, item.entry.slug).toBeTruthy();
			if (!card) {
				continue;
			}
			const href = `/ui/${item.entry.slug}`;
			if (item.pageStatus === "ready") {
				expect(card.querySelector(`a[href="${href}"]`), item.entry.slug).toBeTruthy();
			} else {
				expect(card.querySelector(`a[href="${href}"]`), item.entry.slug).toBeNull();
			}
		}

		const buttonCard = document.querySelector('[data-catalog-card="button"]');
		const chartCard = document.querySelector('[data-catalog-card="chart"]');
		expect(buttonCard).toBeTruthy();
		expect(chartCard).toBeTruthy();
		if (buttonCard && chartCard) {
			expect(buttonCard.querySelector("[data-release-status]")).toBeNull();
			expect(buttonCard.querySelector("[data-page-status]")).toBeNull();
			expect(chartCard.querySelector("[data-release-status]")).toBeNull();
			expect(chartCard.querySelector("[data-page-status]")).toBeNull();
		}
		expect(
			document.querySelector(
				'[data-slot="card-header"][data-divided="true"].border-b.border-basalt-border',
			),
		).toBeTruthy();
		expect(buttonCard?.querySelector(".rounded-lg")).toBeNull();
		expect(
			within(buttonCard as HTMLElement).getAllByRole("button", { name: "Add health record" }),
		).toHaveLength(3);
	}, 15_000);

	it("filters the catalog from URL-backed search and toggle controls", () => {
		renderCatalog("/ui?q=input&release=catalog");
		const searchInput = screen.getByRole("searchbox", { name: "Search" });
		expect(searchInput).toHaveValue("input");
		expect(screen.getByRole("combobox", { name: "Category" })).toBeInTheDocument();
		expect(screen.getByRole("radiogroup", { name: "Release" })).toBeInTheDocument();
		expect(screen.queryByRole("radiogroup", { name: "Page status" })).toBeNull();
		expect(screen.getByRole("radio", { name: "Catalog" })).toHaveAttribute("aria-checked", "true");
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent("2 results");
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(2);
		expect(
			Array.from(document.querySelectorAll<HTMLElement>("[data-catalog-card]")).map(
				(card) => card.dataset.catalogCard,
			),
		).toEqual(["input-group", "sensitive-input"]);
		expect(screen.queryByRole("region", { name: "Charts" })).not.toBeInTheDocument();

		searchInput.focus();
		fireEvent.change(searchInput, { target: { value: "input " } });
		expect(searchInput).toHaveValue("input ");
		fireEvent.change(searchInput, { target: { value: "input group" } });
		expect(searchInput).toHaveFocus();
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent(/^1 result$/);
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(1);
		expect(document.querySelector('[data-catalog-card="input-group"]')).toBeInTheDocument();
		expect(document.querySelector("[data-router-location]")).toHaveAttribute(
			"data-router-location",
			"/ui?q=input+group&release=catalog",
		);
		expect(document.querySelector("[data-router-location]")).toHaveAttribute(
			"data-navigation-type",
			"REPLACE",
		);
	});

	it("shows an empty state when no components match", () => {
		renderCatalog("/ui?q=nonexistent-component");
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent(/^0 results$/);
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(0);
	});

	it("selects a design category and links its overview without changing component URLs", () => {
		renderCatalog("/ui?category=action");
		const category = screen.getByRole("combobox", { name: "Category" });
		expect(category).toHaveTextContent("Actions");
		fireEvent.keyDown(category, { key: "ArrowDown" });
		fireEvent.click(screen.getByRole("option", { name: "Inline" }));
		expect(document.querySelector("[data-router-location]")).toHaveAttribute(
			"data-router-location",
			"/ui?category=inline",
		);
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(3);
		expect(screen.getByRole("link", { name: "Inline overview" })).toHaveAttribute(
			"href",
			"/ui/overview/inline",
		);
		expect(screen.getByRole("link", { name: "Badge" })).toHaveAttribute("href", "/ui/badge");
	});

	it("canonicalizes invalid and repeated owned URL values without removing foreign values", async () => {
		renderCatalog("/ui?release=catalog&foreign=one&q=input&q=button&category=unknown&foreign=two");
		expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("");
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent("42 results");
		await waitFor(() => {
			expect(document.querySelector("[data-router-location]")).toHaveAttribute(
				"data-router-location",
				"/ui?foreign=one&foreign=two&release=catalog",
			);
		});
		expect(document.querySelector("[data-router-location]")).toHaveAttribute(
			"data-navigation-type",
			"REPLACE",
		);
	});

	it("renders one empty state and resets owned filters while preserving foreign values", () => {
		renderCatalog("/ui?foreign=kept&q=does-not-exist&category=block");
		const filters = within(document.getElementById("catalog-filters") as HTMLElement);
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent("0 results");
		expect(document.querySelector("[data-empty-status]")).toHaveAttribute("data-basalt-surface");
		expect(document.querySelector("[data-empty-status]")).toHaveClass("p-basalt-card");
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(0);
		expect(screen.queryByRole("region")).not.toBeInTheDocument();
		expect(filters.getAllByRole("button", { name: "Reset filters" })).toHaveLength(1);

		fireEvent.click(filters.getByRole("button", { name: "Reset filters" }));
		expect(filters.getByRole("searchbox", { name: "Search" })).toHaveFocus();
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent("81 results");
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(81);
		expect(filters.queryByRole("button", { name: "Reset filters" })).not.toBeInTheDocument();
		expect(document.querySelector("[data-router-location]")).toHaveAttribute(
			"data-router-location",
			"/ui?foreign=kept",
		);
	});

	it("marks unknown slugs as missing", () => {
		renderCatalog("/ui/not-a-control");
		expect(document.querySelector("[data-status='missing']")).toBeTruthy();
	});

	it("keeps generated usage examples self-contained", () => {
		expect(CATALOG_DOCS["data-table"]?.usage).toContain('name: "Atlas"');
		expect(CATALOG_DOCS["data-table"]?.usage).not.toContain("data={rows}");
		expect(CATALOG_DOCS.chart?.usage).toContain("ChartFrame");
		expect(CATALOG_DOCS["stat-card"]?.usage).toContain("StatCard");
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
		const hero = catalogHeroScenario(slug);
		expect(hero, slug).toBeDefined();
		const docs = CATALOG_DOCS[slug];
		expect(docs, slug).toBeDefined();
		if (!hero || !docs) {
			return;
		}
		cleanup();
		const { container } = renderCatalog(`/ui/${slug}`);
		const header = within(container.querySelector("header") as HTMLElement);
		const installation = within(document.getElementById("installation") as HTMLElement);
		const usage = within(document.getElementById("usage") as HTMLElement);
		const api = within(document.getElementById("api-reference") as HTMLElement);
		const toc = within(container.querySelector("header + div") as HTMLElement);
		expect(document.querySelector(`[data-status='ready'][data-slug='${slug}']`)).toBeTruthy();
		expect(document.querySelector(`[data-hero-scenario="${hero.id}"]`)).toBeTruthy();
		expect(installation.getByRole("heading", { name: "Installation" })).toBeInTheDocument();
		expect(usage.getByRole("heading", { name: "Usage" })).toBeInTheDocument();
		expect(api.getByRole("heading", { name: "API Reference" })).toBeInTheDocument();
		expect(api.getAllByRole("columnheader", { name: "Default" }).length).toBeGreaterThan(0);
		expect(header.getByRole("button", { name: "Copy page" })).toBeInTheDocument();
		expect(header.getByRole("button", { name: "Copy page" }).parentElement).toHaveClass(
			"items-stretch",
		);
		expect(usage.getAllByRole("button", { name: "Copy code" }).length).toBeGreaterThan(0);
		expect(toc.getAllByRole("navigation", { name: "On this page" }).length).toBeGreaterThan(0);
		expect(document.querySelector("aside .sticky")).toBeTruthy();
		expect(toc.getAllByRole("combobox", { name: "Jump to section" }).length).toBeGreaterThan(0);
		const viewerHref = catalogSourceViewerHref(slug, docs.implementationSource.hash);
		const implementationLink = header.getByRole("link", {
			name: "View Basalt component source",
		});
		expect(implementationLink).toHaveAttribute("href", viewerHref);
		const footerLink = screen.getByRole("link", {
			name: githubSourceLabel(docs.implementationSource),
		});
		expect(footerLink).toHaveAttribute("href", viewerHref);
		expect(footerLink.closest("[data-basalt-surface]")).toHaveClass("p-basalt-card");
		if (docs.provenance) {
			expect(
				screen.getByRole("link", { name: githubSourceLabel(docs.provenance) }),
			).toHaveAttribute("href", githubSourceHref(docs.provenance));
		}
	});

	it("sorts components within their design category and preserves block order", () => {
		const components = libraryNavEntries("layout");
		expect(catalogNavName(components[0])).toBe("Accordion");
		expect(components.map(catalogNavName)).toEqual(
			[...components.map(catalogNavName)].sort((a, b) => a.localeCompare(b, "en")),
		);

		expect(libraryNavEntries("block").map(catalogNavName)).toEqual([
			"Page Header",
			"Resource List",
		]);
	});

	it("does not cite meowth or pika as catalog sources", () => {
		for (const [slug, docs] of Object.entries(CATALOG_DOCS)) {
			expect(docs.implementationSource.repo, slug).not.toMatch(/^(meowth|pika)$/);
			if (slug === "confirm-dialog") {
				expect(docs.provenance?.repo, slug).toBe("meowth");
				continue;
			}
			if (slug === "table-pager") {
				expect(docs.provenance?.repo, slug).toBe("pika");
				continue;
			}
			if (docs.provenance) {
				expect(docs.provenance.repo, slug).not.toMatch(/^(meowth|pika)$/);
			}
		}
	});

	it("points every ready catalog docs implementation at nocoo/basalt@main", () => {
		expect(Object.keys(CATALOG_DOCS).length).toBeGreaterThan(40);
		for (const [slug, docs] of Object.entries(CATALOG_DOCS)) {
			expect(docs.implementationSource, slug).toMatchObject({
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
			});
			expect(docs.implementationSource.file, slug).toMatch(/^packages\/basalt\/src\//);
			expect(
				existsSync(path.join(process.cwd(), docs.implementationSource.file)),
				`${slug} ${docs.implementationSource.file}`,
			).toBe(true);
		}
	});

	it("keeps kumo provenance on cloudflare and never infers nocoo/kumo", () => {
		for (const slug of ["link", "link-provider", "dialog"]) {
			const docs = CATALOG_DOCS[slug];
			expect(docs?.provenance, slug).toBeDefined();
			if (!docs?.provenance) {
				continue;
			}
			expect(docs.provenance, slug).toMatchObject({
				owner: "cloudflare",
				repo: "kumo",
				ref: "1159868dfe32",
			});
			const href = githubSourceHref(docs.provenance);
			expect(href, slug).toContain("https://github.com/cloudflare/kumo/blob/1159868dfe32/");
			expect(href, slug).not.toContain("github.com/nocoo/kumo");
		}
	});

	it("copies implementation and provenance instead of a mixed source line", async () => {
		const docs = CATALOG_DOCS.dialog;
		expect(docs?.provenance).toBeDefined();
		if (!docs?.provenance) {
			return;
		}
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/dialog");
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		expect(writeText).toHaveBeenCalled();
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(catalogSourceCopyText(docs, "dialog"));
		expect(markdown).toContain("## Implementation");
		expect(markdown).toContain(catalogSourceViewerHref("dialog", docs.implementationSource.hash));
		expect(markdown).toContain("## Provenance");
		expect(markdown).toContain(githubSourceHref(docs.provenance));
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("copies guide-enriched markdown and exposes Markdown actions in Copy page options", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
		try {
			renderCatalog("/ui/button");
			await act(async () => {
				fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
			});
			expect(writeText).toHaveBeenCalledTimes(1);
			const markdown = String(writeText.mock.calls[0]?.[0]);
			expect(markdown).toContain("## When to use");
			expect(markdown).toContain("- Use when:");
			expect(markdown).toContain("- Avoid when:");
			expect(markdown).toContain("- Placement:");
			expect(markdown).toContain("## API Reference");

			const optionsButton = screen.getByRole("button", { name: "Copy page options" });
			await act(async () => {
				fireEvent.pointerDown(optionsButton, { button: 0, ctrlKey: false });
			});
			const viewMarkdownItem = await screen.findByRole("menuitem", { name: "View as Markdown" });
			const copyUrlItem = screen.getByRole("menuitem", { name: "Copy Markdown URL" });

			await act(async () => {
				fireEvent.click(copyUrlItem);
			});
			expect(writeText).toHaveBeenLastCalledWith(`${window.location.origin}/ui/button.md`);

			await act(async () => {
				fireEvent.pointerDown(optionsButton, { button: 0, ctrlKey: false });
			});
			const viewItemReopened = await screen.findByRole("menuitem", { name: "View as Markdown" });
			await act(async () => {
				fireEvent.click(viewItemReopened);
			});
			expect(openSpy).toHaveBeenCalledWith("/ui/button.md", "_blank", "noopener,noreferrer");
			expect(viewMarkdownItem).toBeDefined();
		} finally {
			openSpy.mockRestore();
		}
	});

	it("does not infer github owner from a repo name", () => {
		const page = readFileSync(
			path.join(process.cwd(), "src/pages/ui/ComponentDocPage.tsx"),
			"utf8",
		);
		const model = readFileSync(path.join(process.cwd(), "src/pages/ui/catalog-source.ts"), "utf8");
		expect(page).not.toContain("github.com/nocoo/${");
		expect(model).not.toContain("github.com/nocoo/${");
	});

	it("opens overlay demos with the button control", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const triggers: Record<string, string> = {
			collapsible: "How does this care plan work?",
			dialog: "Click me",
			popover: "Open Popover",
			"dropdown-menu": "Open",
			sheet: "Open right panel",
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

	it("lets LayerCard own example preview surfaces and padding", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/button");
		const preview = document.querySelector("[data-example-preview]");
		expect(preview).toHaveClass("p-basalt-card");
		expect(preview).not.toHaveClass("bg-bright");
		expect(preview?.parentElement).toHaveAttribute("data-basalt-surface");
		expect(preview?.parentElement).not.toHaveClass("p-basalt-card");
	});

	it("sources the button hero from the first catalog scenario", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const hero = catalogHeroScenario("button");
		expect(hero?.id).toBe("button-variants");
		if (!hero) {
			return;
		}
		renderCatalog("/ui/button");
		const block = document.querySelector("[data-hero-scenario]");
		expect(block).toHaveAttribute("data-hero-scenario", hero.id);
		expect(block?.querySelector("code")?.textContent).toBe(hero.code);
		const preview = block?.querySelector("[data-example-preview]");
		expect(preview).toBeTruthy();
		if (!preview) {
			return;
		}
		const heroPreview = within(preview as HTMLElement);
		expect(heroPreview.getByRole("button", { name: "Default" })).toBeInTheDocument();
		expect(heroPreview.getByRole("button", { name: "Secondary" })).toBeInTheDocument();
		expect(heroPreview.getByRole("button", { name: "Destructive" })).toBeInTheDocument();
		expect(heroPreview.getByRole("button", { name: "Outline" })).toBeInTheDocument();
		expect(heroPreview.getByRole("button", { name: "Ghost" })).toBeInTheDocument();
		expect(heroPreview.getByRole("button", { name: "Link" })).toBeInTheDocument();
	});

	it("sources button API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.button?.api).toEqual(CATALOG_API.button);
		expect(CATALOG_API.button[0]?.props.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		renderCatalog("/ui/button");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		const heading = document.getElementById("api-Button");
		expect(heading?.tagName).toBe("H3");
		expect(heading).toHaveTextContent("Button");
		expect(screen.getByRole("table", { name: "Button props" })).toBeInTheDocument();
		expect(document.querySelector('[data-toc-id="api-Button"]')).toBeTruthy();
		for (const prop of CATALOG_API.button[0]?.props ?? []) {
			expect(api).toHaveTextContent(prop.name);
			expect(api).toHaveTextContent(prop.type);
			expect(api).toHaveTextContent(`${prop.name}?`);
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### Button");
		expect(markdown.indexOf("## API Reference")).toBeLessThan(markdown.indexOf("### Button"));
		for (const prop of CATALOG_API.button[0]?.props ?? []) {
			expect(markdown).toContain(`- ${prop.name} (${prop.type}, optional`);
		}
	});

	it("does not keep a handwritten button prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/foundation.tsx"),
			"utf8",
		);
		expect(family).toContain("api: buttonApi");
		expect(family).not.toContain('name: "variant"');
		expect(family).not.toContain('name: "asChild"');
		expect(family).not.toContain('name: "loading"');
		expect(family).not.toContain('name: "icon"');
	});

	it("renders multiple and empty API surfaces in declaration order", () => {
		render(
			<CatalogApiReference
				api={[
					{
						name: "Alpha",
						props: [{ name: "one", type: "string", required: true, description: "First" }],
					},
					{ name: "Beta", props: [] },
				]}
			/>,
		);
		const alpha = document.getElementById(catalogApiSurfaceId("Alpha"));
		const beta = document.getElementById(catalogApiSurfaceId("Beta"));
		expect(alpha?.tagName).toBe("H3");
		expect(beta?.tagName).toBe("H3");
		expect(alpha).toHaveTextContent("Alpha");
		expect(beta).toHaveTextContent("Beta");
		if (!alpha || !beta) {
			throw new Error("missing API surface headings");
		}
		expect(alpha.compareDocumentPosition(beta) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING,
		);
		const alphaTable = screen.getByRole("table", { name: "Alpha props" });
		expect(alphaTable).toHaveTextContent("one");
		const tableRegion = screen.getByRole("region", { name: "Alpha API scrolling table" });
		expect(tableRegion).toHaveAttribute("tabindex", "0");
		expect(tableRegion).not.toHaveClass("border", "rounded-basalt-md");
		expect(tableRegion.parentElement).toHaveAttribute("data-basalt-surface");
		expect(tableRegion.parentElement).not.toHaveClass("p-basalt-card");
		expect(alpha.closest("[data-basalt-surface]")).toBeNull();
		expect(screen.queryByRole("table", { name: "Beta props" })).not.toBeInTheDocument();
		expect(beta?.parentElement).toHaveTextContent("No component-specific props.");
		const empty = beta.parentElement?.querySelector("p");
		expect(empty).toHaveTextContent("No component-specific props.");
		expect(empty).toHaveClass("text-basalt-base");
		expect(empty).toHaveClass("text-basalt-muted-foreground");
		expect(empty?.closest("[data-basalt-surface]")).toHaveClass("p-basalt-card");
		expect(beta.closest("[data-basalt-surface]")).toBeNull();
	});

	it("keeps generic API notes inside their content islands", () => {
		render(
			<CatalogApiReference
				api={[
					{ name: "GenericEmpty", typeParameters: "<T>", props: [] },
					{
						name: "GenericTable",
						typeParameters: "<T extends string>",
						props: [{ name: "value", type: "T" }],
					},
				]}
			/>,
		);
		const emptyNotes = screen.getByText("<T>").closest("p");
		expect(emptyNotes?.parentElement).toHaveAttribute("data-basalt-surface");
		expect(emptyNotes?.parentElement).toHaveClass("p-basalt-card");
		const tableNotes = screen.getByText("<T extends string>").closest("p");
		expect(tableNotes?.parentElement).toHaveClass("border-b", "px-basalt-card");
		const tableIsland = tableNotes?.closest("[data-basalt-surface]");
		expect(tableIsland).not.toBeNull();
		expect(tableIsland).not.toHaveClass("p-basalt-card");
		expect(
			screen.getByRole("table", { name: "GenericTable props" }).closest("[data-basalt-surface]"),
		).toBe(tableIsland);
	});

	it("sources link-button API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS["link-button"]?.api).toEqual(CATALOG_API["link-button"]);
		expect(CATALOG_API["link-button"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"icon",
		]);
		renderCatalog("/ui/link-button");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		for (const prop of CATALOG_API["link-button"]?.[0]?.props ?? []) {
			expect(api).toHaveTextContent(prop.name);
			expect(api).toHaveTextContent(prop.type);
			expect(api).toHaveTextContent(`${prop.name}?`);
		}
		expect(api).not.toHaveTextContent("asChild");
		expect(api).not.toHaveTextContent("loading");
		expect(document.body.textContent).toContain('<LinkButton href="/docs">');
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const prop of CATALOG_API["link-button"]?.[0]?.props ?? []) {
			expect(markdown).toContain(`- ${prop.name} (${prop.type}, optional`);
		}
		expect(markdown).toContain('<LinkButton href="/docs">');
		expect(markdown).not.toContain("- href (");
	});

	it("does not keep a handwritten link-button prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/foundation.tsx"),
			"utf8",
		);
		expect(family).toContain("api: linkButtonApi");
		expect(family).not.toContain('name: "href"');
		expect(family).toContain('href="/docs"');
	});

	it("sources text API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.text?.api).toEqual(CATALOG_API.text);
		expect(CATALOG_API.text?.[0]?.props.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		renderCatalog("/ui/text");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(6);
		for (const prop of CATALOG_API.text?.[0]?.props ?? []) {
			expect(api).toHaveTextContent(prop.name);
			expect(api).toHaveTextContent(prop.type);
			expect(api).toHaveTextContent(`${prop.name}?`);
		}
		expect(api).not.toHaveTextContent("children");
		expect(api).not.toHaveTextContent("className");
		expect(document.body.textContent).toContain(
			'<Text variant="heading" as="h1">Page title</Text>',
		);
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Muted tone" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Semantic variants" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Bold and truncate" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const prop of CATALOG_API.text?.[0]?.props ?? []) {
			expect(markdown).toContain(`- ${prop.name} (${prop.type}, optional`);
		}
		expect(markdown).toContain('<Text variant="heading" as="h1">Page title</Text>');
		expect(markdown).toContain("- as (TextElement, optional, default —)");
		expect(markdown).not.toContain("- children (");
		for (const scenario of UI_EXAMPLES.text ?? []) {
			expect(markdown).toContain(scenario.code);
		}
	});

	it("does not keep a handwritten text prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/foundation.tsx"),
			"utf8",
		);
		expect(family).toContain("api: textApi");
		expect(family).toContain('<Text variant="heading" as="h1">Page title</Text>');
		expect(family).not.toContain('name: "variant"');
	});

	it("sources label API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.label?.api).toEqual(CATALOG_API.label);
		expect(CATALOG_API.label?.[0]?.props.map((prop) => prop.name)).toEqual([
			"showOptional",
			"tooltip",
		]);
		expect(CATALOG_API.label?.[0]?.props).toHaveLength(2);
		renderCatalog("/ui/label");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(2);
		for (const prop of CATALOG_API.label?.[0]?.props ?? []) {
			expect(api).toHaveTextContent(prop.name);
			expect(api).toHaveTextContent(prop.type);
			expect(api).toHaveTextContent(`${prop.name}?`);
			if (prop.description) {
				expect(api).toHaveTextContent(prop.description);
			}
		}
		expect(api).toHaveTextContent("false");
		expect(api).not.toHaveTextContent("htmlFor");
		expect(api).not.toHaveTextContent("children");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("asContent");
		expect(document.body.textContent).toContain('<Label htmlFor="email">Email</Label>');
		expect(screen.getByRole("heading", { name: "Default Label" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Optional Field" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "With Tooltip" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const prop of CATALOG_API.label?.[0]?.props ?? []) {
			expect(markdown).toContain(`- ${prop.name} (${prop.type}, optional`);
			if (prop.description) {
				expect(markdown).toContain(prop.description);
			}
		}
		expect(markdown).toContain("default false");
		expect(markdown).toContain('<Label htmlFor="email">Email</Label>');
		expect(markdown).not.toContain("- htmlFor (");
		expect(markdown).not.toContain("- children (");
		expect(markdown).not.toContain("- asContent (");
	});

	it("does not keep a handwritten label prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/foundation.tsx"),
			"utf8",
		);
		expect(family).toContain("api: labelApi");
		expect(family).toContain('<Label htmlFor="email">Email</Label>');
	});

	it("sources separator API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.separator?.api).toEqual(CATALOG_API.separator);
		expect(CATALOG_API.separator?.[0]?.props.map((prop) => prop.name)).toEqual([
			"orientation",
			"decorative",
		]);
		expect(CATALOG_API.separator?.[0]?.props).toHaveLength(2);
		renderCatalog("/ui/separator");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(2);
		for (const prop of CATALOG_API.separator?.[0]?.props ?? []) {
			expect(api).toHaveTextContent(prop.name);
			expect(api).toHaveTextContent(prop.type);
			expect(api).toHaveTextContent(`${prop.name}?`);
			if (prop.description) {
				expect(api).toHaveTextContent(prop.description);
			}
			if (prop.default) {
				expect(api).toHaveTextContent(prop.default);
			}
		}
		expect(api).not.toHaveTextContent("asChild");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("children");
		expect(api).not.toHaveTextContent("htmlFor");
		expect(document.body.textContent).toContain("<Separator orientation='horizontal' />");
		expect(screen.getByRole("heading", { name: "Horizontal" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const prop of CATALOG_API.separator?.[0]?.props ?? []) {
			expect(markdown).toContain(`- ${prop.name} (${prop.type}, optional`);
			if (prop.description) {
				expect(markdown).toContain(prop.description);
			}
		}
		expect(markdown).toContain("default horizontal");
		expect(markdown).toContain("default true");
		expect(markdown).toContain("<Separator orientation='horizontal' />");
		expect(markdown).not.toContain("- asChild (");
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- children (");
	});

	it("does not keep a handwritten separator prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/foundation.tsx"),
			"utf8",
		);
		expect(family).toContain("api: separatorApi");
		expect(family).toContain("<Separator orientation='horizontal' />");
	});

	it("keeps ScrollArea docs, generated API, source examples, and Copy page aligned", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const docs = CATALOG_DOCS["scroll-area"];
		expect(docs?.api).toBe(CATALOG_API["scroll-area"]);
		expect(docs).toMatchObject({
			description:
				"A keyboard-accessible viewport for vertically, horizontally, or bidirectionally overflowing content.",
			variants: ["vertical", "horizontal", "both"],
		});
		expect(CATALOG_API["scroll-area"]).toEqual([
			{
				name: "ScrollArea",
				props: [
					{
						name: "className",
						type: "string",
						required: false,
						description: "Classes applied to the non-scrolling root.",
					},
					{
						name: "orientation",
						type: "ScrollAreaOrientation",
						required: false,
						default: '"vertical"',
						description: "Axes that may scroll.",
					},
					{
						name: "viewportClassName",
						type: "string",
						required: false,
						description: "Classes applied to the actual scrolling viewport.",
					},
				],
			},
		]);
		expect(UI_EXAMPLES["scroll-area"]?.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "scroll-area-vertical-list", title: "Vertical list" },
			{ id: "scroll-area-horizontal-row", title: "Horizontal row" },
		]);

		renderCatalog("/ui/scroll-area");
		const api = document.getElementById("api-reference");
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(3);
		expect(screen.getByRole("heading", { name: "Vertical list" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Horizontal row" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="scroll-area-vertical-list"]');
		const horizontal = document.querySelector('[data-scenario="scroll-area-horizontal-row"]');
		expect(hero).toBeTruthy();
		expect(horizontal).toBeTruthy();
		if (!hero || !horizontal) {
			throw new Error("missing ScrollArea scenarios");
		}
		expect(
			within(hero as HTMLElement).getByRole("region", { name: "Recent activity" }),
		).toHaveAttribute("data-orientation", "vertical");
		expect(
			within(horizontal as HTMLElement).getByRole("region", { name: "Delivery stages" }),
		).toHaveAttribute("data-orientation", "horizontal");
		for (const scenario of UI_EXAMPLES["scroll-area"] ?? []) {
			expect(scenario.code).toContain("@nocoo/basalt/components/scroll-area");
			expect(scenario.code).toContain("export default function");
			expect(document.querySelector(`[data-scenario="${scenario.id}"]`)).toBeTruthy();
		}

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### ScrollArea");
		expect(markdown).toContain(
			'- orientation (ScrollAreaOrientation, optional, default "vertical"): Axes that may scroll.',
		);
		for (const scenario of UI_EXAMPLES["scroll-area"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toContain("- onScroll (");
		expect(markdown).not.toContain("- tabIndex (");
		expect(markdown).not.toContain("- aria-label (");
	});

	it("keeps SegmentControl docs, generated API, source examples, and Copy page aligned", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const docs = CATALOG_DOCS["segment-control"];
		expect(docs?.api).toBe(CATALOG_API["segment-control"]);
		expect(docs).toMatchObject({
			description:
				"A controlled or uncontrolled, labelled segmented filter with an optional All choice and horizontal overflow.",
			variants: ["all", "overflow", "disabled"],
		});
		expect(CATALOG_API["segment-control"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"value",
			"defaultValue",
			"onValueChange",
			"legend",
			"options",
			"allOption",
			"disabled",
		]);
		expect(UI_EXAMPLES["segment-control"]?.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "segment-control-controlled-status", title: "Controlled status filter" },
			{ id: "segment-control-with-legend", title: "With optional legend" },
			{ id: "segment-control-overflow-disabled", title: "Overflow and disabled" },
		]);

		renderCatalog("/ui/segment-control");
		const api = document.getElementById("api-reference");
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(7);
		const statusHero = document.querySelector(
			'[data-hero-scenario="segment-control-controlled-status"]',
		);
		expect(statusHero).toBeTruthy();
		if (!statusHero) {
			throw new Error("missing SegmentControl hero");
		}
		const statusGroup = within(statusHero as HTMLElement).getByRole("radiogroup", {
			name: "Status",
		});
		fireEvent.click(within(statusGroup).getByRole("radio", { name: "Ready" }));
		expect(within(statusGroup).getByRole("radio", { name: "Ready" })).toHaveAttribute(
			"aria-checked",
			"true",
		);
		expect(screen.getByRole("radio", { name: "90 days" })).toBeDisabled();
		const overflowScenario = document.querySelector(
			'[data-scenario="segment-control-overflow-disabled"]',
		);
		expect(
			overflowScenario?.querySelector('[data-slot="segment-control-viewport"]')?.className,
		).toContain("overflow-x-auto");
		for (const scenario of UI_EXAMPLES["segment-control"] ?? []) {
			expect(scenario.code).toContain("@nocoo/basalt/components/segment-control");
			expect(document.querySelector(`[data-scenario="${scenario.id}"]`)).toBeTruthy();
		}

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### SegmentControl");
		expect(markdown).toContain(
			"- value (string, optional, default —): The currently selected value.",
		);
		expect(markdown).toContain(
			"- defaultValue (string, optional, default —): Uncontrolled initial selected value.",
		);
		expect(markdown).toContain("- allOption (SegmentControlAllOption, optional, default —)");
		for (const scenario of UI_EXAMPLES["segment-control"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toContain("- children (");
	});

	it("keeps PageHeader docs, generated API, source examples, and Copy page aligned", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const docs = CATALOG_DOCS["page-header"];
		expect(docs?.api).toBe(CATALOG_API["page-header"]);
		expect(docs).toMatchObject({
			description:
				"A flush content page heading with optional description, actions, and a separate filters row.",
			variants: [],
		});
		expect(CATALOG_API["page-header"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"title",
			"description",
			"breadcrumbs",
			"actions",
			"filters",
			"size",
			"className",
		]);
		expect(UI_EXAMPLES["page-header"]?.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "page-header-default", title: "Default" },
			{ id: "page-header-reading", title: "Reading-focused page" },
			{ id: "page-header-long-responsive-content", title: "Long responsive content" },
		]);

		renderCatalog("/ui/page-header");
		const api = document.getElementById("api-reference");
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(7);
		const hero = document.querySelector('[data-hero-scenario="page-header-default"]');
		expect(hero).toBeTruthy();
		if (!hero) {
			throw new Error("missing PageHeader hero");
		}
		expect(
			within(hero as HTMLElement).getByRole("heading", { level: 1, name: "Dashboard" }),
		).toBeInTheDocument();
		expect(
			within(hero as HTMLElement).getByRole("navigation", { name: "Breadcrumb" }),
		).toBeInTheDocument();
		const longContent = document.querySelector(
			'[data-scenario="page-header-long-responsive-content"]',
		);
		expect(longContent).toBeTruthy();
		if (!longContent) {
			throw new Error("missing PageHeader long content");
		}
		expect(
			within(longContent as HTMLElement).getByRole("heading", {
				level: 1,
				name: "Quarterly operations review for the north-region delivery network",
			}),
		).toBeInTheDocument();
		expect(
			within(longContent as HTMLElement).getByRole("button", { name: "Create report" }),
		).toBeInTheDocument();
		for (const scenario of UI_EXAMPLES["page-header"] ?? []) {
			expect(scenario.code).toContain("@nocoo/basalt/components/page-header");
			expect(scenario.code).toContain("export default function");
			expect(document.querySelector(`[data-scenario="${scenario.id}"]`)).toBeTruthy();
		}

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### PageHeader");
		expect(markdown).toContain("- title (React.ReactNode, required, default —)");
		expect(markdown).toContain(
			"- breadcrumbs (readonly PageHeaderBreadcrumb[], optional, default —)",
		);
		for (const scenario of UI_EXAMPLES["page-header"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('- size ("lg" | "md", optional, default "lg")');
		expect(markdown).toContain("- className (string, optional, default —)");
		expect(markdown).not.toContain("- children (");
	});

	it("keeps SectionRule docs, generated API, source examples, and Copy page aligned", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const docs = CATALOG_DOCS["section-rule"];
		expect(docs?.api).toBe(CATALOG_API["section-rule"]);
		expect(docs).toMatchObject({
			description: "Compact labels or reading-focused headings between page regions.",
			variants: [],
		});
		expect(CATALOG_API["section-rule"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"variant",
			"title",
			"hint",
			"actions",
		]);
		expect(UI_EXAMPLES["section-rule"]?.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "section-rule-default", title: "Default" },
			{ id: "section-rule-with-hint", title: "With hint" },
			{ id: "section-rule-with-actions", title: "With actions" },
			{ id: "section-rule-with-hint-and-actions", title: "Hint and actions" },
			{ id: "section-rule-stacked-regions", title: "Stacked regions" },
		]);

		renderCatalog("/ui/section-rule");
		const api = document.getElementById("api-reference");
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(4);
		const hero = document.querySelector('[data-hero-scenario="section-rule-default"]');
		expect(hero).toBeTruthy();
		if (!hero) {
			throw new Error("missing SectionRule hero");
		}
		expect(
			within(hero as HTMLElement).getByRole("heading", { level: 2, name: "Catalog" }),
		).toBeInTheDocument();
		expect(
			within(hero as HTMLElement).queryByRole("button", { name: "More information" }),
		).toBeNull();
		const hinted = document.querySelector('[data-scenario="section-rule-with-hint"]');
		expect(hinted).toBeTruthy();
		if (!hinted) {
			throw new Error("missing SectionRule hint");
		}
		expect(
			within(hinted as HTMLElement).getByRole("button", { name: "More information" }),
		).toBeInTheDocument();
		const stacked = document.querySelector('[data-scenario="section-rule-stacked-regions"]');
		expect(stacked).toBeTruthy();
		if (!stacked) {
			throw new Error("missing SectionRule stacked regions");
		}
		expect(
			within(stacked as HTMLElement).getByRole("button", { name: "New appointment" }),
		).toBeInTheDocument();
		for (const scenario of UI_EXAMPLES["section-rule"] ?? []) {
			expect(scenario.code).toContain("@nocoo/basalt/components/section-rule");
			expect(scenario.code).toContain("export default function");
			expect(document.querySelector(`[data-scenario="${scenario.id}"]`)).toBeTruthy();
		}

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### SectionRule");
		expect(markdown).toContain("- title (React.ReactNode, required, default —)");
		expect(markdown).toContain("- hint (React.ReactNode, optional, default —)");
		for (const scenario of UI_EXAMPLES["section-rule"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- children (");
	});

	it("keeps ConfirmDialog docs, generated API, source examples, and Copy page aligned", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const docs = CATALOG_DOCS["confirm-dialog"];
		expect(docs?.api).toBe(CATALOG_API["confirm-dialog"]);
		expect(docs).toMatchObject({
			description:
				"A controlled confirmation dialog with explicit loading, focus restoration to opener, and a Promise-based hook. The caller controls open/loading and is responsible for handling asynchronous action errors.",
			variants: ["default", "destructive"],
		});
		expect(CATALOG_API["confirm-dialog"]?.map((surface) => surface.name)).toEqual([
			"ConfirmDialog",
			"useConfirm",
		]);
		expect(UI_EXAMPLES["confirm-dialog"]?.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "confirm-dialog-controlled-async-loading", title: "Controlled async loading" },
			{ id: "confirm-dialog-promise-result", title: "Promise result" },
		]);

		renderCatalog("/ui/confirm-dialog");
		const api = document.getElementById("api-reference");
		expect(api?.querySelectorAll("h3").length).toBe(2);
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(18);
		expect(api).toHaveTextContent("onCloseAutoFocus");
		const hero = document.querySelector(
			'[data-hero-scenario="confirm-dialog-controlled-async-loading"]',
		);
		expect(hero).toBeTruthy();
		if (!hero) {
			throw new Error("missing ConfirmDialog hero");
		}
		expect(
			within(hero as HTMLElement).getByRole("button", { name: "Delete care plan" }),
		).toBeInTheDocument();
		const promiseResult = document.querySelector('[data-scenario="confirm-dialog-promise-result"]');
		expect(promiseResult).toBeTruthy();
		if (!promiseResult) {
			throw new Error("missing ConfirmDialog promise example");
		}
		expect(
			within(promiseResult as HTMLElement).getByRole("button", { name: "Archive report" }),
		).toBeInTheDocument();
		for (const scenario of UI_EXAMPLES["confirm-dialog"] ?? []) {
			expect(scenario.code).toContain("@nocoo/basalt/components/confirm-dialog");
			expect(scenario.code).toContain("export default function");
			expect(document.querySelector(`[data-scenario="${scenario.id}"]`)).toBeTruthy();
		}

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### ConfirmDialog");
		expect(markdown).toContain("### useConfirm");
		expect(markdown).toContain("- onConfirm (() => void | Promise<void>, required, default —)");
		expect(markdown).toContain("- title (React.ReactNode, required, default —)");
		for (const scenario of UI_EXAMPLES["confirm-dialog"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toContain("- children (");
	});

	it("keeps TablePager docs, generated API, source examples, and Copy page aligned", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const docs = CATALOG_DOCS["table-pager"];
		expect(docs?.api).toBe(CATALOG_API["table-pager"]);
		expect(docs).toMatchObject({
			description: "A table footer that pairs a result range with page controls.",
			variants: [],
		});
		expect(CATALOG_API["table-pager"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"page",
			"defaultPage",
			"pageSize",
			"totalCount",
			"onPageChange",
			"disabled",
			"formatRange",
			"className",
		]);
		expect(UI_EXAMPLES["table-pager"]?.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "table-pager-range-navigation", title: "Range navigation" },
			{ id: "table-pager-disabled-and-localized", title: "Disabled and localized" },
		]);

		renderCatalog("/ui/table-pager");
		const api = document.getElementById("api-reference");
		expect(api?.querySelectorAll("h3").length).toBe(1);
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(8);
		const hero = document.querySelector('[data-hero-scenario="table-pager-range-navigation"]');
		expect(hero).toBeTruthy();
		if (!hero) {
			throw new Error("missing TablePager hero");
		}
		expect(within(hero as HTMLElement).getByText("Showing 11–20 of 47")).toBeInTheDocument();
		const localized = document.querySelector(
			'[data-scenario="table-pager-disabled-and-localized"]',
		);
		expect(localized).toBeTruthy();
		if (!localized) {
			throw new Error("missing TablePager localized example");
		}
		expect(
			within(localized as HTMLElement).getByText("Showing 1,001–2,000 of 1,234,567"),
		).toBeInTheDocument();
		expect(
			within(localized as HTMLElement).getByRole("button", { name: "Next page" }),
		).toBeDisabled();
		for (const scenario of UI_EXAMPLES["table-pager"] ?? []) {
			expect(scenario.code).toContain("@nocoo/basalt/components/table-pager");
			expect(scenario.code).toContain("export default function");
			expect(document.querySelector(`[data-scenario="${scenario.id}"]`)).toBeTruthy();
		}

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### TablePager");
		expect(markdown).toContain("- page (number, optional, default —)");
		expect(markdown).toContain("- defaultPage (number, optional, default 1)");
		expect(markdown).toContain(
			"- formatRange ((range: TablePagerRange) => React.ReactNode, optional, default —)",
		);
		for (const scenario of UI_EXAMPLES["table-pager"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toContain("- children (");
	});

	it("sources link API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.link?.api).toEqual(CATALOG_API.link);
		expect(CATALOG_API.link?.[0]?.props.map((prop) => prop.name)).toEqual(["href"]);
		expect(CATALOG_API.link).toEqual([
			{
				name: "Link",
				props: [
					{
						name: "href",
						type: "string",
						required: true,
						description: "The link destination.",
					},
				],
			},
		]);
		renderCatalog("/ui/link");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(1);
		expect(api).toHaveTextContent("href");
		expect(api).not.toHaveTextContent("href?");
		expect(api).toHaveTextContent("string");
		expect(api).toHaveTextContent("The link destination.");
		expect(api).toHaveTextContent("—");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("children");
		expect(api).not.toHaveTextContent("target");
		expect(api).not.toHaveTextContent("rel");
		expect(api).not.toHaveTextContent("download");
		expect(document.body.textContent).toContain(
			`<LinkProvider>
	<Link href="/ui">Library</Link>
</LinkProvider>`,
		);
		expect(screen.getByRole("heading", { name: "Basic Link" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Inline in Paragraph" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "External Links" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("- href (string, required, default —): The link destination.");
		expect(markdown).toContain(`<LinkProvider>
	<Link href="/ui">Library</Link>
</LinkProvider>`);
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- children (");
		expect(markdown).not.toContain("- target (");
		expect(markdown).not.toContain("- rel (");
		expect(markdown).not.toContain("- download (");
	});

	it("does not keep a handwritten link prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/foundation.tsx"),
			"utf8",
		);
		expect(family).toContain("api: linkApi");
		expect(family).toContain(`<LinkProvider>
	<Link href="/ui">Library</Link>
</LinkProvider>`);
	});

	it("sources tooltip API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.tooltip?.api).toEqual(CATALOG_API.tooltip);
		expect(CATALOG_API.tooltip?.[0]?.props.map((prop) => prop.name)).toEqual([
			"children",
			"open",
			"defaultOpen",
			"onOpenChange",
			"delayDuration",
			"disableHoverableContent",
		]);
		expect(CATALOG_API.tooltip?.map((surface) => surface.name)).toEqual([
			"Tooltip",
			"TooltipProvider",
			"TooltipTrigger",
			"TooltipContent",
		]);
		renderCatalog("/ui/tooltip");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api).toHaveTextContent("delayDuration?");
		expect(api).toHaveTextContent("TooltipProvider");
		expect(api).toHaveTextContent("TooltipTrigger");
		expect(api).toHaveTextContent("TooltipContent");
		expect(document.body.textContent).toContain(
			`<TooltipProvider>
	<Tooltip>
		<TooltipTrigger asChild>
			<Button>Hover</Button>
		</TooltipTrigger>
		<TooltipContent>Hint</TooltipContent>
	</Tooltip>
</TooltipProvider>`,
		);
		expect(screen.getByRole("heading", { name: "Basic Tooltip" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Multiple Tooltips" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### Tooltip");
		expect(markdown).toContain("### TooltipProvider");
		expect(markdown).toContain("### TooltipTrigger");
		expect(markdown).toContain("### TooltipContent");
		expect(markdown).toContain(
			"- delayDuration (number, optional, default 700): Default delay before tooltips open when pointer enters a trigger, in milliseconds.\nCan be overridden per tooltip instance via Tooltip.",
		);
		expect(markdown).toContain(
			`<TooltipProvider>
	<Tooltip>
		<TooltipTrigger asChild>
			<Button>Hover</Button>
		</TooltipTrigger>
		<TooltipContent>Hint</TooltipContent>
	</Tooltip>
</TooltipProvider>`,
		);
	});

	it("does not keep a handwritten tooltip prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/overlay.tsx"),
			"utf8",
		);
		const start = family.indexOf("\ttooltip: {");
		const end = family.indexOf("\taccordion: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = family.slice(start, end);
		expect(block).toContain("api: tooltipApi");
		expect(block).not.toContain('name: "delayDuration"');
		expect(block).toContain(
			`<TooltipProvider>
	<Tooltip>
		<TooltipTrigger asChild>
			<Button>Hover</Button>
		</TooltipTrigger>
		<TooltipContent>Hint</TooltipContent>
	</Tooltip>
</TooltipProvider>`,
		);
	});

	it("sources theme-toggle API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS["theme-toggle"]?.api).toEqual(CATALOG_API["theme-toggle"]);
		expect(CATALOG_API["theme-toggle"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"aria-label",
			"tooltip",
			"labels",
		]);
		expect(CATALOG_API["theme-toggle"]).toEqual([
			{
				name: "ThemeToggle",
				props: [
					{
						name: "aria-label",
						type: "string",
						required: false,
						description:
							"Fixed accessible name. Defaults to the label of the theme the next click switches to.",
					},
					{
						name: "tooltip",
						type: "boolean",
						required: false,
						default: "true",
						description: "Show a bottom tooltip naming the theme the next click switches to.",
					},
					{
						name: "labels",
						type: "Partial<ThemeToggleLabels>",
						required: false,
						description:
							"Labels naming each next theme (`light`, `dark`, `system`); omitted keys keep the English\ndefaults.",
					},
				],
			},
		]);
		renderCatalog("/ui/theme-toggle");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(3);
		expect(api).toHaveTextContent("aria-label");
		expect(api).toHaveTextContent("string");
		expect(api).toHaveTextContent("Fixed accessible name.");
		expect(api).toHaveTextContent("Partial<ThemeToggleLabels>");
		expect(api).toHaveTextContent("—");
		expect(api).not.toHaveTextContent("variant");
		expect(api).not.toHaveTextContent("size");
		expect(api).not.toHaveTextContent("loading");
		expect(api).not.toHaveTextContent("asChild");
		expect(api).not.toHaveTextContent("className");
		expect(document.body.textContent).toContain(
			`<ThemeProvider persist={false} applyToDocument={false}>
	<ThemeToggle aria-label="Toggle theme" />
</ThemeProvider>`,
		);
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(
			"- aria-label (string, optional, default —): Fixed accessible name.",
		);
		expect(markdown).toContain(
			`<ThemeProvider persist={false} applyToDocument={false}>
	<ThemeToggle aria-label="Toggle theme" />
</ThemeProvider>`,
		);
		expect(markdown).toContain(
			"- tooltip (boolean, optional, default true): Show a bottom tooltip",
		);
		expect(markdown).not.toContain("- variant (");
		expect(markdown).not.toContain("- size (");
		expect(markdown).not.toContain("- loading (");
		expect(markdown).not.toContain("- asChild (");
		expect(markdown).not.toContain("- className (");
	});

	it("does not keep a handwritten theme-toggle prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/foundation.tsx"),
			"utf8",
		);
		expect(family).toContain("api: themeToggleApi");
		expect(family).toContain(
			`<ThemeProvider persist={false} applyToDocument={false}>
	<ThemeToggle aria-label="Toggle theme" />
</ThemeProvider>`,
		);
	});

	it("sources layer-card API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS["layer-card"]?.api).toEqual(CATALOG_API["layer-card"]);
		expect(CATALOG_API["layer-card"]?.map((surface) => surface.name)).toEqual([
			"LayerCard",
			"LayerCard.Header",
			"LayerCard.Title",
			"LayerCard.Description",
			"LayerCard.Body",
			"LayerCard.Well",
			"LayerCard.Footer",
			"LayerCard.Loading",
			"LayerCard.Empty",
		]);
		expect(
			CATALOG_API["layer-card"]?.map((surface) => surface.props.map((prop) => prop.name)),
		).toEqual([
			["asChild", "className", "outlined", "padding"],
			["asChild", "divided"],
			["asChild", "className"],
			[],
			[],
			["outlined"],
			[],
			["label"],
			["title", "description", "icon", "action", "children"],
		]);
		renderCatalog("/ui/layer-card");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(15);
		expect(api).toHaveTextContent("asChild?");
		expect(api).toHaveTextContent("className?");
		expect(api).toHaveTextContent("outlined?");
		expect(api).toHaveTextContent("padding?");
		expect(api).toHaveTextContent("LayerCard.Well");
		expect(api).toHaveTextContent("LayerCard.Loading");
		expect(api).toHaveTextContent("LayerCard.Empty");
		expect(screen.getByRole("heading", { name: "Nested Surfaces" })).toBeInTheDocument();
		expect(api).toHaveTextContent("string");
		expect(api).toHaveTextContent("Additional classes for the card root.");
		expect(api).toHaveTextContent("—");
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(15);
		expect(api).toHaveTextContent("asChild?");
		expect(within(api as HTMLElement).queryByRole("cell", { name: /^id\??$/ })).toBeNull();
		expect(within(api as HTMLElement).queryByRole("cell", { name: /^style\??$/ })).toBeNull();
		expect(within(api as HTMLElement).queryByRole("cell", { name: /^role\??$/ })).toBeNull();
		expect(api).not.toHaveTextContent("LayerCardSectionProps");
		expect(document.body.textContent).toContain(
			`<LayerCard>
	<LayerCard.Header>Title</LayerCard.Header>
	<LayerCard.Body>Content</LayerCard.Body>
	<LayerCard.Footer>Actions</LayerCard.Footer>
</LayerCard>`,
		);
		expect(screen.getByRole("heading", { name: "Basic Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Surface-style Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Multiple Cards" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Structured Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Loading and Empty" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(
			"- className (string, optional, default —): Additional classes for the card root.",
		);
		expect(markdown).toContain(
			'- padding ("lg" | "md" | "none" | "sm" | "xl", optional, default "md"): Inner spacing for unstructured card content.',
		);
		expect(markdown).toContain("### LayerCard.Loading");
		expect(markdown).toContain("### LayerCard.Empty");
		expect(markdown).toContain(
			`<LayerCard>
	<LayerCard.Header>Title</LayerCard.Header>
	<LayerCard.Body>Content</LayerCard.Body>
	<LayerCard.Footer>Actions</LayerCard.Footer>
</LayerCard>`,
		);
		expect(markdown).toContain(
			"- children (React.ReactNode, optional, default —): Custom supporting content or custom layout rendered between description and action.",
		);
		expect(markdown).not.toContain("- id (");
		expect(markdown).not.toContain("- style (");
		expect(markdown).not.toContain("- role (");
		expect(markdown).not.toContain("LayerCardSectionProps");
	});

	it("does not keep a handwritten layer-card prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/foundation.tsx"),
			"utf8",
		);
		expect(family).toContain("api: layerCardApi");
		expect(family).toContain(
			`<LayerCard>
	<LayerCard.Header>Title</LayerCard.Header>
	<LayerCard.Body>Content</LayerCard.Body>
	<LayerCard.Footer>Actions</LayerCard.Footer>
</LayerCard>`,
		);
	});

	it("sources field API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.field?.api).toEqual(CATALOG_API.field);
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
		renderCatalog("/ui/field");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(8);
		expect(api).toHaveTextContent("label");
		expect(api).not.toHaveTextContent("label?");
		expect(api).toHaveTextContent("htmlFor?");
		expect(api).toHaveTextContent("hint?");
		expect(api).toHaveTextContent("error?");
		expect(api).toHaveTextContent("required?");
		expect(api).toHaveTextContent("labelTooltip?");
		expect(api).toHaveTextContent("className?");
		expect(api).toHaveTextContent("children");
		expect(api).not.toHaveTextContent("children?");
		expect(api).toHaveTextContent("Visible label.");
		expect(api).toHaveTextContent("Associates the label and described-by ids.");
		expect(api).toHaveTextContent("Supporting text when there is no error.");
		expect(api).toHaveTextContent("Replaces the hint and marks the control invalid.");
		expect(api).toHaveTextContent("When false, show (optional) after the label.");
		expect(api).toHaveTextContent("Info icon with hover text on the label.");
		expect(api).toHaveTextContent("Additional classes for the field root.");
		expect(api).toHaveTextContent("The control or content to render.");
		expect(api).toHaveTextContent("React.ReactNode");
		expect(api).toHaveTextContent("FieldError");
		expect(screen.getByRole("heading", { name: "Hint" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Rich label and optional" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Structured error" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="field-hint"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("- label (React.ReactNode, required, default —): Visible label.");
		expect(markdown).toContain(
			"- htmlFor (string, optional, default —): Associates the label and described-by ids.",
		);
		expect(markdown).toContain(
			"- hint (React.ReactNode, optional, default —): Supporting text when there is no error.",
		);
		expect(markdown).toContain(
			"- error (FieldError, optional, default —): Replaces the hint and marks the control invalid.",
		);
		expect(markdown).toContain(
			"- required (boolean, optional, default —): When false, show (optional) after the label.",
		);
		expect(markdown).toContain(
			"- labelTooltip (React.ReactNode, optional, default —): Info icon with hover text on the label.",
		);
		expect(markdown).toContain(
			"- className (string, optional, default —): Additional classes for the field root.",
		);
		expect(markdown).toContain(
			"- children (React.ReactNode, required, default —): The control or content to render.",
		);
		expect(markdown).toContain(UI_EXAMPLES.field?.[0]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES.field?.[1]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES.field?.[2]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES.field?.[3]?.code ?? "");
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not keep a handwritten field prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		expect(family).toContain("api: fieldApi");
		expect(family).not.toContain('name: "label"');
		expect(family).not.toContain('name: "htmlFor"');
		expect(family).toContain(
			'description: "Accessible association and metadata for a labeled control."',
		);
		expect(family).toContain(`<Field label="Email">
	<Input />
</Field>`);
		expect(family).toContain('repo: "kumo"');
		expect(family).toContain("packages/kumo/src/components/field/field.tsx");
	});

	it("sources input API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.input?.api).toEqual(CATALOG_API.input);
		expect(CATALOG_API.input).toEqual([
			{
				name: "Input",
				props: [
					{
						name: "type",
						type: "React.HTMLInputTypeAttribute",
						required: false,
						description: "The type of input control to render.",
					},
					{
						name: "size",
						type: "InputSize",
						required: false,
						default: '"md"',
						description: "The visual size of the input.",
					},
					{
						name: "passwordManagerIgnore",
						type: "boolean",
						required: false,
						default: "false",
						description: "Ignore password managers on this field.",
					},
				],
			},
		]);
		renderCatalog("/ui/input");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(3);
		expect(api).toHaveTextContent("type?");
		expect(api).toHaveTextContent("React.HTMLInputTypeAttribute");
		expect(api).toHaveTextContent("The type of input control to render.");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("InputSize");
		expect(api).toHaveTextContent("passwordManagerIgnore?");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("placeholder");
		expect(api).not.toHaveTextContent("onChange");
		expect(screen.getByRole("heading", { name: "With Label and Description" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and reset" })).toBeInTheDocument();
		expect(
			document.querySelector('[data-hero-scenario="input-with-label-and-description"]'),
		).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-input-types"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-sizes"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-controlled-and-reset"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(
			"- type (React.HTMLInputTypeAttribute, optional, default —): The type of input control to render.",
		);
		expect(markdown).toContain(
			'- size (InputSize, optional, default "md"): The visual size of the input.',
		);
		expect(markdown).toContain(
			"- passwordManagerIgnore (boolean, optional, default false): Ignore password managers on this field.",
		);
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- placeholder (");
		expect(markdown).toContain(UI_EXAMPLES.input?.[0]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES.input?.[3]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES.input?.[5]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES.input?.[6]?.code ?? "");
		expect(markdown).toContain('<div className="flex w-full flex-col gap-basalt-space-lg">');
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not keep a handwritten input prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		expect(family).toContain("api: inputApi");
		expect(family).not.toContain('name: "type"');
		expect(family).toContain(
			'description: "A sized native single-line control on the L3 surface."',
		);
		expect(family).toContain('<Input aria-label="Name" placeholder="Jane Doe" />');
		expect(family).toContain('variants: ["sm", "md", "lg"]');
		expect(family).toContain('repo: "kumo"');
		expect(family).toContain('sha: "1159868dfe32"');
		expect(family).toContain('file: "packages/kumo/src/components/input/input.tsx"');
	});

	it("sources textarea API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.textarea?.api).toEqual(CATALOG_API.textarea);
		expect(CATALOG_API.textarea).toEqual([
			{
				name: "Textarea",
				props: [
					{
						name: "rows",
						type: "number",
						required: false,
						description: "The visible text row count.",
					},
					{
						name: "size",
						type: "TextareaSize",
						required: false,
						default: '"md"',
						description: "The visual size of the text area.",
					},
					{
						name: "autoResize",
						type: "boolean",
						required: false,
						default: "false",
						description:
							"Grow vertically with typed content instead of showing an internal scrollbar until clamped by `maxRows`.",
					},
					{
						name: "maxRows",
						type: "number",
						required: false,
						description:
							"Maximum line count when `autoResize` is enabled before scrolling internally.",
					},
					{
						name: "passwordManagerIgnore",
						type: "boolean",
						required: false,
						default: "false",
						description: "Ignore password managers on this field.",
					},
				],
			},
		]);
		renderCatalog("/ui/textarea");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(5);
		expect(api).toHaveTextContent("rows?");
		expect(api).toHaveTextContent("number");
		expect(api).toHaveTextContent("The visible text row count.");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("TextareaSize");
		expect(api).toHaveTextContent("autoResize?");
		expect(api).toHaveTextContent("maxRows?");
		expect(api).toHaveTextContent("passwordManagerIgnore?");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("placeholder");
		expect(api).not.toHaveTextContent("onChange");
		expect(screen.getByRole("heading", { name: "With Label" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Auto Resize" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and reset" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="textarea-with-label"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="textarea-custom-row-count"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="textarea-auto-resize"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="textarea-error-state-string"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="textarea-disabled"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="textarea-sizes"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="textarea-controlled-and-reset"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("- rows (number, optional, default —): The visible text row count.");
		expect(markdown).toContain(
			'- size (TextareaSize, optional, default "md"): The visual size of the text area.',
		);
		expect(markdown).toContain("- autoResize (boolean, optional, default false):");
		expect(markdown).toContain("- maxRows (number, optional, default —):");
		expect(markdown).toContain(
			"- passwordManagerIgnore (boolean, optional, default false): Ignore password managers on this field.",
		);
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- placeholder (");
		expect(markdown).toContain(UI_EXAMPLES.textarea?.[0]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES.textarea?.[1]?.code ?? "");
		expect(markdown).toContain("rows={6}");
		expect(markdown).toContain("htmlFor={id}");
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not keep a handwritten textarea prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		expect(family).toContain("api: textareaApi");
		expect(family).not.toContain('name: "rows"');
		expect(family).toContain(
			'description:\n\t\t\t\t"A sized native multi-line control on the L3 surface with optional content-driven auto-resize."',
		);
		expect(family).toContain('<Textarea aria-label="Notes" placeholder="Write a note" />');
		expect(family).toContain('variants: ["sm", "md", "lg"]');
		expect(family).toContain('repo: "kumo"');
		expect(family).toContain('sha: "1159868dfe32"');
		expect(family).toContain('file: "packages/kumo/src/components/input-area/input-area.tsx"');
	});

	it("does not keep a handwritten input-group prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		expect(family).toContain("api: inputGroupApi");
		expect(family).not.toContain('name: "InputGroup.Input"');
		expect(family).not.toContain("The editable value.");
		expect(family).toContain(
			'description: "Compose an input with addons, an inline suffix, and status icons."',
		);
		expect(family).toContain(
			`<InputGroup>
	<InputGroup.Input defaultValue="atlas" aria-label="Subdomain" />
	<InputGroup.Suffix>.example.com</InputGroup.Suffix>
</InputGroup>`,
		);
		expect(family).toContain('repo: "basalt"');
		expect(family).toContain('sha: "2727ae6a8d3f"');
		expect(family).toContain('file: "src/pages/FormsPage.tsx"');
	});

	it("sources sensitive-input API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS["sensitive-input"]?.api).toEqual(CATALOG_API["sensitive-input"]);
		expect(CATALOG_API["sensitive-input"]).toEqual([
			{
				name: "SensitiveInput",
				props: [
					{
						name: "revealLabel",
						type: "string",
						required: true,
						description: "Accessible label for the reveal action.",
					},
					{
						name: "hideLabel",
						type: "string",
						required: true,
						description: "Accessible label for the hide action.",
					},
					{
						name: "size",
						type: "InputSize",
						required: false,
						default: '"md"',
						description: "The visual size of the field.",
					},
					{
						name: "passwordManagerIgnore",
						type: "boolean",
						required: false,
						default: "false",
						description: "Ignore password managers on this field.",
					},
				],
			},
		]);
		renderCatalog("/ui/sensitive-input");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(document.getElementById("api-SensitiveInput")?.tagName).toBe("H3");
		expect(document.querySelector('[data-toc-id="api-SensitiveInput"]')).toBeTruthy();
		expect(screen.getByRole("heading", { name: "SensitiveInput" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SensitiveInput props" })).toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(4);
		expect(api).toHaveTextContent("revealLabel");
		expect(api).not.toHaveTextContent("revealLabel?");
		expect(api).toHaveTextContent("hideLabel");
		expect(api).not.toHaveTextContent("hideLabel?");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("passwordManagerIgnore?");
		expect(api).toHaveTextContent("string");
		expect(api).toHaveTextContent("Accessible label for the reveal action.");
		expect(api).toHaveTextContent("Accessible label for the hide action.");
		expect(api).toHaveTextContent("—");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("disabled");
		expect(api).not.toHaveTextContent("aria-label");
		expect(api).not.toHaveTextContent("type?");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and reset" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="sensitive-input-default"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="sensitive-input-default"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="sensitive-input-disabled"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="sensitive-input-sizes"]')).toBeTruthy();
		expect(
			document.querySelector('[data-scenario="sensitive-input-controlled-and-reset"]'),
		).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### SensitiveInput");
		expect(markdown).toContain(
			"- revealLabel (string, required, default —): Accessible label for the reveal action.",
		);
		expect(markdown).toContain(
			"- hideLabel (string, required, default —): Accessible label for the hide action.",
		);
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- type (");
		expect(markdown).not.toContain("- disabled (");
		expect(UI_EXAMPLES["sensitive-input"]).toHaveLength(4);
		for (const scenario of UI_EXAMPLES["sensitive-input"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|API key|secret|token/i);
	});

	it("does not keep a handwritten sensitive-input prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		expect(family).toContain("api: sensitiveInputApi");
		expect(family).not.toContain('name: "revealLabel"');
		expect(family).not.toContain('name: "hideLabel"');
		expect(family).toContain(
			'description: "A password field with reveal, size, and invalid styles."',
		);
		expect(family).toContain(
			'<SensitiveInput aria-label="Password" revealLabel="Show" hideLabel="Hide" />',
		);
		expect(family).toContain('variants: ["sm", "md", "lg"]');
		expect(family).toContain('repo: "basalt"');
		expect(family).toContain('sha: "2727ae6a8d3f"');
		expect(family).toContain('file: "src/pages/FormsPage.tsx"');
	});
});
