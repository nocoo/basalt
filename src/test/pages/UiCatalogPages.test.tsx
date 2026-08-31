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
		expect(screen.getByRole("columnheader", { name: "Default" })).toBeInTheDocument();
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
		expect(CATALOG_DOCS.button?.props).toEqual(CATALOG_API.button);
		expect(CATALOG_API.button.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"loading",
			"icon",
		]);
		renderCatalog("/ui/button");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		for (const prop of CATALOG_API.button) {
			expect(api).toHaveTextContent(prop.name);
			expect(api).toHaveTextContent(prop.type);
			expect(api).toHaveTextContent(`${prop.name}?`);
		}
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy page" }));
		});
		const markdown = String(writeText.mock.calls[0]?.[0]);
		for (const prop of CATALOG_API.button) {
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
		expect(block).toContain("props: CATALOG_API.button");
		expect(block).not.toContain('name: "variant"');
		expect(block).not.toContain('name: "asChild"');
		expect(block).not.toContain('name: "loading"');
		expect(block).not.toContain('name: "icon"');
		expect(block).not.toContain("ReactNode");
	});

	it("sources link-button API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS["link-button"]?.props).toEqual(CATALOG_API["link-button"]);
		expect(CATALOG_API["link-button"]?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"icon",
		]);
		renderCatalog("/ui/link-button");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		for (const prop of CATALOG_API["link-button"] ?? []) {
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
		for (const prop of CATALOG_API["link-button"] ?? []) {
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
		expect(block).toContain('props: CATALOG_API["link-button"]');
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
		expect(CATALOG_DOCS.text?.props).toEqual(CATALOG_API.text);
		expect(CATALOG_API.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		renderCatalog("/ui/text");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		for (const prop of CATALOG_API.text ?? []) {
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
		for (const prop of CATALOG_API.text ?? []) {
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
		expect(block).toContain("props: CATALOG_API.text");
		expect(block).not.toContain('name: "size"');
		expect(block).not.toContain('name: "tone"');
		expect(block).toContain("<Text tone='muted'>Copy</Text>");
	});

	it("sources label API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.label?.props).toEqual(CATALOG_API.label);
		expect(CATALOG_API.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(CATALOG_API.label).toHaveLength(2);
		renderCatalog("/ui/label");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(2);
		for (const prop of CATALOG_API.label ?? []) {
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
		for (const prop of CATALOG_API.label ?? []) {
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
		expect(block).toContain("props: CATALOG_API.label");
		expect(block).not.toContain('name: "htmlFor"');
		expect(block).not.toContain('name: "showOptional"');
		expect(block).not.toContain('name: "tooltip"');
		expect(block).not.toContain("ReactNode");
		expect(block).toContain('<Label htmlFor="email">Email</Label>');
	});

	it("sources separator API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.separator?.props).toEqual(CATALOG_API.separator);
		expect(CATALOG_API.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(CATALOG_API.separator).toHaveLength(2);
		renderCatalog("/ui/separator");
		const api = document.getElementById("api-reference");
		expect(api).toBeTruthy();
		expect(api?.querySelectorAll("tbody tr")).toHaveLength(2);
		for (const prop of CATALOG_API.separator ?? []) {
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
		for (const prop of CATALOG_API.separator ?? []) {
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
		expect(block).toContain("props: CATALOG_API.separator");
		expect(block).not.toContain('name: "orientation"');
		expect(block).not.toContain('name: "decorative"');
		expect(block).toContain("<Separator orientation='horizontal' />");
	});

	it("sources link API rows from generated catalog data", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		expect(CATALOG_DOCS.link?.props).toEqual(CATALOG_API.link);
		expect(CATALOG_API.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(CATALOG_API.link).toEqual([
			{
				name: "href",
				type: "string",
				required: true,
				description: "The link destination.",
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
		expect(block).toContain("props: CATALOG_API.link");
		expect(block).not.toContain('name: "href"');
		expect(block).toContain('<LinkProvider><Link href="/ui">Library</Link></LinkProvider>');
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
