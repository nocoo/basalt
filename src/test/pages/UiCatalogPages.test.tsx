import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
import { catalogScenarioMatchesSlug } from "@/pages/ui/catalog-scenario";
import {
	catalogSourceCopyText,
	githubSourceHref,
	githubSourceLabel,
} from "@/pages/ui/catalog-source";
import { catalogHeroScenario, UI_EXAMPLES } from "@/pages/ui/demos";
import { CATALOG_DOCS } from "@/pages/ui/docs";
import { CATALOG_API } from "@/pages/ui/generated/catalog-api";
import { KUMO_DOCS_SLUGS } from "@/pages/ui/kumo-list";
import UiIndexPage from "@/pages/ui/UiIndexPage";
import UiPlaceholderPage, {
	CatalogApiReference,
	catalogApiSurfaceId,
} from "@/pages/ui/UiPlaceholderPage";

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
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf("\tbutton: {");
		const end = docs.indexOf('\t"link-button":');
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain("api: CATALOG_API.button");
		expect(block).not.toContain('name: "variant"');
		expect(block).not.toContain('name: "asChild"');
		expect(block).not.toContain('name: "loading"');
		expect(block).not.toContain('name: "icon"');
		expect(block).not.toContain("ReactNode");
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
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf('\t"link-button": {');
		const end = docs.indexOf("\ttext: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain('api: CATALOG_API["link-button"]');
		expect(block).not.toContain('name: "variant"');
		expect(block).not.toContain('name: "size"');
		expect(block).not.toContain('name: "icon"');
		expect(block).not.toContain('name: "href"');
		expect(block).not.toContain("ReactNode");
		expect(block).toContain('href="/docs"');
	});

	it("sources text API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.text?.api).toEqual(CATALOG_API.text);
		expect(CATALOG_API.text?.[0]?.props.map((prop) => prop.name)).toEqual(["size", "tone"]);
		renderCatalog("/ui/text");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		for (const prop of CATALOG_API.text?.[0]?.props ?? []) {
			expect(api).toHaveTextContent(prop.name);
			expect(api).toHaveTextContent(prop.type);
			expect(api).toHaveTextContent(`${prop.name}?`);
		}
		expect(api).not.toHaveTextContent("children");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("truncate");
		expect(document.body.textContent).toContain("<Text tone='muted'>Copy</Text>");
		expect(screen.getByRole("heading", { name: "Sizes" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Muted tone" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const prop of CATALOG_API.text?.[0]?.props ?? []) {
			expect(markdown).toContain(`- ${prop.name} (${prop.type}, optional`);
		}
		expect(markdown).toContain("<Text tone='muted'>Copy</Text>");
		expect(markdown).not.toContain("- as (");
		expect(markdown).not.toContain("- children (");
	});

	it("does not keep a handwritten text prop inventory", () => {
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf("\ttext: {");
		const end = docs.indexOf("\tlabel: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain("api: CATALOG_API.text");
		expect(block).not.toContain('name: "size"');
		expect(block).not.toContain('name: "tone"');
		expect(block).toContain("<Text tone='muted'>Copy</Text>");
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
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf("\tlabel: {");
		const end = docs.indexOf("\tseparator: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain("api: CATALOG_API.label");
		expect(block).not.toContain('name: "htmlFor"');
		expect(block).not.toContain('name: "showOptional"');
		expect(block).not.toContain('name: "tooltip"');
		expect(block).not.toContain("ReactNode");
		expect(block).toContain('<Label htmlFor="email">Email</Label>');
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
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf("\tseparator: {");
		const end = docs.indexOf("\tlink: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain("api: CATALOG_API.separator");
		expect(block).not.toContain('name: "orientation"');
		expect(block).not.toContain('name: "decorative"');
		expect(block).toContain("<Separator orientation='horizontal' />");
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
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf("\tlink: {");
		const end = docs.indexOf("\ttooltip: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain("api: CATALOG_API.link");
		expect(block).not.toContain('name: "href"');
		expect(block).toContain('<LinkProvider><Link href="/ui">Library</Link></LinkProvider>');
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
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf("\ttooltip: {");
		const end = docs.indexOf('\t"theme-toggle": {');
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain("api: CATALOG_API.tooltip");
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
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf('\t"theme-toggle": {');
		const end = docs.indexOf('\t"layer-card": {');
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain('api: CATALOG_API["theme-toggle"]');
		expect(block).not.toContain('name: "aria-label"');
		expect(block).toContain(
			'<ThemeProvider><ThemeToggle aria-label="Toggle theme" /></ThemeProvider>',
		);
	});

	it("sources layer-card API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS["layer-card"]?.api).toEqual(CATALOG_API["layer-card"]);
		expect(CATALOG_API["layer-card"]?.[0]?.props.map((prop) => prop.name)).toEqual(["className"]);
		expect(CATALOG_API["layer-card"]).toEqual([
			{
				name: "LayerCard",
				props: [
					{
						name: "className",
						type: "string",
						required: false,
						description: "Additional classes for the card root.",
					},
				],
			},
		]);
		renderCatalog("/ui/layer-card");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(1);
		expect(api).toHaveTextContent("className?");
		expect(api).toHaveTextContent("string");
		expect(api).toHaveTextContent("Additional classes for the card root.");
		expect(api).toHaveTextContent("—");
		expect(api).not.toHaveTextContent("children");
		expect(api).not.toHaveTextContent("id");
		expect(api).not.toHaveTextContent("style");
		expect(api).not.toHaveTextContent("role");
		expect(api).not.toHaveTextContent("LayerCardSectionProps");
		expect(document.body.textContent).toContain(
			"<LayerCard><LayerCard.Secondary>Next Steps</LayerCard.Secondary><LayerCard.Primary>Hello</LayerCard.Primary></LayerCard>",
		);
		expect(screen.getByRole("heading", { name: "Basic Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Surface-style Card" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Multiple Cards" })).toBeInTheDocument();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(
			"- className (string, optional, default —): Additional classes for the card root.",
		);
		expect(markdown).toContain(
			"<LayerCard><LayerCard.Secondary>Next Steps</LayerCard.Secondary><LayerCard.Primary>Hello</LayerCard.Primary></LayerCard>",
		);
		expect(markdown).not.toContain("- children (");
		expect(markdown).not.toContain("- id (");
		expect(markdown).not.toContain("- style (");
		expect(markdown).not.toContain("- role (");
		expect(markdown).not.toContain("LayerCardSectionProps");
	});

	it("does not keep a handwritten layer-card prop inventory", () => {
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf('\t"layer-card": {');
		const end = docs.indexOf('\t"basalt-mark": {');
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain('api: CATALOG_API["layer-card"]');
		expect(block).not.toContain('name: "className"');
		expect(block).toContain(
			"<LayerCard><LayerCard.Secondary>Next Steps</LayerCard.Secondary><LayerCard.Primary>Hello</LayerCard.Primary></LayerCard>",
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
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf('\t"basalt-mark": {');
		const end = docs.indexOf("\tfield: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain('api: CATALOG_API["basalt-mark"]');
		expect(block).not.toContain('name: "className"');
		expect(block).toContain('description: "Basalt mark."');
		expect(block).toContain("<BasaltMark />");
		expect(block).toContain('repo: "pew"');
		expect(block).toContain('sha: "97a890fabe6e"');
		expect(block).toContain('file: "packages/web/src/components"');
		expect(block).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
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
			"className",
			"children",
		]);
		renderCatalog("/ui/field");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(6);
		expect(api).toHaveTextContent("label");
		expect(api).not.toHaveTextContent("label?");
		expect(api).toHaveTextContent("htmlFor?");
		expect(api).toHaveTextContent("hint?");
		expect(api).toHaveTextContent("error?");
		expect(api).toHaveTextContent("className?");
		expect(api).toHaveTextContent("children");
		expect(api).not.toHaveTextContent("children?");
		expect(api).toHaveTextContent("Visible label text.");
		expect(api).toHaveTextContent("Associates the label and described-by ids.");
		expect(api).toHaveTextContent("Supporting text when there is no error.");
		expect(api).toHaveTextContent("Replaces the hint and marks the control invalid.");
		expect(api).toHaveTextContent("Additional classes for the field root.");
		expect(api).toHaveTextContent("The control or content to render.");
		expect(api).toHaveTextContent("React.ReactNode");
		expect(screen.getByRole("heading", { name: "Hint" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="field-hint"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("- label (string, required, default —): Visible label text.");
		expect(markdown).toContain(
			"- htmlFor (string, optional, default —): Associates the label and described-by ids.",
		);
		expect(markdown).toContain(
			"- hint (string, optional, default —): Supporting text when there is no error.",
		);
		expect(markdown).toContain(
			"- error (string, optional, default —): Replaces the hint and marks the control invalid.",
		);
		expect(markdown).toContain(
			"- className (string, optional, default —): Additional classes for the field root.",
		);
		expect(markdown).toContain(
			"- children (React.ReactNode, required, default —): The control or content to render.",
		);
		expect(markdown).toContain(UI_EXAMPLES.field?.[0]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES.field?.[1]?.code ?? "");
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
	});

	it("does not keep a handwritten field prop inventory", () => {
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf("\tfield: {");
		const end = docs.indexOf("\tinput: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain("api: CATALOG_API.field");
		expect(block).not.toContain('name: "label"');
		expect(block).not.toContain('name: "htmlFor"');
		expect(block).toContain('description: "A labeled control with optional hint and error."');
		expect(block).toContain(
			'<Field label="Email" htmlFor="email" hint="Never shared"><Input id="email" /></Field>',
		);
		expect(block).toContain('repo: "signoff.now"');
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
				],
			},
		]);
		renderCatalog("/ui/input");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(1);
		expect(api).toHaveTextContent("type?");
		expect(api).toHaveTextContent("React.HTMLInputTypeAttribute");
		expect(api).toHaveTextContent("The type of input control to render.");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("placeholder");
		expect(api).not.toHaveTextContent("onChange");
		expect(screen.getByRole("heading", { name: "With Label and Description" })).toBeInTheDocument();
		expect(
			document.querySelector('[data-hero-scenario="input-with-label-and-description"]'),
		).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-input-types"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain(
			"- type (React.HTMLInputTypeAttribute, optional, default —): The type of input control to render.",
		);
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- placeholder (");
		expect(markdown).toContain(UI_EXAMPLES.input?.[0]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES.input?.[3]?.code ?? "");
		expect(markdown).toContain('<div className="flex w-full flex-col gap-3">');
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
	});

	it("does not keep a handwritten input prop inventory", () => {
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf("\tinput: {");
		const end = docs.indexOf('\t"input-area": {');
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain("api: CATALOG_API.input");
		expect(block).not.toContain('name: "type"');
		expect(block).not.toContain('type: "string"');
		expect(block).toContain(
			'description: "A single-line text field. Light mode uses a white L3 surface."',
		);
		expect(block).toContain('<Input aria-label="Name" placeholder="Jane Doe" />');
		expect(block).toContain('repo: "zhe"');
		expect(block).toContain('sha: "c31c239f01c9"');
		expect(block).toContain('file: "components/ui/input.tsx"');
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
				],
			},
		]);
		renderCatalog("/ui/input-area");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(1);
		expect(api).toHaveTextContent("rows?");
		expect(api).toHaveTextContent("number");
		expect(api).toHaveTextContent("The visible text row count.");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("placeholder");
		expect(api).not.toHaveTextContent("onChange");
		expect(screen.getByRole("heading", { name: "With Label" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="input-area-with-label"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-area-custom-row-count"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-area-error-state-string"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="input-area-disabled"]')).toBeTruthy();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		expect(markdown).toContain("- rows (number, optional, default —): The visible text row count.");
		expect(markdown).not.toContain("- className (");
		expect(markdown).not.toContain("- placeholder (");
		expect(markdown).toContain(UI_EXAMPLES["input-area"]?.[0]?.code ?? "");
		expect(markdown).toContain(UI_EXAMPLES["input-area"]?.[1]?.code ?? "");
		expect(markdown).toContain("rows={6}");
		expect(markdown).toContain('htmlFor="ex-notes"');
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
	});

	it("does not keep a handwritten input-area prop inventory", () => {
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf('\t"input-area": {');
		const end = docs.indexOf('\t"input-group": {');
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain('api: CATALOG_API["input-area"]');
		expect(block).not.toContain('name: "rows"');
		expect(block).not.toContain('type: "number"');
		expect(block).toContain('description: "A multi-line text field on the L3 surface."');
		expect(block).toContain('<InputArea aria-label="Notes" placeholder="Write a note" />');
		expect(block).toContain('repo: "zhe"');
		expect(block).toContain('sha: "c31c239f01c9"');
		expect(block).toContain('file: "components/ui/textarea.tsx"');
	});

	it("does not keep a handwritten input-group prop inventory", () => {
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf('\t"input-group": {');
		const end = docs.indexOf('\t"sensitive-input": {');
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain('api: CATALOG_API["input-group"]');
		expect(block).not.toContain('name: "InputGroup.Input"');
		expect(block).not.toContain('type: "input"');
		expect(block).not.toContain("The editable value.");
		expect(block).toContain(
			'description: "Compose an input with addons, an inline suffix, and status icons."',
		);
		expect(block).toContain(
			"<InputGroup><InputGroup.Input defaultValue='atlas' aria-label='Subdomain' /><InputGroup.Suffix>.example.com</InputGroup.Suffix></InputGroup>",
		);
		expect(block).toContain('repo: "basalt"');
		expect(block).toContain('sha: "2727ae6a8d3f"');
		expect(block).toContain('file: "src/pages/FormsPage.tsx"');
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
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(2);
		expect(api).toHaveTextContent("revealLabel");
		expect(api).not.toHaveTextContent("revealLabel?");
		expect(api).toHaveTextContent("hideLabel");
		expect(api).not.toHaveTextContent("hideLabel?");
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
		expect(document.querySelector('[data-hero-scenario="sensitive-input-default"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="sensitive-input-default"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="sensitive-input-disabled"]')).toBeTruthy();
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
		expect(UI_EXAMPLES["sensitive-input"]).toHaveLength(2);
		for (const scenario of UI_EXAMPLES["sensitive-input"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|API key|secret|token/i);
	});

	it("does not keep a handwritten sensitive-input prop inventory", () => {
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf('\t"sensitive-input": {');
		const end = docs.indexOf("\tcheckbox: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain('api: CATALOG_API["sensitive-input"]');
		expect(block).not.toContain('name: "revealLabel"');
		expect(block).not.toContain('name: "hideLabel"');
		expect(block).not.toContain('type: "string"');
		expect(block).toContain('description: "A password field with a reveal control."');
		expect(block).toContain(
			'<SensitiveInput aria-label="Password" revealLabel="Show" hideLabel="Hide" />',
		);
		expect(block).toContain("variants: []");
		expect(block).toContain('repo: "basalt"');
		expect(block).toContain('sha: "2727ae6a8d3f"');
		expect(block).toContain('file: "src/pages/FormsPage.tsx"');
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
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(1);
		expect(api).toHaveTextContent("checked?");
		expect(api).toHaveTextContent('"indeterminate" | boolean');
		expect(api).toHaveTextContent("The controlled checked state of the checkbox.");
		expect(api).toHaveTextContent("—");
		expect(api).not.toHaveTextContent("defaultChecked");
		expect(api).not.toHaveTextContent("onCheckedChange");
		expect(api).not.toHaveTextContent("className");
		expect(api).not.toHaveTextContent("disabled?");
		expect(screen.getByRole("heading", { name: "Default" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Checked" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Indeterminate" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Disabled" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Error" })).toBeInTheDocument();
		expect(document.querySelector('[data-hero-scenario="checkbox-default"]')).toBeTruthy();
		expect(document.querySelector('[data-scenario="checkbox-error"]')).toBeTruthy();
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
		expect(UI_EXAMPLES.checkbox).toHaveLength(5);
		for (const scenario of UI_EXAMPLES.checkbox ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
	});

	it("does not keep a handwritten checkbox prop inventory", () => {
		const docs = readFileSync(path.join(process.cwd(), "src/pages/ui/docs.ts"), "utf8");
		const start = docs.indexOf("\tcheckbox: {");
		const end = docs.indexOf("\tradio: {");
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(start);
		const block = docs.slice(start, end);
		expect(block).toContain("api: CATALOG_API.checkbox");
		expect(block).not.toContain('name: "checked"');
		expect(block).not.toContain('boolean | "indeterminate"');
		expect(block).toContain('description: "A check control with an indeterminate state."');
		expect(block).toContain('<Checkbox aria-label="Subscribe" />');
		expect(block).toContain('variants: ["checked", "unchecked", "indeterminate"]');
		expect(block).toContain('repo: "zhe"');
		expect(block).toContain('sha: "c31c239f01c9"');
		expect(block).toContain('file: "components/ui/checkbox.tsx"');
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

	it("removes parallel demo maps from production catalog sources", () => {
		for (const file of [
			"src/pages/ui/demos.tsx",
			"src/pages/ui/catalog-ready.tsx",
			"src/pages/ui/HomeGrid.tsx",
		]) {
			const source = readFileSync(path.join(process.cwd(), file), "utf8");
			expect(source, file).not.toMatch(/\bBASE_DEMOS\b/);
			expect(source, file).not.toMatch(/\bUI_DEMOS\b/);
			expect(source, file).not.toMatch(/\bEXTRA_DEMOS\b/);
		}
	});

	it("does not keep inline button scenario dual-writes", () => {
		const source = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		expect(source).toContain("BUTTON_EXAMPLES");
		expect(source).not.toMatch(/button:\s*\[/);
		expect(source).not.toMatch(/catalogScenarioId\("button"/);
		expect(source).not.toMatch(/code:\s*'<Button/);
		expect(source).not.toMatch(/code:\s*"<Button/);
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
		const hero = document.querySelector('[data-hero-scenario="field-hint"]');
		const hint = document.querySelector('[data-scenario="field-hint"]');
		const error = document.querySelector('[data-scenario="field-error"]');
		expect(hero).toBeTruthy();
		expect(hint).toBeTruthy();
		expect(error).toBeTruthy();
		if (!hero || !hint || !error) {
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
		const hero = document.querySelector('[data-hero-scenario="input-with-label-and-description"]');
		const labeled = document.querySelector('[data-scenario="input-with-label-and-description"]');
		const error = document.querySelector('[data-scenario="input-with-error-string"]');
		const disabled = document.querySelector('[data-scenario="input-disabled"]');
		const types = document.querySelector('[data-scenario="input-input-types"]');
		const bare = document.querySelector('[data-scenario="input-bare-input-no-label"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(error).toBeTruthy();
		expect(disabled).toBeTruthy();
		expect(types).toBeTruthy();
		expect(bare).toBeTruthy();
		if (!hero || !labeled || !error || !disabled || !types || !bare) {
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
		expect(UI_EXAMPLES.input).toHaveLength(5);
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
		const hero = document.querySelector('[data-hero-scenario="input-area-with-label"]');
		const labeled = document.querySelector('[data-scenario="input-area-with-label"]');
		const rows = document.querySelector('[data-scenario="input-area-custom-row-count"]');
		const error = document.querySelector('[data-scenario="input-area-error-state-string"]');
		const disabled = document.querySelector('[data-scenario="input-area-disabled"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(rows).toBeTruthy();
		expect(error).toBeTruthy();
		expect(disabled).toBeTruthy();
		if (!hero || !labeled || !rows || !error || !disabled) {
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
		expect(UI_EXAMPLES["input-area"]).toHaveLength(4);
		for (const scenario of UI_EXAMPLES["input-area"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('htmlFor="ex-notes"');
		expect(markdown).toContain('htmlFor="ex-bio"');
		expect(markdown).toContain("rows={6}");
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b/i);
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
		expect(page).not.toMatch(/input-group|InputGroup/);
		expect(page).not.toMatch(/sensitive-input|SensitiveInput/);
		expect(page).not.toMatch(/\bcheckbox\b|Checkbox/);
		expect(page).not.toMatch(/Cloudflare|Kumo|Workers?\b/);
	});

	it("does not keep inline input-area scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("INPUT_AREA_EXAMPLES");
		expect(demos).toMatch(/"input-area": INPUT_AREA_EXAMPLES/);
		expect(demos).not.toMatch(/"input-area":\s*\[/);
		expect(kumo).not.toMatch(/"input-area":\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("input-area"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("input-area"/);
		expect(demos).not.toContain('from "@nocoo/basalt/components/input-area"');
		expect(kumo).not.toContain('from "@nocoo/basalt/components/input-area"');
		expect(kumo).not.toContain('from "@nocoo/basalt/components/field"');
	});

	it("does not keep inline input-group scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("INPUT_GROUP_EXAMPLES");
		expect(demos).toMatch(/"input-group": INPUT_GROUP_EXAMPLES/);
		expect(demos).not.toMatch(/"input-group":\s*\[/);
		expect(kumo).not.toMatch(/"input-group":\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("input-group"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("input-group"/);
		expect(demos).not.toContain('from "@nocoo/basalt/components/input-group"');
		expect(kumo).not.toContain('from "@nocoo/basalt/components/input-group"');
		expect(demos).not.toContain("CircleCheck");
		expect(kumo).not.toContain("CircleCheck");
		expect(kumo).toContain('from "@nocoo/basalt/components/loader"');
		expect(kumo).toContain("Search");
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
		expect(UI_EXAMPLES["sensitive-input"]).toHaveLength(2);
		for (const scenario of UI_EXAMPLES["sensitive-input"] ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|API key|secret|token/i);
	});

	it("does not keep inline sensitive-input scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("SENSITIVE_INPUT_EXAMPLES");
		expect(demos).toMatch(/"sensitive-input": SENSITIVE_INPUT_EXAMPLES/);
		expect(demos).not.toMatch(/"sensitive-input":\s*\[/);
		expect(kumo).not.toMatch(/"sensitive-input":\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("sensitive-input"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("sensitive-input"/);
		expect(demos).not.toContain('from "@nocoo/basalt/components/sensitive-input"');
		expect(kumo).not.toContain('from "@nocoo/basalt/components/sensitive-input"');
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
		const hero = document.querySelector('[data-hero-scenario="checkbox-default"]');
		const labeled = document.querySelector('[data-scenario="checkbox-default"]');
		const checked = document.querySelector('[data-scenario="checkbox-checked"]');
		const indeterminate = document.querySelector('[data-scenario="checkbox-indeterminate"]');
		const disabled = document.querySelector('[data-scenario="checkbox-disabled"]');
		const error = document.querySelector('[data-scenario="checkbox-error"]');
		expect(hero).toBeTruthy();
		expect(labeled).toBeTruthy();
		expect(checked).toBeTruthy();
		expect(indeterminate).toBeTruthy();
		expect(disabled).toBeTruthy();
		expect(error).toBeTruthy();
		if (!hero || !labeled || !checked || !indeterminate || !disabled || !error) {
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
		expect(UI_EXAMPLES.checkbox).toHaveLength(5);
		for (const scenario of UI_EXAMPLES.checkbox ?? []) {
			expect(markdown).toContain(scenario.code);
		}
		expect(markdown).toContain('className="flex flex-wrap items-center gap-3"');
		expect(markdown).not.toMatch(/Cloudflare|Kumo|Workers?\b|@cloudflare\/kumo/i);
		expect(CATALOG_DOCS["sensitive-input"]?.api).toEqual(CATALOG_API["sensitive-input"]);
		expect(UI_EXAMPLES["sensitive-input"]).toHaveLength(2);
	});

	it("does not keep inline checkbox scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("CHECKBOX_EXAMPLES");
		expect(demos).toMatch(/\bcheckbox: CHECKBOX_EXAMPLES/);
		expect(demos).not.toMatch(/\bcheckbox:\s*\[/);
		expect(kumo).not.toMatch(/\bcheckbox:\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("checkbox"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("checkbox"/);
		expect(demos).not.toContain('from "@nocoo/basalt/components/checkbox"');
		expect(kumo).not.toContain('from "@nocoo/basalt/components/checkbox"');
		expect(kumo).not.toContain('from "@nocoo/basalt/components/field"');
		expect(kumo).toContain("function Preview");
	});

	it("does not keep inline input scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("INPUT_EXAMPLES");
		expect(demos).toMatch(/\binput: INPUT_EXAMPLES/);
		expect(demos).not.toMatch(/\binput:\s*\[/);
		expect(kumo).not.toMatch(/\binput:\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("input",/);
		expect(kumo).not.toMatch(/catalogScenarioId\("input",/);
		expect(demos).not.toContain('from "@nocoo/basalt/components/input";');
		expect(kumo).not.toContain('from "@nocoo/basalt/components/input";');
		expect(kumo).not.toContain('from "@nocoo/basalt/components/field"');
		expect(kumo).not.toMatch(/function Stack\b/);
		expect(kumo).not.toMatch(/<Stack[\s>]/);
	});

	it("does not keep inline field scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("FIELD_EXAMPLES");
		expect(demos).toMatch(/\bfield: FIELD_EXAMPLES/);
		expect(demos).not.toMatch(/\bfield:\s*\[/);
		expect(kumo).not.toMatch(/\bfield:\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("field"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("field"/);
		expect(demos).not.toContain('from "@nocoo/basalt/components/field"');
		expect(kumo).not.toContain('from "@nocoo/basalt/components/field"');
		expect(demos).not.toContain("ex-email");
		expect(kumo).not.toContain("kumo-ex-email");
	});

	it("does not keep inline basalt-mark scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const ready = readFileSync(path.join(process.cwd(), "src/pages/ui/catalog-ready.tsx"), "utf8");
		expect(demos).toContain("BASALT_MARK_EXAMPLES");
		expect(demos).toMatch(/"basalt-mark": BASALT_MARK_EXAMPLES/);
		expect(demos).not.toMatch(/"basalt-mark":\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("basalt-mark"/);
		expect(ready).not.toContain('add("basalt-mark"');
		expect(ready).not.toMatch(/import \{ BasaltMark \}/);
		expect(ready).not.toMatch(/from "@nocoo\/basalt\/components\/basalt-mark"/);
		expect(ready).not.toContain("<BasaltMark");
	});

	it("does not keep inline layer-card scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("LAYER_CARD_EXAMPLES");
		expect(demos).toMatch(/"layer-card": LAYER_CARD_EXAMPLES/);
		expect(demos).not.toMatch(/"layer-card":\s*\[/);
		expect(kumo).not.toMatch(/"layer-card":\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("layer-card"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("layer-card"/);
		expect(demos).not.toMatch(/code:\s*['"`]<LayerCard/);
		expect(kumo).not.toMatch(/code:\s*['"`]<LayerCard/);
		expect(demos).not.toMatch(/render:\s*\(\)\s*=>\s*\(?\s*<LayerCard/);
		expect(kumo).not.toMatch(/render:\s*\(\)\s*=>\s*\(?\s*<LayerCard/);
		expect(demos).not.toContain("LayerCard.Secondary");
		expect(kumo).not.toContain("LayerCard.Secondary");
	});

	it("does not keep inline theme-toggle scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		expect(demos).toContain("THEME_TOGGLE_EXAMPLES");
		expect(demos).toMatch(/"theme-toggle": THEME_TOGGLE_EXAMPLES/);
		expect(demos).not.toMatch(/"theme-toggle":\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("theme-toggle"/);
		expect(demos).not.toMatch(/code:\s*['"`]<ThemeToggle/);
		expect(demos).not.toMatch(/<ThemeToggle aria-label="Toggle theme" \/>/);
		expect(demos).toMatch(/"theme-provider":\s*\[/);
		expect(demos).toMatch(/catalogScenarioId\("theme-provider"/);
		expect(demos).toContain("ThemeProvider");
	});

	it("does not keep inline tooltip scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("TOOLTIP_EXAMPLES");
		expect(demos).toMatch(/\btooltip: TOOLTIP_EXAMPLES/);
		expect(demos).not.toMatch(/\btooltip:\s*\[/);
		expect(kumo).not.toMatch(/\btooltip:\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("tooltip"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("tooltip"/);
		expect(demos).not.toMatch(/code:\s*['"`]<Tooltip/);
		expect(kumo).not.toMatch(/code:\s*['"`]<Tooltip/);
		expect(demos).not.toMatch(/render:\s*\(\)\s*=>\s*\(?\s*<TooltipProvider/);
		expect(kumo).not.toMatch(/render:\s*\(\)\s*=>\s*\(?\s*<TooltipProvider/);
		expect(kumo).not.toContain("TooltipProvider");
		expect(demos).not.toContain("TooltipProvider");
	});

	it("does not keep inline link scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("LINK_EXAMPLES");
		expect(demos).toMatch(/\blink: LINK_EXAMPLES/);
		expect(demos).not.toMatch(/\blink:\s*\[/);
		expect(kumo).not.toMatch(/\blink:\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("link",/);
		expect(kumo).not.toMatch(/catalogScenarioId\("link",/);
		expect(kumo).not.toContain("LinkProvider");
	});

	it("does not keep inline separator scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("SEPARATOR_EXAMPLES");
		expect(demos).toMatch(/\bseparator: SEPARATOR_EXAMPLES/);
		expect(demos).not.toMatch(/\bseparator:\s*\[/);
		expect(kumo).not.toMatch(/\bseparator:\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("separator"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("separator"/);
		expect(demos).not.toMatch(/code:\s*["']<Separator \/>["']/);
		expect(kumo).not.toMatch(/code:\s*["']<Separator \/>["']/);
	});

	it("does not keep inline label scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("LABEL_EXAMPLES");
		expect(demos).toMatch(/\blabel: LABEL_EXAMPLES/);
		expect(demos).not.toMatch(/\blabel:\s*\[/);
		expect(kumo).not.toMatch(/\blabel:\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("label"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("label"/);
	});

	it("does not keep inline text scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("TEXT_EXAMPLES");
		expect(demos).toMatch(/\btext: TEXT_EXAMPLES/);
		expect(demos).not.toMatch(/\btext:\s*\[/);
		expect(kumo).not.toMatch(/\btext:\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("text"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("text"/);
	});

	it("does not keep inline link-button scenario owners", () => {
		const demos = readFileSync(path.join(process.cwd(), "src/pages/ui/demos.tsx"), "utf8");
		const kumo = readFileSync(path.join(process.cwd(), "src/pages/ui/kumo-examples.tsx"), "utf8");
		expect(demos).toContain("LINK_BUTTON_EXAMPLES");
		expect(demos).toMatch(/"link-button": LINK_BUTTON_EXAMPLES/);
		expect(demos).not.toMatch(/"link-button":\s*\[/);
		expect(kumo).not.toMatch(/"link-button":\s*\[/);
		expect(demos).not.toMatch(/catalogScenarioId\("link-button"/);
		expect(kumo).not.toMatch(/catalogScenarioId\("link-button"/);
		expect(demos).not.toMatch(/code:\s*['"`]<LinkButton/);
		expect(kumo).not.toMatch(/code:\s*['"`]<LinkButton/);
		expect(demos).not.toMatch(/render:\s*\(\)\s*=>\s*\(?\s*<LinkButton/);
		expect(kumo).not.toMatch(/render:\s*\(\)\s*=>\s*\(?\s*<LinkButton/);
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
