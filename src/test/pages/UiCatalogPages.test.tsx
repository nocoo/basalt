import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigationType } from "react-router";
import { describe, expect, it, vi } from "vitest";
import {
	CATALOG,
	catalogImportPath,
	catalogNavName,
	inScopeCatalogSlugs,
	libraryDocEntries,
	libraryNavEntries,
} from "@/pages/ui/catalog";
import { loadCatalogPageContent } from "@/pages/ui/catalog-content-loader";
import { loadCatalogContentRecord } from "@/pages/ui/catalog-content-registry";
import { loadCatalogIndex } from "@/pages/ui/catalog-index-loader";
import { catalogScenarioMatchesSlug } from "@/pages/ui/catalog-scenario";
import {
	catalogSourceCopyText,
	githubSourceHref,
	githubSourceLabel,
} from "@/pages/ui/catalog-source";
import { CATALOG_API } from "@/pages/ui/generated/catalog-api";

const catalogContent = await loadCatalogContentRecord();
const CATALOG_DOCS = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.docs]),
);
const UI_EXAMPLES = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.examples]),
);
const catalogIndex = await loadCatalogIndex();
const CATALOG_INDEX_GROUPS = catalogIndex.groups;
const CATALOG_INDEX_ITEMS = catalogIndex.items;

function catalogHeroScenario(slug: string) {
	return UI_EXAMPLES[slug]?.[0];
}

import { KUMO_DOCS_SLUGS } from "@/pages/ui/kumo-list";
import UiIndexPage from "@/pages/ui/UiIndexPage";
import UiPlaceholderPage, {
	CatalogApiReference,
	catalogApiSurfaceId,
} from "@/pages/ui/UiPlaceholderPage";

await Promise.all(CATALOG.map((entry) => loadCatalogPageContent(entry.slug)));

function RouterProbe() {
	const location = useLocation();
	const navigationType = useNavigationType();
	return (
		<span
			hidden
			data-router-location={`${location.pathname}${location.search}`}
			data-navigation-type={navigationType}
		/>
	);
}

function renderCatalog(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<RouterProbe />
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
		expect(slugs).toHaveLength(101);
		expect(new Set(slugs).size).toBe(101);
	});

	it("renders the categorized index with orthogonal release and page states", () => {
		renderCatalog("/ui");
		expect(document.querySelector("[data-status='index']")).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Component library" })).toBeInTheDocument();
		expect(document.querySelector("[data-ready-summary]")).toHaveTextContent("89 / 92 ready");

		for (const [index, group] of CATALOG_INDEX_GROUPS.entries()) {
			const section = screen.getByRole("region", { name: group.label });
			expect(within(section).getByText(`${group.items.length} items`)).toBeInTheDocument();
			expect(section.querySelectorAll("[data-catalog-card]")).toHaveLength([65, 24, 3][index]);
		}
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(92);
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
		const mapsCard = document.querySelector('[data-catalog-card="maps"]');
		expect(buttonCard).toBeTruthy();
		expect(mapsCard).toBeTruthy();
		if (buttonCard && mapsCard) {
			expect(within(buttonCard as HTMLElement).getByText("Stable")).toHaveAttribute(
				"data-release-status",
				"stable",
			);
			expect(within(buttonCard as HTMLElement).getByText("Ready")).toHaveAttribute(
				"data-page-status",
				"ready",
			);
			expect(within(mapsCard as HTMLElement).getByText("Catalog")).toHaveAttribute(
				"data-release-status",
				"catalog",
			);
			expect(within(mapsCard as HTMLElement).getByText("Planned")).toHaveAttribute(
				"data-page-status",
				"planned",
			);
		}
		expect(screen.getAllByRole("button", { name: "Create project" })).toHaveLength(3);
	});

	it("filters the catalog from URL-backed search and toggle controls", () => {
		renderCatalog("/ui?q=input&release=catalog&status=ready");
		const searchInput = screen.getByRole("searchbox", { name: "Search" });
		expect(searchInput).toHaveValue("input");
		expect(screen.getByRole("radiogroup", { name: "Category" })).toBeInTheDocument();
		expect(screen.getByRole("radiogroup", { name: "Release" })).toBeInTheDocument();
		expect(screen.getByRole("radiogroup", { name: "Page status" })).toBeInTheDocument();
		expect(screen.getByRole("radio", { name: "Catalog" })).toHaveAttribute("aria-checked", "true");
		expect(screen.getByRole("radio", { name: "Ready" })).toHaveAttribute("aria-checked", "true");
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent("3 results");
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(3);
		expect(
			Array.from(document.querySelectorAll<HTMLElement>("[data-catalog-card]")).map(
				(card) => card.dataset.catalogCard,
			),
		).toEqual(["input-area", "input-group", "sensitive-input"]);
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
			"/ui?q=input+group&release=catalog&status=ready",
		);
		expect(document.querySelector("[data-router-location]")).toHaveAttribute(
			"data-navigation-type",
			"REPLACE",
		);
	});

	it("shows a planned chart without a link and switches explicitly to All", () => {
		renderCatalog("/ui?category=chart&status=planned");
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent(/^1 result$/);
		const mapsCard = document.querySelector('[data-catalog-card="maps"]');
		expect(mapsCard).toBeInTheDocument();
		expect(mapsCard?.querySelector('a[href="/ui/maps"]')).toBeNull();
		expect(screen.queryByRole("region", { name: "Components" })).not.toBeInTheDocument();

		const categoryGroup = screen.getByRole("radiogroup", { name: "Category" });
		fireEvent.click(within(categoryGroup).getByRole("radio", { name: "All" }));
		expect(within(categoryGroup).getByRole("radio", { name: "All" })).toHaveAttribute(
			"aria-checked",
			"true",
		);
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent("3 results");
		expect(document.querySelector("[data-router-location]")).toHaveAttribute(
			"data-router-location",
			"/ui?status=planned",
		);
	});

	it("canonicalizes invalid and repeated owned URL values without removing foreign values", async () => {
		renderCatalog("/ui?status=ready&foreign=one&q=input&q=button&category=unknown&foreign=two");
		expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("");
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent("89 results");
		await waitFor(() => {
			expect(document.querySelector("[data-router-location]")).toHaveAttribute(
				"data-router-location",
				"/ui?foreign=one&foreign=two&status=ready",
			);
		});
		expect(document.querySelector("[data-router-location]")).toHaveAttribute(
			"data-navigation-type",
			"REPLACE",
		);
	});

	it("renders one empty state and resets owned filters while preserving foreign values", () => {
		renderCatalog("/ui?foreign=kept&q=does-not-exist&category=block");
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent("0 results");
		expect(document.querySelector("[data-empty-status]")).toBeInTheDocument();
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(0);
		expect(screen.queryByRole("region")).not.toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: "Reset filters" })).toHaveLength(1);

		fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
		expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus();
		expect(document.querySelector("[data-result-summary]")).toHaveTextContent("92 results");
		expect(document.querySelectorAll("[data-catalog-card]")).toHaveLength(92);
		expect(screen.queryByRole("button", { name: "Reset filters" })).not.toBeInTheDocument();
		expect(document.querySelector("[data-router-location]")).toHaveAttribute(
			"data-router-location",
			"/ui?foreign=kept",
		);
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
		const hero = catalogHeroScenario(slug);
		expect(hero, slug).toBeDefined();
		const docs = CATALOG_DOCS[slug];
		expect(docs, slug).toBeDefined();
		if (!hero || !docs) {
			return;
		}
		cleanup();
		renderCatalog(`/ui/${slug}`);
		expect(document.querySelector(`[data-status='ready'][data-slug='${slug}']`)).toBeTruthy();
		expect(document.querySelector(`[data-hero-scenario="${hero.id}"]`)).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Installation" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Usage" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "API Reference" })).toBeInTheDocument();
		expect(screen.getAllByRole("columnheader", { name: "Default" }).length).toBeGreaterThan(0);
		expect(screen.getByRole("button", { name: "Copy page" })).toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: "Copy" }).length).toBeGreaterThan(0);
		expect(screen.getAllByRole("navigation", { name: "On this page" }).length).toBeGreaterThan(0);
		expect(document.querySelector("aside .sticky")).toBeTruthy();
		expect(screen.getAllByRole("combobox", { name: "Jump to section" }).length).toBeGreaterThan(0);
		const implementationHref = githubSourceHref(docs.implementationSource);
		const implementationLink = screen.getByRole("link", {
			name: "View Basalt implementation on GitHub",
		});
		expect(implementationLink).toHaveAttribute("href", implementationHref);
		expect(implementationLink).toHaveAttribute("rel", "noopener noreferrer");
		expect(implementationLink).toHaveAttribute("target", "_blank");
		expect(
			screen.getByRole("link", { name: githubSourceLabel(docs.implementationSource) }),
		).toHaveAttribute("href", implementationHref);
		if (docs.provenance) {
			expect(implementationLink.getAttribute("href")).not.toBe(githubSourceHref(docs.provenance));
			expect(
				screen.getByRole("link", { name: githubSourceLabel(docs.provenance) }),
			).toHaveAttribute("href", githubSourceHref(docs.provenance));
		}
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
			expect(docs.implementationSource.repo, slug).not.toMatch(/^(meowth|pika)$/);
			if (slug === "confirm-dialog") {
				expect(docs.provenance?.repo, slug).toBe("meowth");
				continue;
			}
			if (slug === "table-pager") {
				expect(docs.provenance?.repo, slug).toBe("pika");
				continue;
			}
			expect(docs.provenance?.repo, slug).not.toMatch(/^(meowth|pika)$/);
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
		expect(markdown).toContain(catalogSourceCopyText(docs));
		expect(markdown).toContain("## Implementation");
		expect(markdown).toContain(githubSourceHref(docs.implementationSource));
		expect(markdown).toContain("## Provenance");
		expect(markdown).toContain(githubSourceHref(docs.provenance));
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not infer github owner from a repo name", () => {
		const page = readFileSync(
			path.join(process.cwd(), "src/pages/ui/UiPlaceholderPage.tsx"),
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
			collapsible: "How does this project work?",
			dialog: "Click me",
			popover: "Open Popover",
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
		const preview = block?.querySelector(".min-h-\\[140px\\]");
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
		expect(screen.getByRole("table", { name: "Alpha props" })).toHaveTextContent("one");
		expect(screen.queryByRole("table", { name: "Beta props" })).not.toBeInTheDocument();
		expect(beta?.parentElement).toHaveTextContent("No component-specific props.");
		const empty = beta.parentElement?.querySelector("p");
		expect(empty).toHaveTextContent("No component-specific props.");
		expect(empty).toHaveClass("text-sm");
		expect(empty).toHaveClass("text-muted-foreground");
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
				"A controlled, labelled segmented filter with an optional All choice and horizontal overflow.",
			variants: ["all", "overflow", "disabled"],
		});
		expect(CATALOG_API["segment-control"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"value",
			"onValueChange",
			"legend",
			"options",
			"allOption",
			"disabled",
		]);
		expect(UI_EXAMPLES["segment-control"]?.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "segment-control-controlled-status", title: "Controlled status filter" },
			{ id: "segment-control-overflow-disabled", title: "Overflow and disabled" },
		]);

		renderCatalog("/ui/segment-control");
		const api = document.getElementById("api-reference");
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(6);
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
			"- value (string, required, default —): The currently selected value.",
		);
		expect(markdown).toContain("- allOption (SegmentControlAllOption, optional, default —)");
		for (const scenario of UI_EXAMPLES["segment-control"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toContain("- defaultValue (");
		expect(markdown).not.toContain("- children (");
	});

	it("keeps PageHeader docs, generated API, source examples, and Copy page aligned", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const docs = CATALOG_DOCS["page-header"];
		expect(docs?.api).toBe(CATALOG_API["page-header"]);
		expect(docs).toMatchObject({
			description:
				"A content page heading with optional description, eyebrow, breadcrumbs, and actions.",
			variants: [],
		});
		expect(CATALOG_API["page-header"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"title",
			"description",
			"eyebrow",
			"breadcrumbs",
			"actions",
		]);
		expect(UI_EXAMPLES["page-header"]?.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "page-header-default", title: "Default" },
			{ id: "page-header-long-responsive-content", title: "Long responsive content" },
		]);

		renderCatalog("/ui/page-header");
		const api = document.getElementById("api-reference");
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(5);
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
		expect(within(longContent as HTMLElement).getByText("Workspace")).toBeInTheDocument();
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
		expect(markdown).toContain("- breadcrumbs (PageHeaderBreadcrumb[], optional, default —)");
		for (const scenario of UI_EXAMPLES["page-header"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- children (");
	});

	it("keeps StatStrip docs, generated API, source examples, and Copy page aligned", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const docs = CATALOG_DOCS["stat-strip"];
		expect(docs?.api).toBe(CATALOG_API["stat-strip"]);
		expect(docs).toMatchObject({
			description:
				"A responsive definition list of labelled values for page or dashboard overviews.",
			variants: [],
		});
		expect(CATALOG_API["stat-strip"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"className",
			"items",
			"loading",
		]);
		expect(UI_EXAMPLES["stat-strip"]?.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "stat-strip-overview", title: "Overview" },
			{ id: "stat-strip-loading-values", title: "Loading values" },
		]);

		renderCatalog("/ui/stat-strip");
		const api = document.getElementById("api-reference");
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(3);
		const hero = document.querySelector('[data-hero-scenario="stat-strip-overview"]');
		expect(hero).toBeTruthy();
		if (!hero) {
			throw new Error("missing StatStrip hero");
		}
		expect(within(hero as HTMLElement).getByText("Projects")).toBeInTheDocument();
		expect(within(hero as HTMLElement).getByText("24")).toBeInTheDocument();
		const loading = document.querySelector('[data-scenario="stat-strip-loading-values"]');
		expect(loading).toBeTruthy();
		if (!loading) {
			throw new Error("missing StatStrip loading example");
		}
		expect(loading.querySelector("dl")).toHaveAttribute("aria-busy", "true");
		expect(within(loading as HTMLElement).queryByText("24")).toBeNull();
		for (const scenario of UI_EXAMPLES["stat-strip"] ?? []) {
			expect(scenario.code).toContain("@nocoo/basalt/components/stat-strip");
			expect(scenario.code).toContain("export default function");
			expect(document.querySelector(`[data-scenario="${scenario.id}"]`)).toBeTruthy();
		}

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### StatStrip");
		expect(markdown).toContain("- items (StatStripItem[], required, default —)");
		expect(markdown).toContain("- loading (boolean, optional, default false)");
		for (const scenario of UI_EXAMPLES["stat-strip"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toContain("- children (");
	});

	it("keeps ConfirmDialog docs, generated API, source examples, and Copy page aligned", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const docs = CATALOG_DOCS["confirm-dialog"];
		expect(docs?.api).toBe(CATALOG_API["confirm-dialog"]);
		expect(docs).toMatchObject({
			description:
				"A controlled confirmation dialog with explicit loading and a Promise-based hook.",
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
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(14);
		const hero = document.querySelector(
			'[data-hero-scenario="confirm-dialog-controlled-async-loading"]',
		);
		expect(hero).toBeTruthy();
		if (!hero) {
			throw new Error("missing ConfirmDialog hero");
		}
		expect(
			within(hero as HTMLElement).getByRole("button", { name: "Delete project" }),
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
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(7);
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
		expect(markdown).toContain("- page (number, required, default —)");
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
			'<LinkProvider><Link href="/ui">Library</Link></LinkProvider>',
		);
		expect(screen.getByRole("heading", { name: "Basic Link" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Inline in Paragraph" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "External Links" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("- href (string, required, default —): The link destination.");
		expect(markdown).toContain('<LinkProvider><Link href="/ui">Library</Link></LinkProvider>');
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
		expect(family).toContain('<LinkProvider><Link href="/ui">Library</Link></LinkProvider>');
	});

	it("sources tooltip API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.tooltip?.api).toEqual(CATALOG_API.tooltip);
		expect(CATALOG_API.tooltip?.[0]?.props.map((prop) => prop.name)).toEqual(["delayDuration"]);
		expect(CATALOG_API.tooltip).toEqual([
			{
				name: "Tooltip",
				props: [
					{
						name: "delayDuration",
						type: "number",
						required: false,
						default: "700",
						description: "Delay before the tooltip opens, in milliseconds.",
					},
				],
			},
		]);
		renderCatalog("/ui/tooltip");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(1);
		expect(api).toHaveTextContent("delayDuration?");
		expect(api).toHaveTextContent("number");
		expect(api).toHaveTextContent("700");
		expect(api).toHaveTextContent("Delay before the tooltip opens, in milliseconds.");
		expect(api).not.toHaveTextContent("children");
		expect(api).not.toHaveTextContent("defaultOpen");
		expect(api).not.toHaveTextContent("onOpenChange");
		expect(api).not.toHaveTextContent("skipDelayDuration");
		expect(api).not.toHaveTextContent("sideOffset");
		expect(document.body.textContent).toContain(
			"<TooltipProvider><Tooltip><TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger><TooltipContent>Hint</TooltipContent></Tooltip></TooltipProvider>",
		);
		expect(screen.getByRole("heading", { name: "Basic Tooltip" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Multiple Tooltips" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(
			"- delayDuration (number, optional, default 700): Delay before the tooltip opens, in milliseconds.",
		);
		expect(markdown).toContain(
			"<TooltipProvider><Tooltip><TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger><TooltipContent>Hint</TooltipContent></Tooltip></TooltipProvider>",
		);
		expect(markdown).not.toContain("- children (");
		expect(markdown).not.toContain("- open (");
		expect(markdown).not.toContain("- defaultOpen (");
		expect(markdown).not.toContain("- onOpenChange (");
		expect(markdown).not.toContain("- skipDelayDuration (");
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
			"<TooltipProvider><Tooltip><TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger><TooltipContent>Hint</TooltipContent></Tooltip></TooltipProvider>",
		);
	});

	it("sources theme-toggle API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS["theme-toggle"]?.api).toEqual(CATALOG_API["theme-toggle"]);
		expect(CATALOG_API["theme-toggle"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"aria-label",
		]);
		expect(CATALOG_API["theme-toggle"]).toEqual([
			{
				name: "ThemeToggle",
				props: [
					{
						name: "aria-label",
						type: "string",
						required: true,
						description: "Accessible name for the toggle.",
					},
				],
			},
		]);
		renderCatalog("/ui/theme-toggle");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(1);
		expect(api).toHaveTextContent("aria-label");
		expect(api).not.toHaveTextContent("aria-label?");
		expect(api).toHaveTextContent("string");
		expect(api).toHaveTextContent("Accessible name for the toggle.");
		expect(api).toHaveTextContent("—");
		expect(api).not.toHaveTextContent("variant");
		expect(api).not.toHaveTextContent("size");
		expect(api).not.toHaveTextContent("loading");
		expect(api).not.toHaveTextContent("asChild");
		expect(api).not.toHaveTextContent("className");
		expect(document.body.textContent).toContain(
			'<ThemeProvider><ThemeToggle aria-label="Toggle theme" /></ThemeProvider>',
		);
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(
			"- aria-label (string, required, default —): Accessible name for the toggle.",
		);
		expect(markdown).toContain(
			'<ThemeProvider><ThemeToggle aria-label="Toggle theme" /></ThemeProvider>',
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
			'<ThemeProvider><ThemeToggle aria-label="Toggle theme" /></ThemeProvider>',
		);
	});

	it("sources layer-card API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS["layer-card"]?.api).toEqual(CATALOG_API["layer-card"]);
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
		expect(
			CATALOG_API["layer-card"]?.map((surface) => surface.props.map((prop) => prop.name)),
		).toEqual([
			["className", "padding"],
			[],
			[],
			[],
			[],
			[],
			["label"],
			["title", "description", "icon"],
		]);
		renderCatalog("/ui/layer-card");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(6);
		expect(api).toHaveTextContent("className?");
		expect(api).toHaveTextContent("padding?");
		expect(api).toHaveTextContent("LayerCard.Loading");
		expect(api).toHaveTextContent("LayerCard.Empty");
		expect(api?.querySelectorAll("p")).toHaveLength(5);
		expect(api).toHaveTextContent("string");
		expect(api).toHaveTextContent("Additional classes for the card root.");
		expect(api).toHaveTextContent("—");
		expect(api).not.toHaveTextContent("children");
		expect(api).not.toHaveTextContent("id");
		expect(api).not.toHaveTextContent("style");
		expect(api).not.toHaveTextContent("role");
		expect(api).not.toHaveTextContent("LayerCardSectionProps");
		expect(document.body.textContent).toContain(
			"<LayerCard><LayerCard.Header>Title</LayerCard.Header><LayerCard.Body>Content</LayerCard.Body><LayerCard.Footer>Actions</LayerCard.Footer></LayerCard>",
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
			'- padding ("lg" | "md" | "none" | "sm", optional, default "none"): Inner spacing for unstructured card content.',
		);
		expect(markdown).toContain("### LayerCard.Loading");
		expect(markdown).toContain("### LayerCard.Empty");
		expect(markdown).toContain(
			"<LayerCard><LayerCard.Header>Title</LayerCard.Header><LayerCard.Body>Content</LayerCard.Body><LayerCard.Footer>Actions</LayerCard.Footer></LayerCard>",
		);
		expect(markdown).not.toContain("- children (");
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
			"<LayerCard><LayerCard.Header>Title</LayerCard.Header><LayerCard.Body>Content</LayerCard.Body><LayerCard.Footer>Actions</LayerCard.Footer></LayerCard>",
		);
	});

	it("sources basalt-mark API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS["basalt-mark"]?.api).toEqual(CATALOG_API["basalt-mark"]);
		expect(CATALOG_API["basalt-mark"]?.[0]?.props.map((prop) => prop.name)).toEqual(["className"]);
		expect(CATALOG_API["basalt-mark"]).toEqual([
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
		renderCatalog("/ui/basalt-mark");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(1);
		expect(api).toHaveTextContent("className?");
		expect(api).toHaveTextContent("string");
		expect(api).toHaveTextContent("Additional classes for the mark.");
		expect(api).toHaveTextContent("—");
		expect(api).not.toHaveTextContent("children");
		expect(api).not.toHaveTextContent("strokeWidth");
		expect(api).not.toHaveTextContent("role");
		expect(document.body.textContent).toContain("<BasaltMark />");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="basalt-mark-default"]');
		expect(hero?.querySelector('svg[aria-label="Basalt"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(
			"- className (string, optional, default —): Additional classes for the mark.",
		);
		expect(markdown).toContain("<BasaltMark />");
		expect(markdown).toContain(UI_EXAMPLES["basalt-mark"]?.[0]?.code ?? "");
		expect(markdown).not.toContain("- children (");
		expect(markdown).not.toContain("- strokeWidth (");
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
	});

	it("does not keep a handwritten basalt-mark prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/foundation.tsx"),
			"utf8",
		);
		expect(family).toContain("api: basaltMarkApi");
		expect(family).toContain('description: "Basalt mark."');
		expect(family).toContain("<BasaltMark />");
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
		expect(family).toContain('<Field label="Email"><Input /></Field>');
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
						default: "default",
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
			"- size (InputSize, optional, default default): The visual size of the input.",
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
		expect(markdown).toContain('<div className="flex w-full flex-col gap-3">');
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
		expect(family).toContain('variants: ["sm", "default", "lg"]');
		expect(family).toContain('repo: "kumo"');
		expect(family).toContain('sha: "1159868dfe32"');
		expect(family).toContain('file: "packages/kumo/src/components/input/input.tsx"');
	});

	it("sources input-area API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS["input-area"]?.api).toEqual(CATALOG_API["input-area"]);
		expect(CATALOG_API["input-area"]).toEqual([
			{
				name: "InputArea",
				props: [
					{
						name: "rows",
						type: "number",
						required: false,
						description: "The visible text row count.",
					},
					{
						name: "size",
						type: "InputAreaSize",
						required: false,
						default: "default",
						description: "The visual size of the text area.",
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
		renderCatalog("/ui/input-area");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(3);
		expect(api).toHaveTextContent("rows?");
		expect(api).toHaveTextContent("number");
		expect(api).toHaveTextContent("The visible text row count.");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("InputAreaSize");
		expect(api).toHaveTextContent("passwordManagerIgnore?");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("placeholder");
		expect(api).not.toHaveTextContent("onChange");
		expect(screen.getByRole("heading", { name: "With Label" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and reset" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="input-area-with-label"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-area-custom-row-count"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-area-error-state-string"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-area-disabled"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-area-sizes"]')).toBeTruthy();
		expect(
			document.querySelector('[data-scenario="input-area-controlled-and-reset"]'),
		).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("- rows (number, optional, default —): The visible text row count.");
		expect(markdown).toContain(
			"- size (InputAreaSize, optional, default default): The visual size of the text area.",
		);
		expect(markdown).toContain(
			"- passwordManagerIgnore (boolean, optional, default false): Ignore password managers on this field.",
		);
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- placeholder (");
		expect(markdown).toContain(UI_EXAMPLES["input-area"]?.[0]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES["input-area"]?.[1]?.code ?? "");
		expect(markdown).toContain("rows={6}");
		expect(markdown).toContain('htmlFor="ex-notes"');
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not keep a handwritten input-area prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		expect(family).toContain("api: inputAreaApi");
		expect(family).not.toContain('name: "rows"');
		expect(family).toContain('description: "A sized native multi-line control on the L3 surface."');
		expect(family).toContain('<InputArea aria-label="Notes" placeholder="Write a note" />');
		expect(family).toContain('variants: ["sm", "default", "lg"]');
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
			"<InputGroup><InputGroup.Input defaultValue='atlas' aria-label='Subdomain' /><InputGroup.Suffix>.example.com</InputGroup.Suffix></InputGroup>",
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
						default: "default",
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
		expect(family).toContain('variants: ["sm", "default", "lg"]');
		expect(family).toContain('repo: "basalt"');
		expect(family).toContain('sha: "2727ae6a8d3f"');
		expect(family).toContain('file: "src/pages/FormsPage.tsx"');
	});

	it("sources checkbox API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.checkbox?.api).toEqual(CATALOG_API.checkbox);
		expect(CATALOG_API.checkbox).toEqual([
			{
				name: "Checkbox",
				props: [
					{
						name: "checked",
						type: '"indeterminate" | boolean',
						required: false,
						description: "The controlled checked state of the checkbox.",
					},
					{
						name: "size",
						type: "CheckboxSize",
						required: false,
						default: "default",
						description: "The visual size of the checkbox.",
					},
				],
			},
			{
				name: "Checkbox.Group",
				props: [
					{
						name: "value",
						type: "string[]",
						required: false,
						description: "The controlled selected values.",
					},
					{
						name: "defaultValue",
						type: "string[]",
						required: false,
						description: "The initially selected values.",
					},
					{
						name: "onValueChange",
						type: "(value: string[]) => void",
						required: false,
						description: "Called when the selected values change.",
					},
					{
						name: "error",
						type: "React.ReactNode",
						required: false,
						description: "Marks the group invalid and shows alert copy.",
					},
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable every item in the group.",
					},
				],
			},
			{
				name: "Checkbox.Legend",
				props: [],
			},
			{
				name: "Checkbox.Item",
				props: [
					{
						name: "size",
						type: '"default" | "sm"',
						required: false,
						default: "default",
						description: "The visual size of the checkbox.",
					},
					{
						name: "value",
						type: "string",
						required: true,
						description: "The value stored in the group when this item is checked.",
					},
				],
			},
		]);
		renderCatalog("/ui/checkbox");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(document.getElementById("api-Checkbox")?.tagName).toBe("H3");
		expect(document.querySelector('[data-toc-id="api-Checkbox"]')).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Checkbox", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "Checkbox props" })).toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(9);
		expect(api).toHaveTextContent("checked?");
		expect(api).toHaveTextContent('"indeterminate" | boolean');
		expect(api).toHaveTextContent("The controlled checked state of the checkbox.");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("Checkbox.Group");
		expect(api).toHaveTextContent("Checkbox.Item");
		expect(api).not.toHaveTextContent("defaultChecked");
		expect(api).not.toHaveTextContent("onCheckedChange");
		expect(api).not.toHaveTextContent("className");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Checked" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Indeterminate" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Group and legend" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and error" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="checkbox-default"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="checkbox-error"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="checkbox-group-and-legend"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### Checkbox");
		expect(markdown).toContain(
			'- checked ("indeterminate" | boolean, optional, default —): The controlled checked state of the checkbox.',
		);
		expect(markdown).not.toContain("- defaultChecked (");
		expect(markdown).not.toContain("- className (");
		expect(UI_EXAMPLES.checkbox).toHaveLength(7);
		for (const scenario of UI_EXAMPLES.checkbox ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not keep a handwritten checkbox prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		expect(family).toContain("api: checkboxApi");
		expect(family).not.toContain('name: "checked"');
		expect(family).not.toContain('boolean | "indeterminate"');
		expect(family).toContain('description: "A check control with group, legend, size, and error."');
		expect(family).toContain('<Checkbox aria-label="Subscribe" />');
		expect(family).toContain(
			'variants: ["checked", "unchecked", "indeterminate", "sm", "default"]',
		);
		expect(family).toContain('repo: "kumo"');
		expect(family).toContain('sha: "1159868dfe32"');
		expect(family).toContain('file: "packages/kumo/src/components/checkbox/checkbox.tsx"');
	});

	it("sources radio API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.radio?.api).toEqual(CATALOG_API.radio);
		expect(CATALOG_API.radio).toEqual([
			{
				name: "Radio",
				props: [
					{
						name: "value",
						type: "string",
						required: true,
						description: "The value associated with the radio item.",
					},
					{
						name: "size",
						type: "RadioSize",
						required: false,
						default: "default",
						description: "The visual size of the radio.",
					},
				],
			},
			{
				name: "Radio.Group",
				props: [
					{
						name: "value",
						type: "string",
						required: false,
						description: "The controlled selected value.",
					},
					{
						name: "defaultValue",
						type: "string",
						required: false,
						description: "The initially selected value.",
					},
					{
						name: "onValueChange",
						type: "(value: string) => void",
						required: false,
						description: "Called when the selected value changes.",
					},
					{
						name: "error",
						type: "React.ReactNode",
						required: false,
						description: "Marks the group invalid and shows alert copy.",
					},
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable every item in the group.",
					},
				],
			},
			{
				name: "Radio.Legend",
				props: [],
			},
		]);
		renderCatalog("/ui/radio");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(document.getElementById("api-Radio")?.tagName).toBe("H3");
		expect(document.querySelector('[data-toc-id="api-Radio"]')).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Radio", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "Radio props" })).toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(7);
		expect(api).toHaveTextContent("value");
		expect(api).toHaveTextContent("value?");
		expect(api).toHaveTextContent("defaultValue?");
		expect(api).toHaveTextContent("onValueChange?");
		expect(api).toHaveTextContent("string");
		expect(api).toHaveTextContent("The value associated with the radio item.");
		expect(api).toHaveTextContent("The controlled selected value.");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("Radio.Group");
		expect(api).not.toHaveTextContent("required?");
		expect(api).not.toHaveTextContent("asChild");
		expect(api).not.toHaveTextContent("className");
		expect(screen.getByRole("heading", { name: "Default (Vertical)" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Horizontal" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Group and legend" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and error" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="radio-default-vertical"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="radio-disabled"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="radio-group-and-legend"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### Radio");
		expect(markdown).toContain(
			"- value (string, required, default —): The value associated with the radio item.",
		);
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- form (");
		expect(UI_EXAMPLES.radio).toHaveLength(5);
		for (const scenario of UI_EXAMPLES.radio ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not keep a handwritten radio prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		const start = family.indexOf("\tradio: {");
		const end = family.indexOf("\tswitch: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = family.slice(start, end);
		expect(block).toContain("api: radioApi");
		expect(block).not.toContain('name: "value"');
		expect(block).toContain('description: "A radio control with group, legend, size, and error."');
		expect(block).toContain(
			'<Radio.Group defaultValue="a"><Radio value="a" aria-label="Alpha" /><Radio value="b" aria-label="Beta" /></Radio.Group>',
		);
		expect(block).toContain('variants: ["sm", "default"]');
		expect(block).toContain('repo: "kumo"');
		expect(block).toContain('sha: "1159868dfe32"');
		expect(block).toContain('file: "packages/kumo/src/components/radio/radio.tsx"');
	});

	it("sources switch API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.switch?.api).toEqual(CATALOG_API.switch);
		expect(CATALOG_API.switch?.map((surface) => surface.name)).toEqual([
			"Switch",
			"Switch.Group",
			"Switch.Legend",
			"Switch.Item",
		]);
		renderCatalog("/ui/switch");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(document.getElementById("api-Switch")?.tagName).toBe("H3");
		expect(document.querySelector('[data-toc-id="api-Switch"]')).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Switch", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "Switch props" })).toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(9);
		expect(api).toHaveTextContent("checked?");
		expect(api).toHaveTextContent("size?");
		expect(api).toHaveTextContent("boolean");
		expect(api).toHaveTextContent('"default" | "sm"');
		expect(api).toHaveTextContent("The controlled checked state of the switch.");
		expect(api).toHaveTextContent("The visual size of the switch.");
		expect(api).toHaveTextContent("Switch.Group");
		expect(api).not.toHaveTextContent("defaultChecked");
		expect(api).not.toHaveTextContent("onCheckedChange");
		expect(api).not.toHaveTextContent("className");
		expect(screen.getByRole("heading", { name: "Off State" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "On State" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Group and legend" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and error" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="switch-off-state"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="switch-sizes"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="switch-group-and-legend"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### Switch");
		expect(markdown).toContain(
			"- checked (boolean, optional, default —): The controlled checked state of the switch.",
		);
		expect(markdown).toContain(
			'- size ("default" | "sm", optional, default default): The visual size of the switch.',
		);
		expect(markdown).not.toContain("- defaultChecked (");
		expect(markdown).not.toContain("- className (");
		expect(UI_EXAMPLES.switch).toHaveLength(6);
		for (const scenario of UI_EXAMPLES.switch ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("does not keep a handwritten switch prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		expect(family).toContain("api: switchApi");
		expect(family).not.toContain('name: "checked"');
		expect(family).not.toContain('name: "size"');
		expect(family).toContain('description: "A binary toggle with group, legend, size, and error."');
		expect(family).toContain('<Switch aria-label="Notifications" />');
		expect(family).toContain('variants: ["checked", "unchecked", "sm", "default"]');
		expect(family).toContain('repo: "kumo"');
		expect(family).toContain('sha: "1159868dfe32"');
		expect(family).toContain('file: "packages/kumo/src/components/switch/switch.tsx"');
	});

	it("sources select API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.select?.api).toEqual(CATALOG_API.select);
		expect(CATALOG_API.select).toEqual([
			{
				name: "Select",
				props: [
					{
						name: "value",
						type: "string",
						required: false,
						description: "The controlled value of the select.",
					},
				],
			},
			{ name: "SelectTrigger", props: [] },
			{
				name: "SelectValue",
				props: [
					{
						name: "placeholder",
						type: "React.ReactNode",
						required: false,
						description: "Content shown when no value is selected.",
					},
				],
			},
			{
				name: "SelectContent",
				props: [
					{
						name: "position",
						type: '"item-aligned" | "popper"',
						required: false,
						default: "popper",
						description: "The positioning mode for the select content.",
					},
					{
						name: "sideOffset",
						type: "number",
						required: false,
						default: "4",
						description: "The distance between the trigger and the select content.",
					},
				],
			},
			{ name: "SelectGroup", props: [] },
			{
				name: "SelectItem",
				props: [
					{
						name: "value",
						type: "string",
						required: true,
						description: "The value associated with the select item.",
					},
				],
			},
		]);
		renderCatalog("/ui/select");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		const surfaceIds = [
			"api-Select",
			"api-SelectTrigger",
			"api-SelectValue",
			"api-SelectContent",
			"api-SelectGroup",
			"api-SelectItem",
		];
		for (const id of surfaceIds) {
			expect(document.getElementById(id)?.tagName).toBe("H3");
			expect(document.querySelectorAll(`[data-toc-id="${id}"]`)).toHaveLength(2);
		}
		expect(screen.getByRole("heading", { name: "Select", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectTrigger", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectValue", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectContent", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectGroup", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "SelectItem", level: 3 })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "Select props" })).toBeInTheDocument();
		expect(screen.queryByRole("table", { name: "SelectTrigger props" })).not.toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectValue props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectContent props" })).toBeInTheDocument();
		expect(screen.queryByRole("table", { name: "SelectGroup props" })).not.toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectItem props" })).toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(5);
		expect(
			screen.getByRole("table", { name: "Select props" }).querySelectorAll("tbody tr"),
		).toHaveLength(1);
		expect(
			screen.getByRole("table", { name: "SelectValue props" }).querySelectorAll("tbody tr"),
		).toHaveLength(1);
		expect(
			screen.getByRole("table", { name: "SelectContent props" }).querySelectorAll("tbody tr"),
		).toHaveLength(2);
		expect(
			screen.getByRole("table", { name: "SelectItem props" }).querySelectorAll("tbody tr"),
		).toHaveLength(1);
		expect(api).toHaveTextContent("value?");
		expect(api).toHaveTextContent("placeholder?");
		expect(api).toHaveTextContent("position?");
		expect(api).toHaveTextContent("sideOffset?");
		expect(api).toHaveTextContent("The controlled value of the select.");
		expect(api).toHaveTextContent("Content shown when no value is selected.");
		expect(api).toHaveTextContent("The positioning mode for the select content.");
		expect(api).toHaveTextContent("The distance between the trigger and the select content.");
		expect(api).toHaveTextContent("The value associated with the select item.");
		expect(api).toHaveTextContent('"item-aligned" | "popper"');
		expect(api).toHaveTextContent("React.ReactNode");
		expect(api).toHaveTextContent("popper");
		expect(api).toHaveTextContent("4");
		expect(api).not.toHaveTextContent("defaultValue");
		expect(api).not.toHaveTextContent("onValueChange");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("Select.Option");
		expect(api).not.toHaveTextContent("GroupLabel");
		expect(api).not.toHaveTextContent("textValue");
		for (const name of ["SelectTrigger", "SelectGroup"]) {
			const heading = document.getElementById(`api-${name}`);
			const empty = heading?.parentElement?.querySelector("p");
			expect(empty).toHaveTextContent("No component-specific props.");
			expect(empty).toHaveClass("text-sm");
			expect(empty).toHaveClass("text-muted-foreground");
		}
		expect(screen.getByRole("heading", { name: "Basic" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Placeholder" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled Options" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="select-basic"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="select-disabled-options"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("### Select");
		expect(markdown).toContain("### SelectTrigger");
		expect(markdown).toContain("### SelectValue");
		expect(markdown).toContain("### SelectContent");
		expect(markdown).toContain("### SelectGroup");
		expect(markdown).toContain("### SelectItem");
		expect(markdown).toContain(
			"- value (string, optional, default —): The controlled value of the select.",
		);
		expect(markdown).toContain("No component-specific props.");
		expect(markdown).toContain(
			"- placeholder (React.ReactNode, optional, default —): Content shown when no value is selected.",
		);
		expect(markdown).toContain(
			'- position ("item-aligned" | "popper", optional, default popper): The positioning mode for the select content.',
		);
		expect(markdown).toContain(
			"- sideOffset (number, optional, default 4): The distance between the trigger and the select content.",
		);
		expect(markdown).toContain(
			"- value (string, required, default —): The value associated with the select item.",
		);
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- defaultValue (");
		expect(markdown).not.toContain("- onValueChange (");
		expect(markdown).not.toContain("Select.Option");
		expect(markdown).not.toContain("GroupLabel");
		expect(UI_EXAMPLES.select).toHaveLength(3);
		for (const scenario of UI_EXAMPLES.select ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
	});

	it("does not keep a handwritten select prop inventory", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/forms.tsx"),
			"utf8",
		);
		const start = family.indexOf("\tselect: {");
		const end = family.indexOf("\tcombobox: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = family.slice(start, end);
		expect(block).toContain("api: selectApi");
		expect(block).not.toContain('name: "value"');
		expect(block).not.toContain('name: "placeholder"');
		expect(block).not.toContain('name: "position"');
		expect(block).not.toContain('name: "sideOffset"');
		expect(block).toContain('description: "Choose one option."');
		expect(block).toContain("Select version");
		expect(block).toContain("variants: []");
		expect(block).toContain('repo: "pew"');
		expect(block).toContain('sha: "97a890fabe6e"');
		expect(block).toContain('file: "packages/web/src/components"');
	});

	it("shows usage as docs code without a preview surface", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const usage = CATALOG_DOCS.button?.usage;
		expect(usage).toBeDefined();
		renderCatalog("/ui/button");
		const section = document.getElementById("usage");
		expect(section).toBeTruthy();
		expect(section?.querySelector(".min-h-\\[140px\\]")).toBeNull();
		expect(section?.querySelector("code")?.textContent).toBe(usage);
	});

	it("documents banner examples like kumo", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/banner");
		expect(screen.getByRole("heading", { level: 1, name: "Banner" })).toBeInTheDocument();
		expect(document.getElementById("api-Banner")?.tagName).toBe("H3");
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
		[
			"checkbox",
			[
				"Default",
				"Checked",
				"Indeterminate",
				"Disabled",
				"Error",
				"Group and legend",
				"Controlled and error",
			],
		],
		[
			"switch",
			["Off State", "On State", "Disabled", "Sizes", "Group and legend", "Controlled and error"],
		],
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
		expect(link).toHaveClass("opacity-50");
		const disabled = UI_EXAMPLES.button?.find((item) => item.id === "button-disabled-link");
		expect(disabled?.code).toContain('className="opacity-50"');
		expect(disabled?.code).toContain('aria-disabled="true"');
		expect(disabled?.code).not.toContain("href=");
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

	it("gives every catalog example a unique slug-prefixed scenario id", () => {
		const seen = new Set<string>();
		expect(Object.keys(UI_EXAMPLES).length).toBeGreaterThan(40);
		for (const [slug, examples] of Object.entries(UI_EXAMPLES)) {
			expect(examples.length, slug).toBeGreaterThan(0);
			for (const example of examples) {
				expect(catalogScenarioMatchesSlug(example.id, slug), example.id).toBe(true);
				expect(example.id, example.id).toMatch(new RegExp(`^${slug}-[a-z0-9]+(?:-[a-z0-9]+)*$`));
				expect(example.id, example.id).not.toMatch(/-\d+$/);
				expect(seen.has(example.id), example.id).toBe(false);
				seen.add(example.id);
			}
		}
	});

	it.each([...KUMO_DOCS_SLUGS])("exposes kumo scenario ids on %s", (slug) => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		const examples = UI_EXAMPLES[slug];
		expect(examples, slug).toBeDefined();
		expect(examples?.length, slug).toBeGreaterThan(0);
		cleanup();
		renderCatalog(`/ui/${slug}`);
		for (const example of examples ?? []) {
			const node = document.querySelector(`[data-scenario="${example.id}"]`);
			expect(node, example.id).toBeTruthy();
			expect(node).toHaveAttribute("id", example.id);
		}
	});

	it("does not use example index anchors", () => {
		const page = readFileSync(
			path.join(process.cwd(), "src/pages/ui/UiPlaceholderPage.tsx"),
			"utf8",
		);
		expect(page).not.toMatch(/example-\$\{index\}/);
		expect(page).toContain("data-scenario");
	});

	it("removes the legacy home inventory and duplicate input branch", () => {
		const source = readFileSync(path.join(process.cwd(), "src/pages/ui/HomeGrid.tsx"), "utf8");
		expect(source).not.toMatch(/\bSHOWCASE\b/);
		expect(source).not.toMatch(/\bextraTiles\b/);
		expect(source).not.toMatch(/\bTILES\b/);
		expect(source).not.toContain("Input (with validation)");
		expect(source).not.toMatch(/\bHomeInputValidation\b/);
		expect(source).not.toContain("aspect-square");
		expect(source).toContain("HOME_DEMOS[item.entry.slug] ?? item.hero.render");
	});

	it("keeps link-button default hero and disabled link contracts", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/link-button");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled Link" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="link-button-default"]');
		expect(hero).toBeTruthy();
		const docs = screen.getAllByRole("link", { name: "Open docs" });
		expect(docs.length).toBeGreaterThan(0);
		for (const link of docs) {
			expect(link).toHaveAttribute("href", "#docs");
		}
		const disabled = screen.getByRole("link", { name: "Disabled link" });
		expect(disabled).toHaveAttribute("aria-disabled", "true");
		expect(disabled).toHaveAttribute("tabindex", "-1");
		expect(disabled).toHaveAttribute("role", "link");
		expect(disabled).not.toHaveAttribute("href");
		expect(disabled).toHaveClass("opacity-50");
		const disabledScenario = UI_EXAMPLES["link-button"]?.find(
			(item) => item.id === "link-button-disabled-link",
		);
		expect(disabledScenario?.code).toContain('aria-disabled="true"');
		expect(disabledScenario?.code).toContain("tabIndex={-1}");
		expect(disabledScenario?.code).toContain('role="link"');
		expect(disabledScenario?.code).toContain('className="opacity-50"');
		expect(disabledScenario?.code).not.toContain("href=");
		fireEvent.click(disabled);
		expect(window.location.hash).not.toBe("#docs");
	});

	it("keeps text sizes hero and muted tone contracts", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/text");
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Muted tone" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="text-sizes"]');
		expect(hero).toBeTruthy();
		const stack = hero?.querySelector(".flex.w-full.flex-col.gap-3");
		expect(stack).toBeTruthy();
		expect(
			[...((stack?.querySelectorAll("p") ?? []) as NodeListOf<HTMLElement>)].map(
				(node) => node.textContent,
			),
		).toEqual(["Extra large", "Large", "Body copy", "Small", "Extra small"]);
		const mutedSection = document.querySelector('[data-scenario="text-muted-tone"]');
		expect(mutedSection).toHaveTextContent("Muted supporting copy.");
		const muted = mutedSection?.querySelector("p");
		expect(muted).toHaveClass("text-basalt-muted-foreground");
		expect(muted).toHaveTextContent("Muted supporting copy.");
		const semantic = document.querySelector('[data-scenario="text-semantic-variants"]');
		expect(semantic).toBeTruthy();
		expect(semantic?.querySelector("h2")).toHaveTextContent("Section title");
		expect(semantic?.querySelector("p")).toHaveTextContent("Body paragraph");
		expect(semantic?.querySelector("span")).toHaveTextContent("Inline body");
		expect(semantic?.querySelector("code")).toHaveTextContent("const ready = true");
		const truncated = document.querySelector('[data-scenario="text-bold-and-truncate"]');
		expect(truncated).toBeTruthy();
		expect(truncated).toHaveTextContent("Bold body copy");
		expect(truncated?.querySelector(".truncate")).toBeTruthy();
	});

	it("keeps label hero, optional marker, and tooltip contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/label");
		expect(screen.getByRole("heading", { name: "Default Label" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Optional Field" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "With Tooltip" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="label-default-label"]');
		expect(hero).toBeTruthy();
		expect(hero?.querySelector(".flex.w-full.flex-col.gap-3")).toBeTruthy();
		expect(hero).toHaveTextContent("Default Label");
		expect(screen.getAllByText("(optional)").length).toBeGreaterThan(0);
		const triggers = screen.getAllByRole("button", { name: "More information" });
		expect(triggers.length).toBeGreaterThan(0);
		await act(async () => {
			fireEvent.focus(triggers[0] as HTMLElement);
			fireEvent.pointerEnter(triggers[0] as HTMLElement);
		});
		expect(await screen.findByRole("tooltip")).toHaveTextContent(
			"More information about this field",
		);
		for (const scenario of UI_EXAMPLES.label ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/label");
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
	});

	it("keeps separator hero and composite preview contracts", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/separator");
		expect(screen.getByRole("heading", { name: "Horizontal" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="separator-horizontal"]');
		expect(hero).toBeTruthy();
		expect(hero?.querySelector(".w-full.max-w-sm.space-y-3")).toBeTruthy();
		expect(hero).toHaveTextContent("Above");
		expect(hero).toHaveTextContent("Below");
		const heroRule = hero?.querySelector('[data-orientation="horizontal"]');
		expect(heroRule).toBeTruthy();
		expect(heroRule).toHaveClass("h-px", "w-full");
		const example = document.querySelector('[data-scenario="separator-horizontal"]');
		expect(example).toBeTruthy();
		expect(example?.querySelector(".w-full.max-w-sm.space-y-3")).toBeTruthy();
		expect(example).toHaveTextContent("Above");
		expect(example).toHaveTextContent("Below");
		expect(example?.querySelector('[data-orientation="horizontal"]')).toBeTruthy();
		for (const scenario of UI_EXAMPLES.separator ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/separator");
			expect(scenario.code).toContain("w-full max-w-sm space-y-3");
			expect(scenario.code).toContain("<Text>Above</Text>");
			expect(scenario.code).toContain("<Separator />");
			expect(scenario.code).toContain("<Text>Below</Text>");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
	});

	it("keeps link hero, paragraph, and external contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/link");
		expect(screen.getByRole("heading", { name: "Basic Link" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Inline in Paragraph" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "External Links" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="link-basic-link"]');
		expect(hero).toBeTruthy();
		const sectionLinks = screen.getAllByRole("link", { name: "Inline link" });
		expect(sectionLinks).toHaveLength(2);
		for (const link of sectionLinks) {
			expect(link).toHaveAttribute("href", "#section");
		}
		const docsLink = screen.getByRole("link", { name: "docs" });
		expect(docsLink).toHaveAttribute("href", "#docs");
		const external = screen.getByRole("link", { name: "Example" });
		expect(external).toHaveAttribute("href", "https://example.com");
		expect(external).not.toHaveAttribute("target");
		expect(external).not.toHaveAttribute("rel");
		for (const scenario of UI_EXAMPLES.link ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/link");
			expect(scenario.code).toContain("LinkProvider");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const scenario of UI_EXAMPLES.link ?? []) {
			expect(markdown).toContain(scenario.code);
		}
	});

	it("keeps tooltip hero, compound triggers, and popup contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/tooltip");
		expect(screen.getByRole("heading", { name: "Basic Tooltip" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Multiple Tooltips" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="tooltip-basic-tooltip"]');
		expect(hero).toBeTruthy();
		if (!hero) {
			throw new Error("missing tooltip hero");
		}
		const hover = within(hero as HTMLElement).getByRole("button", { name: "Hover" });
		expect(hover.tagName).toBe("BUTTON");
		expect(hover).toHaveClass("border");
		await act(async () => {
			fireEvent.focus(hover);
			fireEvent.pointerMove(hover);
			fireEvent.pointerEnter(hover);
		});
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Hint");
		await act(async () => {
			fireEvent.pointerLeave(hover);
			fireEvent.blur(hover);
		});
		const multiple = document.querySelector('[data-scenario="tooltip-multiple-tooltips"]');
		expect(multiple).toBeTruthy();
		if (!multiple) {
			throw new Error("missing multiple tooltips scenario");
		}
		expect(multiple.querySelector(".flex.flex-wrap.items-center.gap-3")).toBeTruthy();
		const one = within(multiple as HTMLElement).getByRole("button", { name: "One" });
		const two = within(multiple as HTMLElement).getByRole("button", { name: "Two" });
		expect(one.tagName).toBe("BUTTON");
		expect(two.tagName).toBe("BUTTON");
		await act(async () => {
			fireEvent.focus(one);
			fireEvent.pointerMove(one);
			fireEvent.pointerEnter(one);
		});
		expect(await screen.findByRole("tooltip")).toHaveTextContent("First");
		await act(async () => {
			fireEvent.pointerLeave(one);
			fireEvent.blur(one);
		});
		await act(async () => {
			fireEvent.focus(two);
			fireEvent.pointerMove(two);
			fireEvent.pointerEnter(two);
		});
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Second");
		for (const scenario of UI_EXAMPLES.tooltip ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/tooltip");
			expect(scenario.code).toContain("TooltipProvider");
			expect(scenario.code).toContain("TooltipTrigger asChild");
			expect(scenario.code).toContain("TooltipContent");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const scenario of UI_EXAMPLES.tooltip ?? []) {
			expect(markdown).toContain(scenario.code);
		}
	});

	it("keeps theme-toggle hero, accessible name, and cycle contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		window.localStorage.removeItem("theme");
		document.documentElement.classList.remove("dark", "light");
		delete document.documentElement.dataset.mode;
		renderCatalog("/ui/theme-toggle");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="theme-toggle-default"]');
		const example = document.querySelector('[data-scenario="theme-toggle-default"]');
		expect(hero).toBeTruthy();
		expect(example).toBeTruthy();
		if (!hero || !example) {
			throw new Error("missing theme-toggle scenario surfaces");
		}
		const heroButton = within(hero as HTMLElement).getByRole("button", { name: "Toggle theme" });
		const exampleButton = within(example as HTMLElement).getByRole("button", {
			name: "Toggle theme",
		});
		expect(heroButton).toHaveClass("h-9", "w-9", "hover:bg-basalt-accent");
		const iconClass = (button: HTMLElement) =>
			button.querySelector("svg")?.getAttribute("class") ?? "";
		expect(iconClass(heroButton)).toContain("lucide-monitor");
		expect(window.localStorage.getItem("theme")).toBeNull();
		fireEvent.click(heroButton);
		expect(window.localStorage.getItem("theme")).toBe("light");
		expect(document.documentElement).toHaveClass("light");
		expect(document.documentElement.dataset.mode).toBe("light");
		expect(iconClass(heroButton)).toContain("lucide-sun");
		fireEvent.click(heroButton);
		expect(window.localStorage.getItem("theme")).toBe("dark");
		expect(document.documentElement).toHaveClass("dark");
		expect(document.documentElement.dataset.mode).toBe("dark");
		expect(iconClass(heroButton)).toContain("lucide-moon");
		fireEvent.click(heroButton);
		expect(window.localStorage.getItem("theme")).toBe("system");
		expect(document.documentElement).toHaveClass("light");
		expect(document.documentElement.dataset.mode).toBe("light");
		expect(iconClass(heroButton)).toContain("lucide-monitor");
		expect(exampleButton).toHaveAccessibleName("Toggle theme");
		for (const scenario of UI_EXAMPLES["theme-toggle"] ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/theme-toggle");
			expect(scenario.code).toContain("@nocoo/basalt/providers/theme");
			expect(scenario.code).toContain("ThemeProvider");
			expect(scenario.code).toContain('aria-label="Toggle theme"');
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(UI_EXAMPLES["theme-toggle"]?.[0]?.code ?? "");
		expect(markdown).toContain("ThemeProvider");
		expect(markdown).toContain("@nocoo/basalt/providers/theme");
	});

	it("keeps layer-card hero, width, padding, and wrapper contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/layer-card");
		expect(screen.getByRole("heading", { name: "Basic Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Surface-style Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Multiple Cards" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Structured Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Loading and Empty" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="layer-card-basic-card"]');
		expect(hero).toBeTruthy();
		if (!hero) {
			throw new Error("missing layer-card hero");
		}
		const heroCard = hero.querySelector(".w-\\[250px\\]");
		expect(heroCard).toBeTruthy();
		expect(hero).toHaveTextContent("Next Steps");
		expect(hero).toHaveTextContent("Hello");
		const surface = document.querySelector('[data-scenario="layer-card-surface-style-card"]');
		expect(surface).toBeTruthy();
		expect(surface?.querySelector(".w-\\[250px\\].p-4")).toBeTruthy();
		expect(surface).toHaveTextContent("Quick start guide");
		const multiple = document.querySelector('[data-scenario="layer-card-multiple-cards"]');
		expect(multiple).toBeTruthy();
		if (!multiple) {
			throw new Error("missing multiple cards scenario");
		}
		expect(multiple.querySelector(".flex.w-full.gap-4")).toBeTruthy();
		expect(multiple.querySelectorAll(".w-\\[200px\\]")).toHaveLength(2);
		expect(multiple).toHaveTextContent("Components");
		expect(multiple).toHaveTextContent("Browse all components");
		expect(multiple).toHaveTextContent("Examples");
		expect(multiple).toHaveTextContent("View code examples");
		const structured = document.querySelector('[data-scenario="layer-card-structured-card"]');
		expect(structured).toHaveTextContent("Deployment");
		expect(structured).toHaveTextContent("All checks have passed.");
		expect(structured).toHaveTextContent("Review");
		expect(structured).toHaveTextContent("Deploy");
		const states = document.querySelector('[data-scenario="layer-card-loading-empty"]');
		expect(states).toHaveTextContent("No activity");
		expect(states).toHaveTextContent("New events will appear here.");
		const loading = states?.querySelector('[role="status"]');
		expect(loading).toHaveAttribute("aria-label", "Loading account activity");
		expect(loading?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
		for (const scenario of UI_EXAMPLES["layer-card"] ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/layer-card");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		expect(UI_EXAMPLES["layer-card"]?.[0]?.code).toContain('className="w-[250px]"');
		expect(UI_EXAMPLES["layer-card"]?.[1]?.code).toContain('className="w-[250px] p-4"');
		expect(UI_EXAMPLES["layer-card"]?.[2]?.code).toContain('className="flex w-full gap-4"');
		expect(UI_EXAMPLES["layer-card"]?.[3]?.code).toContain("<LayerCard.Header>");
		expect(UI_EXAMPLES["layer-card"]?.[4]?.code).toContain(
			'<LayerCard.Loading label="Loading account activity" />',
		);
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const scenario of UI_EXAMPLES["layer-card"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
	});

	it("keeps basalt-mark hero, mountain mark, and copyable module", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/basalt-mark");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="basalt-mark-default"]');
		const example = document.querySelector('[data-scenario="basalt-mark-default"]');
		expect(hero).toBeTruthy();
		expect(example).toBeTruthy();
		if (!hero || !example) {
			throw new Error("missing basalt-mark scenario surfaces");
		}
		const heroMark = hero.querySelector('svg[aria-label="Basalt"]');
		const exampleMark = example.querySelector('svg[aria-label="Basalt"]');
		expect(heroMark).toBeTruthy();
		expect(exampleMark).toBeTruthy();
		expect(heroMark?.tagName).toBe("svg");
		expect(heroMark).toHaveClass("h-5", "w-5", "text-basalt-primary");
		expect(heroMark).toHaveAttribute("stroke-width", "1.5");
		expect(heroMark).toHaveAttribute("aria-label", "Basalt");
		expect(heroMark?.getAttribute("class") ?? "").toContain("lucide-mountain");
		expect(exampleMark).toHaveClass("h-5", "w-5", "text-basalt-primary");
		expect(exampleMark).toHaveAttribute("stroke-width", "1.5");
		expect(exampleMark).toHaveAccessibleName("Basalt");
		for (const scenario of UI_EXAMPLES["basalt-mark"] ?? []) {
			expect(scenario.code).toContain("export default function Example");
			expect(scenario.code).toContain("@nocoo/basalt/components/basalt-mark");
			expect(scenario.code).toContain("<BasaltMark />");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(UI_EXAMPLES["basalt-mark"]?.[0]?.code ?? "");
		expect(markdown).toContain("export default function Example");
		expect(markdown).toContain("@nocoo/basalt/components/basalt-mark");
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
	});

	it("keeps field hero, hint, error, and association contracts", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/field");
		expect(screen.getByRole("heading", { name: "Hint" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Rich label and optional" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Structured error" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="field-hint"]');
		const hint = document.querySelector('[data-scenario="field-hint"]');
		const error = document.querySelector('[data-scenario="field-error"]');
		const rich = document.querySelector('[data-scenario="field-rich-label-and-optional"]');
		const structured = document.querySelector('[data-scenario="field-structured-error"]');
		expect(hero).toBeTruthy();
		expect(hint).toBeTruthy();
		expect(error).toBeTruthy();
		expect(rich).toBeTruthy();
		expect(structured).toBeTruthy();
		if (!hero || !hint || !error || !rich || !structured) {
			throw new Error("missing field scenario surfaces");
		}
		const heroLabel = hero.querySelector('label[for="field-hint-email"]');
		const heroInput = hero.querySelector("#field-hint-email");
		expect(heroLabel).toHaveTextContent("Email");
		expect(heroInput).toHaveAttribute("aria-describedby", "field-hint-email-hint");
		expect(heroInput).not.toHaveAttribute("aria-invalid");
		expect(hero.querySelector("#field-hint-email-hint")).toHaveTextContent("Never shared");
		const hintLabel = hint.querySelector('label[for="field-hint-email"]');
		const hintInput = hint.querySelector("#field-hint-email");
		expect(hintLabel).toHaveTextContent("Email");
		expect(hintInput).toHaveAttribute("id", "field-hint-email");
		expect(hintInput).toHaveAttribute("aria-describedby", "field-hint-email-hint");
		expect(hint.querySelector("#field-hint-email-hint")).toHaveClass(
			"text-xs",
			"text-basalt-muted-foreground",
		);
		const errorLabel = error.querySelector('label[for="field-error-email"]');
		const errorInput = error.querySelector("#field-error-email");
		expect(errorLabel).toHaveTextContent("Email");
		expect(errorInput).toHaveAttribute("aria-describedby", "field-error-email-error");
		expect(errorInput).toHaveAttribute("aria-invalid", "true");
		const alert = within(error as HTMLElement).getByRole("alert");
		expect(alert).toHaveTextContent("Required");
		expect(alert).toHaveAttribute("id", "field-error-email-error");
		expect(alert).toHaveClass("text-xs", "text-basalt-destructive");
		expect(rich).toHaveTextContent("Workspace name");
		expect(rich).toHaveTextContent("(optional)");
		expect(rich).toHaveTextContent("Shown on invoices");
		expect(rich.querySelector('button[aria-label="More information"]')).toBeTruthy();
		const richInput = rich.querySelector("input");
		expect(richInput).toHaveAttribute("id");
		expect(rich.querySelector(`label[for="${richInput?.getAttribute("id")}"]`)).toHaveTextContent(
			"Workspace name",
		);
		expect(structured).toHaveTextContent("Enter a valid email");
		const structuredInput = structured.querySelector("input");
		expect(structuredInput).toBeTruthy();
		const structuredId = structuredInput?.getAttribute("id");
		expect(structuredInput).toHaveAttribute("aria-invalid", "true");
		expect(structuredInput).toHaveAttribute("aria-describedby", `${structuredId}-error`);
		expect(within(structured as HTMLElement).getByRole("alert")).toHaveTextContent(
			"Enter a valid email",
		);
		for (const scenario of UI_EXAMPLES.field ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/field");
			expect(scenario.code).toContain("@nocoo/basalt/components/input");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const scenario of UI_EXAMPLES.field ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('htmlFor="field-hint-email"');
		expect(markdown).toContain('htmlFor="field-error-email"');
	});

	it("keeps input hero, field associations, types wrapper, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/input");
		expect(screen.getByRole("heading", { name: "With Label and Description" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "With Error (String)" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Input Types" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Bare Input (No Label)" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and reset" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="input-with-label-and-description"]');
		const labeled = document.querySelector('[data-scenario="input-with-label-and-description"]');
		const error = document.querySelector('[data-scenario="input-with-error-string"]');
		const disabled = document.querySelector('[data-scenario="input-disabled"]');
		const types = document.querySelector('[data-scenario="input-input-types"]');
		const bare = document.querySelector('[data-scenario="input-bare-input-no-label"]');
		const sizes = document.querySelector('[data-scenario="input-sizes"]');
		const controlled = document.querySelector('[data-scenario="input-controlled-and-reset"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(error).toBeTruthy();
		expect(disabled).toBeTruthy();
		expect(types).toBeTruthy();
		expect(bare).toBeTruthy();
		expect(sizes).toBeTruthy();
		expect(controlled).toBeTruthy();
		if (!hero || !labeled || !error || !disabled || !types || !bare || !sizes || !controlled) {
			throw new Error("missing input scenario surfaces");
		}
		const heroLabel = hero.querySelector('label[for="ex-input-email"]');
		const heroInput = hero.querySelector("#ex-input-email");
		expect(heroLabel).toHaveTextContent("Email");
		expect(heroInput).toHaveAttribute("aria-describedby", "ex-input-email-hint");
		expect(heroInput).not.toHaveAttribute("aria-invalid");
		expect(hero.querySelector("#ex-input-email-hint")).toHaveTextContent("Never shared");
		const labeledInput = labeled.querySelector("#ex-input-email");
		expect(labeled.querySelector('label[for="ex-input-email"]')).toHaveTextContent("Email");
		expect(labeledInput).toHaveAttribute("placeholder", "you@example.com");
		expect(labeledInput).toHaveAttribute("aria-describedby", "ex-input-email-hint");
		const errorInput = error.querySelector("#ex-input-err");
		expect(error.querySelector('label[for="ex-input-err"]')).toHaveTextContent("Email");
		expect(errorInput).toHaveAttribute("aria-describedby", "ex-input-err-error");
		expect(errorInput).toHaveAttribute("aria-invalid", "true");
		const alert = within(error as HTMLElement).getByRole("alert");
		expect(alert).toHaveTextContent("Required");
		expect(alert).toHaveAttribute("id", "ex-input-err-error");
		const disabledInput = within(disabled as HTMLElement).getByRole("textbox", {
			name: "Disabled input",
		});
		expect(disabledInput).toBeDisabled();
		expect(disabledInput).toHaveValue("Read only");
		const typeRoot = types.querySelector("div.flex.w-full.flex-col.gap-3");
		expect(typeRoot).toBeTruthy();
		const typeInputs = typeRoot?.querySelectorAll("input") ?? [];
		expect(typeInputs).toHaveLength(3);
		expect(typeInputs[0]).toHaveAttribute("type", "email");
		expect(typeInputs[0]).toHaveAttribute("placeholder", "Email");
		expect(typeInputs[0]).toHaveAccessibleName("Email type");
		expect(typeInputs[1]).toHaveAttribute("type", "password");
		expect(typeInputs[1]).toHaveAttribute("placeholder", "Password");
		expect(typeInputs[1]).toHaveAccessibleName("Password type");
		expect(typeInputs[2]).toHaveAttribute("type", "search");
		expect(typeInputs[2]).toHaveAttribute("placeholder", "Search");
		expect(typeInputs[2]).toHaveAccessibleName("Search type");
		expect(within(bare as HTMLElement).getByRole("textbox", { name: "Name" })).toHaveAttribute(
			"placeholder",
			"Jane Doe",
		);
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Small" }).className,
		).toContain("h-8");
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Default" }).className,
		).toContain("h-9");
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Large" }).className,
		).toContain("h-10");
		expect(within(controlled as HTMLElement).getByRole("textbox", { name: "Name" })).toHaveValue(
			"Ada",
		);
		expect(within(controlled as HTMLElement).getByRole("button", { name: "Reset" })).toBeEnabled();
		for (const scenario of UI_EXAMPLES.input ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/input");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.input).toHaveLength(7);
		for (const scenario of UI_EXAMPLES.input ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('<div className="flex w-full flex-col gap-3">');
		expect(markdown).toContain('htmlFor="ex-input-email"');
		expect(markdown).toContain('htmlFor="ex-input-err"');
	});

	it("keeps input-area hero, field associations, rows, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/input-area");
		expect(screen.getByRole("heading", { name: "With Label" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Custom Row Count" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error State (String)" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and reset" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="input-area-with-label"]');
		const labeled = document.querySelector('[data-scenario="input-area-with-label"]');
		const rows = document.querySelector('[data-scenario="input-area-custom-row-count"]');
		const error = document.querySelector('[data-scenario="input-area-error-state-string"]');
		const disabled = document.querySelector('[data-scenario="input-area-disabled"]');
		const sizes = document.querySelector('[data-scenario="input-area-sizes"]');
		const controlled = document.querySelector('[data-scenario="input-area-controlled-and-reset"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(rows).toBeTruthy();
		expect(error).toBeTruthy();
		expect(disabled).toBeTruthy();
		expect(sizes).toBeTruthy();
		expect(controlled).toBeTruthy();
		if (!hero || !labeled || !rows || !error || !disabled || !sizes || !controlled) {
			throw new Error("missing input-area scenario surfaces");
		}
		const heroLabel = hero.querySelector('label[for="ex-notes"]');
		const heroArea = hero.querySelector("#ex-notes");
		expect(heroLabel).toHaveTextContent("Notes");
		expect(heroArea).not.toHaveAttribute("aria-invalid");
		expect(labeled.querySelector('label[for="ex-notes"]')).toHaveTextContent("Notes");
		expect(labeled.querySelector("#ex-notes")).toHaveAttribute("id", "ex-notes");
		expect(
			within(rows as HTMLElement).getByRole("textbox", { name: "Tall notes" }),
		).toHaveAttribute("rows", "6");
		const errorArea = error.querySelector("#ex-bio");
		expect(error.querySelector('label[for="ex-bio"]')).toHaveTextContent("Bio");
		expect(errorArea).toHaveAttribute("aria-describedby", "ex-bio-error");
		expect(errorArea).toHaveAttribute("aria-invalid", "true");
		const alert = within(error as HTMLElement).getByRole("alert");
		expect(alert).toHaveTextContent("Too short");
		expect(alert).toHaveAttribute("id", "ex-bio-error");
		const disabledArea = within(disabled as HTMLElement).getByRole("textbox", {
			name: "Disabled notes",
		});
		expect(disabledArea).toBeDisabled();
		expect(disabledArea).toHaveValue("Unavailable");
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Small notes" }).className,
		).toContain("min-h-[64px]");
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Default notes" }).className,
		).toContain("min-h-[80px]");
		expect(
			within(sizes as HTMLElement).getByRole("textbox", { name: "Large notes" }).className,
		).toContain("min-h-[96px]");
		expect(within(controlled as HTMLElement).getByRole("textbox", { name: "Notes" })).toHaveValue(
			"Ada",
		);
		expect(within(controlled as HTMLElement).getByRole("button", { name: "Reset" })).toBeEnabled();
		for (const scenario of UI_EXAMPLES["input-area"] ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/input-area");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES["input-area"]).toHaveLength(6);
		for (const scenario of UI_EXAMPLES["input-area"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('htmlFor="ex-notes"');
		expect(markdown).toContain('htmlFor="ex-bio"');
		expect(markdown).toContain("rows={6}");
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
	});

	it("keeps input-group hero, compound previews, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/input-group");
		expect(screen.getByRole("heading", { name: "Inline Suffix" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Icon" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Text" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Button" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Loading" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="input-group-inline-suffix"]');
		const suffix = document.querySelector('[data-scenario="input-group-inline-suffix"]');
		const icon = document.querySelector('[data-scenario="input-group-icon"]');
		const text = document.querySelector('[data-scenario="input-group-text"]');
		const button = document.querySelector('[data-scenario="input-group-button"]');
		const loading = document.querySelector('[data-scenario="input-group-loading"]');
		expect(hero).toBeTruthy();
		expect(suffix).toBeTruthy();
		expect(icon).toBeTruthy();
		expect(text).toBeTruthy();
		expect(button).toBeTruthy();
		expect(loading).toBeTruthy();
		if (!hero || !suffix || !icon || !text || !button || !loading) {
			throw new Error("missing input-group scenario surfaces");
		}
		for (const node of [hero, suffix, icon, text, button, loading]) {
			expect(node.querySelector('[data-slot="input-group"]')).toHaveClass("max-w-sm");
		}
		expect(within(hero as HTMLElement).getByRole("textbox", { name: "Subdomain" })).toHaveValue(
			"atlas",
		);
		expect(hero).toHaveTextContent(".example.com");
		expect(hero.querySelector(".text-basalt-heatmap-green-3")).toBeTruthy();
		expect(within(suffix as HTMLElement).getByRole("textbox", { name: "Subdomain" })).toHaveValue(
			"atlas",
		);
		expect(suffix).toHaveTextContent(".example.com");
		expect(suffix.querySelector(".text-basalt-heatmap-green-3")).toBeTruthy();
		expect(within(icon as HTMLElement).getByRole("textbox", { name: "Search" })).toHaveAttribute(
			"placeholder",
			"Search",
		);
		expect(within(text as HTMLElement).getByRole("textbox", { name: "Host" })).toHaveAttribute(
			"placeholder",
			"example.com",
		);
		expect(text).toHaveTextContent("https://");
		expect(within(button as HTMLElement).getByRole("textbox", { name: "Query" })).toHaveAttribute(
			"placeholder",
			"Search",
		);
		expect(
			within(button as HTMLElement).getByRole("button", { name: "Search" }),
		).toBeInTheDocument();
		expect(
			within(loading as HTMLElement).getByRole("textbox", { name: "Loading query" }),
		).toHaveValue("atlas");
		expect(within(loading as HTMLElement).getByRole("status", { name: "Loading" })).toHaveAttribute(
			"width",
			"16",
		);
		for (const scenario of UI_EXAMPLES["input-group"] ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/input-group");
			expect(scenario.code).toContain('className="max-w-sm"');
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES["input-group"]).toHaveLength(5);
		for (const scenario of UI_EXAMPLES["input-group"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="text-basalt-heatmap-green-3"');
		expect(markdown).toContain("<Loader size={16} />");
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
		expect(CATALOG_DOCS["input-group"]?.api).toEqual(CATALOG_API["input-group"]);
		expect(CATALOG_API["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
		const surfaceIds = [
			"api-InputGroup",
			"api-InputGroup.Input",
			"api-InputGroup.Addon",
			"api-InputGroup.Button",
			"api-InputGroup.Suffix",
		];
		for (const id of surfaceIds) {
			expect(document.getElementById(id)?.tagName).toBe("H3");
			expect(document.querySelector(`[data-toc-id="${id}"]`)).toBeTruthy();
		}
		expect(screen.getByRole("table", { name: "InputGroup props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "InputGroup.Input props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "InputGroup.Addon props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "InputGroup.Button props" })).toBeInTheDocument();
		expect(
			screen.queryByRole("table", { name: "InputGroup.Suffix props" }),
		).not.toBeInTheDocument();
		const suffixHeading = document.getElementById("api-InputGroup.Suffix");
		const empty = suffixHeading?.parentElement?.querySelector("p");
		expect(empty).toHaveTextContent("No component-specific props.");
		expect(empty).toHaveClass("text-sm");
		expect(empty).toHaveClass("text-muted-foreground");
		expect(markdown).toContain("### InputGroup");
		expect(markdown).toContain("### InputGroup.Input");
		expect(markdown).toContain("### InputGroup.Addon");
		expect(markdown).toContain("### InputGroup.Button");
		expect(markdown).toContain("### InputGroup.Suffix");
		expect(markdown).toContain(
			"- disabled (boolean, optional, default false): Disable the input and nested actions.",
		);
		expect(markdown).toContain("- type (React.HTMLInputTypeAttribute, optional, default —):");
		expect(markdown).toContain("- align (");
		expect(markdown).toContain("default ghost");
		expect(markdown).toContain("default icon");
		expect(markdown).toContain("default false");
		expect(markdown).toContain("No component-specific props.");
	});

	it("does not special-case InputGroup or vendor names in the API page", () => {
		const generator = readFileSync(path.join(process.cwd(), "scripts/catalog-api.ts"), "utf8");
		const page = readFileSync(
			path.join(process.cwd(), "src/pages/ui/UiPlaceholderPage.tsx"),
			"utf8",
		);
		expect(generator).not.toMatch(/Cloudflare|Kumo|Workers?\b/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*InputGroup|\bswitch\s*\([^)]*input-group/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*SensitiveInput|\bswitch\s*\([^)]*sensitive-input/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*Checkbox|\bswitch\s*\([^)]*checkbox/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*Radio|\bswitch\s*\([^)]*radio/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*Switch|\bswitch\s*\([^)]*switch/);
		expect(generator).not.toMatch(/\bif\s*\([^)]*Select|\bswitch\s*\([^)]*select/);
		expect(page).not.toMatch(/input-group|InputGroup/);
		expect(page).not.toMatch(/sensitive-input|SensitiveInput/);
		expect(page).not.toMatch(/\bcheckbox\b|Checkbox/);
		expect(page).not.toMatch(/\bradio\b|Radio/);
		expect(page).not.toMatch(/\bswitch\b|Switch/);
		expect(page).not.toMatch(
			/\bSelectTrigger\b|\bSelectValue\b|\bSelectContent\b|\bSelectGroup\b|\bSelectItem\b/,
		);
		expect(page).not.toMatch(/Cloudflare|Kumo|Workers?\b/);
	});

	it("keeps sensitive-input hero, reveal toggle, disabled controls, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/sensitive-input");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="sensitive-input-default"]');
		const labeled = document.querySelector('[data-scenario="sensitive-input-default"]');
		const disabled = document.querySelector('[data-scenario="sensitive-input-disabled"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(disabled).toBeTruthy();
		if (!hero || !labeled || !disabled) {
			throw new Error("missing sensitive-input scenario surfaces");
		}
		const heroInput = within(hero as HTMLElement).getByLabelText("Password");
		expect(heroInput).toHaveAttribute("type", "password");
		expect(heroInput).toBeEnabled();
		fireEvent.click(within(hero as HTMLElement).getByRole("button", { name: "Show" }));
		expect(heroInput).toHaveAttribute("type", "text");
		fireEvent.click(within(hero as HTMLElement).getByRole("button", { name: "Hide" }));
		expect(heroInput).toHaveAttribute("type", "password");
		expect(within(hero as HTMLElement).getByRole("button", { name: "Show" })).toBeEnabled();
		expect(within(labeled as HTMLElement).getByLabelText("Password")).toHaveAttribute(
			"type",
			"password",
		);
		const disabledInput = within(disabled as HTMLElement).getByLabelText("Disabled password");
		const disabledToggle = within(disabled as HTMLElement).getByRole("button", { name: "Show" });
		expect(disabledInput).toHaveAttribute("type", "password");
		expect(disabledInput).toBeDisabled();
		expect(disabledToggle).toBeDisabled();
		fireEvent.click(disabledToggle);
		expect(disabledInput).toHaveAttribute("type", "password");
		for (const scenario of UI_EXAMPLES["sensitive-input"] ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/sensitive-input");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|API key|secret|token/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES["sensitive-input"]).toHaveLength(4);
		for (const scenario of UI_EXAMPLES["sensitive-input"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|API key|secret|token/i);
	});

	it("keeps checkbox hero, five states, error ARIA, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/checkbox");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Checked" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Indeterminate" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Group and legend" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Controlled and error" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="checkbox-default"]');
		const labeled = document.querySelector('[data-scenario="checkbox-default"]');
		const checked = document.querySelector('[data-scenario="checkbox-checked"]');
		const indeterminate = document.querySelector('[data-scenario="checkbox-indeterminate"]');
		const disabled = document.querySelector('[data-scenario="checkbox-disabled"]');
		const error = document.querySelector('[data-scenario="checkbox-error"]');
		const grouped = document.querySelector('[data-scenario="checkbox-group-and-legend"]');
		const controlled = document.querySelector('[data-scenario="checkbox-controlled-and-error"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(checked).toBeTruthy();
		expect(indeterminate).toBeTruthy();
		expect(disabled).toBeTruthy();
		expect(error).toBeTruthy();
		expect(grouped).toBeTruthy();
		expect(controlled).toBeTruthy();
		if (
			!hero ||
			!labeled ||
			!checked ||
			!indeterminate ||
			!disabled ||
			!error ||
			!grouped ||
			!controlled
		) {
			throw new Error("missing checkbox scenario surfaces");
		}
		const heroBox = within(hero as HTMLElement).getByRole("checkbox", { name: "Unchecked" });
		expect(heroBox).not.toBeChecked();
		expect(heroBox).toBeEnabled();
		fireEvent.click(heroBox);
		expect(heroBox).toBeChecked();
		fireEvent.click(heroBox);
		expect(heroBox).not.toBeChecked();
		expect(
			within(labeled as HTMLElement).getByRole("checkbox", { name: "Unchecked" }),
		).not.toBeChecked();
		expect(within(checked as HTMLElement).getByRole("checkbox", { name: "Checked" })).toBeChecked();
		const mixed = within(indeterminate as HTMLElement).getByRole("checkbox", { name: "Partial" });
		expect(mixed).toHaveAttribute("data-state", "indeterminate");
		expect(mixed).toHaveAttribute("aria-checked", "mixed");
		const disabledOff = within(disabled as HTMLElement).getByRole("checkbox", {
			name: "Disabled off",
		});
		const disabledOn = within(disabled as HTMLElement).getByRole("checkbox", {
			name: "Disabled on",
		});
		expect(disabled.querySelector(".flex.flex-wrap.items-center.gap-3")).toBeTruthy();
		expect(disabledOff).toBeDisabled();
		expect(disabledOn).toBeDisabled();
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		fireEvent.click(disabledOff);
		fireEvent.click(disabledOn);
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		const terms = within(error as HTMLElement).getByRole("checkbox", { name: "Terms" });
		expect(terms).toHaveAttribute("id", "ex-terms");
		expect(terms).toHaveAttribute("aria-invalid", "true");
		expect(terms).toHaveAttribute("aria-describedby", "ex-terms-error");
		const alert = within(error as HTMLElement).getByRole("alert");
		expect(alert).toHaveAttribute("id", "ex-terms-error");
		expect(alert).toHaveTextContent("Required");
		expect(within(grouped as HTMLElement).getByRole("checkbox", { name: "Alpha" })).toBeChecked();
		expect(
			within(grouped as HTMLElement).getByRole("checkbox", { name: "Beta" }),
		).not.toBeChecked();
		expect(within(controlled as HTMLElement).getByRole("alert")).toHaveTextContent(
			"Pick at least two",
		);
		for (const scenario of UI_EXAMPLES.checkbox ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/checkbox");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.checkbox).toHaveLength(7);
		for (const scenario of UI_EXAMPLES.checkbox ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="flex flex-wrap items-center gap-3"');
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
		expect(CATALOG_DOCS["sensitive-input"]?.api).toEqual(CATALOG_API["sensitive-input"]);
		expect(UI_EXAMPLES["sensitive-input"]).toHaveLength(4);
	});

	it("keeps radio hero, exclusive selection, disabled radios, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/radio");
		expect(screen.getByRole("heading", { name: "Default (Vertical)" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Horizontal" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="radio-default-vertical"]');
		const labeled = document.querySelector('[data-scenario="radio-default-vertical"]');
		const horizontal = document.querySelector('[data-scenario="radio-horizontal"]');
		const disabled = document.querySelector('[data-scenario="radio-disabled"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(horizontal).toBeTruthy();
		expect(disabled).toBeTruthy();
		if (!hero || !labeled || !horizontal || !disabled) {
			throw new Error("missing radio scenario surfaces");
		}
		const heroAlpha = within(hero as HTMLElement).getByRole("radio", { name: "Alpha" });
		const heroBeta = within(hero as HTMLElement).getByRole("radio", { name: "Beta" });
		expect(heroAlpha).toBeChecked();
		expect(heroBeta).not.toBeChecked();
		fireEvent.click(heroBeta);
		expect(heroBeta).toBeChecked();
		expect(heroAlpha).not.toBeChecked();
		expect(within(labeled as HTMLElement).getByRole("radio", { name: "Alpha" })).toBeChecked();
		expect(within(labeled as HTMLElement).getByRole("radio", { name: "Beta" })).not.toBeChecked();
		const horizontalAlpha = within(horizontal as HTMLElement).getByRole("radio", { name: "Alpha" });
		const horizontalBeta = within(horizontal as HTMLElement).getByRole("radio", { name: "Beta" });
		expect(horizontalAlpha).toBeChecked();
		expect(horizontalBeta).not.toBeChecked();
		fireEvent.click(horizontalBeta);
		expect(horizontalBeta).toBeChecked();
		expect(horizontalAlpha).not.toBeChecked();
		expect(horizontal.querySelector(".flex.gap-4")).toBeTruthy();
		const disabledA = within(disabled as HTMLElement).getByRole("radio", { name: "Disabled A" });
		const disabledB = within(disabled as HTMLElement).getByRole("radio", { name: "Disabled B" });
		expect(disabled.querySelector(".flex.gap-4")).toBeTruthy();
		expect(disabledA).toBeDisabled();
		expect(disabledB).toBeDisabled();
		expect(disabledA).toBeChecked();
		expect(disabledB).not.toBeChecked();
		fireEvent.click(disabledB);
		expect(disabledA).toBeChecked();
		expect(disabledB).not.toBeChecked();
		for (const scenario of UI_EXAMPLES.radio ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/radio");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.radio).toHaveLength(5);
		for (const scenario of UI_EXAMPLES.radio ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="flex flex-col gap-2"');
		expect(markdown).toContain('className="flex gap-4"');
		expect(markdown).toContain(
			"- value (string, required, default —): The value associated with the radio item.",
		);
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
		expect(CATALOG_DOCS.checkbox?.api).toEqual(CATALOG_API.checkbox);
		expect(CATALOG_DOCS.radio?.api).toEqual(CATALOG_API.radio);
		expect(UI_EXAMPLES.checkbox).toHaveLength(7);
	});

	it("keeps switch hero, four states, sizes, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/switch");
		expect(screen.getByRole("heading", { name: "Off State" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "On State" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="switch-off-state"]');
		const off = document.querySelector('[data-scenario="switch-off-state"]');
		const on = document.querySelector('[data-scenario="switch-on-state"]');
		const disabled = document.querySelector('[data-scenario="switch-disabled"]');
		const sizes = document.querySelector('[data-scenario="switch-sizes"]');
		expect(hero).toBeTruthy();
		expect(off).toBeTruthy();
		expect(on).toBeTruthy();
		expect(disabled).toBeTruthy();
		expect(sizes).toBeTruthy();
		if (!hero || !off || !on || !disabled || !sizes) {
			throw new Error("missing switch scenario surfaces");
		}
		const heroSwitch = within(hero as HTMLElement).getByRole("switch", { name: "Off" });
		expect(heroSwitch).not.toBeChecked();
		expect(heroSwitch).toBeEnabled();
		fireEvent.click(heroSwitch);
		expect(heroSwitch).toBeChecked();
		expect(within(off as HTMLElement).getByRole("switch", { name: "Off" })).not.toBeChecked();
		const onSwitch = within(on as HTMLElement).getByRole("switch", { name: "On" });
		expect(onSwitch).toBeChecked();
		fireEvent.click(onSwitch);
		expect(onSwitch).not.toBeChecked();
		expect(within(hero as HTMLElement).getByRole("switch", { name: "Off" })).toBeChecked();
		expect(disabled.querySelector(".flex.flex-wrap.items-center.gap-3")).toBeTruthy();
		const disabledOff = within(disabled as HTMLElement).getByRole("switch", {
			name: "Disabled off",
		});
		const disabledOn = within(disabled as HTMLElement).getByRole("switch", {
			name: "Disabled on",
		});
		expect(disabledOff).toBeDisabled();
		expect(disabledOn).toBeDisabled();
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		fireEvent.click(disabledOff);
		fireEvent.click(disabledOn);
		expect(disabledOff).not.toBeChecked();
		expect(disabledOn).toBeChecked();
		expect(sizes.querySelector(".flex.flex-wrap.items-center.gap-3")).toBeTruthy();
		const small = within(sizes as HTMLElement).getByRole("switch", { name: "Small" });
		const defaultSize = within(sizes as HTMLElement).getByRole("switch", { name: "Default size" });
		expect(small).toBeChecked();
		expect(defaultSize).toBeChecked();
		expect(small).toBeEnabled();
		expect(defaultSize).toBeEnabled();
		expect(small.className).toContain("h-4");
		expect(small.className).toContain("w-7");
		expect(defaultSize.className).toContain("h-6");
		expect(defaultSize.className).toContain("w-11");
		for (const scenario of UI_EXAMPLES.switch ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/switch");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.switch).toHaveLength(6);
		for (const scenario of UI_EXAMPLES.switch ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="flex flex-wrap items-center gap-3"');
		expect(markdown).toContain(
			"- checked (boolean, optional, default —): The controlled checked state of the switch.",
		);
		expect(markdown).toContain(
			'- size ("default" | "sm", optional, default default): The visual size of the switch.',
		);
		expect(markdown).toContain("github.com/cloudflare/kumo/blob/1159868dfe32/");
		expect(markdown).not.toContain("github.com/nocoo/kumo");
		expect(CATALOG_DOCS.radio?.api).toEqual(CATALOG_API.radio);
		expect(CATALOG_DOCS.switch?.api).toEqual(CATALOG_API.switch);
		expect(UI_EXAMPLES.radio).toHaveLength(5);
	});

	it("keeps select hero, three states, disabled option, and copy modules", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui/select");
		expect(screen.getByRole("heading", { name: "Basic" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Placeholder" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled Options" })).toBeInTheDocument();
		const hero = document.querySelector('[data-hero-scenario="select-basic"]');
		const basic = document.querySelector('[data-scenario="select-basic"]');
		const placeholder = document.querySelector('[data-scenario="select-placeholder"]');
		const disabled = document.querySelector('[data-scenario="select-disabled-options"]');
		expect(hero).toBeTruthy();
		expect(basic).toBeTruthy();
		expect(placeholder).toBeTruthy();
		expect(disabled).toBeTruthy();
		if (!hero || !basic || !placeholder || !disabled) {
			throw new Error("missing select scenario surfaces");
		}
		const heroTrigger = within(hero as HTMLElement).getByRole("combobox", { name: "Version" });
		const labeledTrigger = within(basic as HTMLElement).getByRole("combobox", { name: "Version" });
		const emptyTrigger = within(placeholder as HTMLElement).getByRole("combobox", {
			name: "Empty select",
		});
		const disabledTrigger = within(disabled as HTMLElement).getByRole("combobox", {
			name: "Disabled option",
		});
		expect(heroTrigger.className).toContain("w-48");
		expect(labeledTrigger.className).toContain("w-48");
		expect(emptyTrigger.className).toContain("w-48");
		expect(disabledTrigger.className).toContain("w-48");
		expect(heroTrigger).toHaveTextContent("Select version");
		expect(labeledTrigger).toHaveTextContent("Select version");
		expect(emptyTrigger).toHaveTextContent("Choose…");
		expect(disabledTrigger).toHaveTextContent("Choose…");
		const api = document.getElementById("api-reference");
		expect(document.getElementById("api-Select")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectTrigger")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectValue")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectContent")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectGroup")?.tagName).toBe("H3");
		expect(document.getElementById("api-SelectItem")?.tagName).toBe("H3");
		expect(screen.getByRole("table", { name: "Select props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectValue props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectContent props" })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: "SelectItem props" })).toBeInTheDocument();
		expect(screen.queryByRole("table", { name: "SelectTrigger props" })).not.toBeInTheDocument();
		expect(screen.queryByRole("table", { name: "SelectGroup props" })).not.toBeInTheDocument();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(5);
		expect(api).toHaveTextContent("value?");
		expect(api).toHaveTextContent("placeholder?");
		expect(api).not.toHaveTextContent("className");
		expect(CATALOG_DOCS.select?.api).toEqual(CATALOG_API.select);
		fireEvent.click(heroTrigger);
		fireEvent.click(screen.getByRole("option", { name: "v2" }));
		expect(heroTrigger).toHaveTextContent("v2");
		expect(labeledTrigger).toHaveTextContent("Select version");
		fireEvent.click(emptyTrigger);
		fireEvent.click(screen.getByRole("option", { name: "Alpha" }));
		expect(emptyTrigger).toHaveTextContent("Alpha");
		fireEvent.click(disabledTrigger);
		const beta = screen.getByRole("option", { name: "Beta" });
		expect(screen.getByRole("option", { name: "Alpha" })).not.toHaveAttribute(
			"aria-disabled",
			"true",
		);
		expect(beta).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(beta);
		expect(disabledTrigger).toHaveTextContent("Choose…");
		fireEvent.keyDown(disabledTrigger, { key: "Escape" });
		for (const scenario of UI_EXAMPLES.select ?? []) {
			expect(scenario.code).toContain("export default");
			expect(scenario.code).toContain("@nocoo/basalt/components/select");
			expect(scenario.code).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
			const node = document.querySelector(`[data-scenario="${scenario.id}"]`);
			expect(node).toBeTruthy();
			expect(node).toHaveTextContent(scenario.code.split("\n")[0] ?? "");
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(UI_EXAMPLES.select).toHaveLength(3);
		for (const scenario of UI_EXAMPLES.select ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="w-48"');
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
		expect(CATALOG_DOCS.switch?.api).toEqual(CATALOG_API.switch);
		expect(UI_EXAMPLES.switch).toHaveLength(6);
	});

	it("renders extra home tiles from the first catalog scenario", () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		renderCatalog("/ui");
		const accordionLink = screen.getByRole("link", { name: "Accordion" });
		const tile = accordionLink.closest("li");
		expect(tile).toBeTruthy();
		if (!tile) {
			return;
		}
		const preview = within(tile);
		expect(preview.getByRole("button", { name: "Item" })).toBeInTheDocument();
		fireEvent.click(preview.getByRole("button", { name: "Item" }));
		expect(preview.getByText("Body")).toBeInTheDocument();
	});
});
