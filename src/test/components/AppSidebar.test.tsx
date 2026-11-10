import { TooltipProvider } from "@nocoo/basalt/components/tooltip";
import { LinkProvider } from "@nocoo/basalt/providers/link";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Link as RouterLink, useLocation } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "@/components/AppSidebar";
import { CATALOG, catalogNavName } from "@/pages/ui/catalog";
import { CATALOG_CATEGORIES, catalogCategoryPath } from "@/pages/ui/catalog-categories";

function catalogRows() {
	return Array.from(document.querySelectorAll<HTMLElement>("aside [data-catalog-slug]"));
}

function navRows(name: string | RegExp) {
	return [...screen.queryAllByRole("link", { name }), ...screen.queryAllByRole("button", { name })];
}

const PLANNED_SLUGS = ["maps"];

function RouterProbe() {
	const { pathname } = useLocation();
	return <span hidden data-testid="router-location" data-pathname={pathname} />;
}

function TestLink({
	href,
	className,
	children,
	...props
}: { href: string; className?: string; children?: ReactNode } & Record<string, unknown>) {
	return (
		<RouterLink to={href} className={className} {...props}>
			{children}
		</RouterLink>
	);
}

function renderSidebar(path = "/ui/button", collapsed = false, resizable = true) {
	return render(
		<ThemeProvider>
			<TooltipProvider>
				<MemoryRouter initialEntries={[path]}>
					<LinkProvider render={TestLink}>
						<RouterProbe />
						<AppSidebar collapsed={collapsed} onToggle={() => undefined} resizable={resizable} />
					</LinkProvider>
				</MemoryRouter>
			</TooltipProvider>
		</ThemeProvider>,
	);
}

describe("AppSidebar", () => {
	beforeAll(() => {
		Element.prototype.scrollIntoView = vi.fn();
	});

	it("keeps example pages and lists every library export", { timeout: 45_000 }, () => {
		renderSidebar();
		expect(screen.getByText("Examples")).toBeInTheDocument();
		expect(screen.getByText("Library")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Component library" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Layout" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Color Palette" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
		expect(screen.queryByText("System")).not.toBeInTheDocument();
		expect(screen.queryByText("Controls")).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
		const following = Node.DOCUMENT_POSITION_FOLLOWING;
		const links = [
			"Component library",
			"Color Palette",
			"Layout",
			"Loading",
			"Animation",
			"Tables",
			"Interactive",
			"Data",
			"Forms",
			"Navigation",
			"Dialogs",
			"Chat",
		] as const;
		for (let index = 0; index < links.length - 1; index += 1) {
			const currentRows = screen.getAllByRole("link", { name: links[index] });
			const nextRows = screen.getAllByRole("link", { name: links[index + 1] });
			const current = currentRows[currentRows.length - 1];
			const next = nextRows[nextRows.length - 1];
			expect(current && next && current.compareDocumentPosition(next) & following).toBeTruthy();
		}
		expect(
			screen
				.getByRole("link", { name: /Interactions/ })
				.compareDocumentPosition(screen.getByRole("link", { name: "Settings" })) & following,
		).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Settings" })
				.compareDocumentPosition(screen.getByRole("link", { name: "Wearable Health" })) & following,
		).toBeTruthy();
		for (const entry of CATALOG) {
			expect(navRows(new RegExp(`^${catalogNavName(entry)}`))).not.toHaveLength(0);
		}
		expect(screen.queryByRole("button", { name: /^Installation$/ })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /^Changelog$/ })).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: /^Clipboard Text/ })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Page Header" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Section Rule" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^Maps.*Planned$/ })).toBeDisabled();
		const components = screen.getByRole("button", { name: "Actions", expanded: true });
		expect(components).toHaveAttribute("aria-expanded", "true");
		fireEvent.click(components);
		expect(components).toHaveAttribute("aria-expanded", "false");
		expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
		expect(navRows("Charts").length).toBeGreaterThan(1);
		expect(navRows("Blocks").length).toBeGreaterThan(1);
	});

	it("disables exactly the planned sidebar entries without changing ready navigation", () => {
		const { unmount } = renderSidebar("/ui/maps");
		const directMaps = screen.getByRole("button", { name: /^Maps.*Planned$/ });
		expect(directMaps).not.toHaveClass("bg-basalt-accent");
		unmount();

		renderSidebar();
		const rows = catalogRows();
		const disabledButtons = rows.filter(
			(row): row is HTMLButtonElement => row instanceof HTMLButtonElement && row.disabled,
		);

		expect(rows).toHaveLength(121);
		expect(rows.length - disabledButtons.length).toBe(120);
		expect(disabledButtons.map((button) => button.dataset.catalogSlug)).toEqual(PLANNED_SLUGS);
		for (const button of disabledButtons) {
			expect(button).toHaveTextContent("Planned");
			expect(button.querySelector('[data-page-status="planned"]')).toBeInTheDocument();
		}

		const maps = screen.getByRole("button", { name: /^Maps.*Planned$/ });
		expect(maps).toBeDisabled();
		fireEvent.click(maps);
		fireEvent.keyDown(maps, { key: "Enter" });
		fireEvent.keyUp(maps, { key: "Enter" });
		fireEvent.keyDown(maps, { key: " " });
		fireEvent.keyUp(maps, { key: " " });
		expect(screen.getByTestId("router-location")).toHaveAttribute("data-pathname", "/ui/button");

		fireEvent.click(screen.getByRole("link", { name: /^Clipboard Text/ }));
		expect(screen.getByTestId("router-location")).toHaveAttribute(
			"data-pathname",
			"/ui/clipboard-text",
		);
	});

	it("starts every library group with an accessible overview and navigates to it", () => {
		renderSidebar();
		for (const category of CATALOG_CATEGORIES) {
			const overview = screen.getByRole("link", { name: `${category.label} overview` });
			expect(overview.textContent).toBe("Overview");
			expect(overview.parentElement?.firstElementChild).toBe(overview);
			fireEvent.click(overview);
			expect(screen.getByTestId("router-location")).toHaveAttribute(
				"data-pathname",
				catalogCategoryPath(category.id),
			);
			expect(overview).toHaveAttribute("aria-current", "page");
		}
		expect(
			screen.queryByRole("button", { name: "Components", expanded: true }),
		).not.toBeInTheDocument();
	});

	it("finds category overviews through search even with the sidebar collapsed", async () => {
		renderSidebar("/ui/button", true);
		fireEvent.keyDown(document, { key: "k", ctrlKey: true });
		const search = screen.getByPlaceholderText("Search pages...");
		fireEvent.change(search, { target: { value: "actions overview" } });
		fireEvent.click(await screen.findByRole("option", { name: "Actions overview" }));
		expect(screen.getByTestId("router-location")).toHaveAttribute(
			"data-pathname",
			"/ui/overview/action",
		);
	});

	it("applies the same planned gate in the command palette", async () => {
		renderSidebar();
		fireEvent.keyDown(document, { key: "k", ctrlKey: true });
		const dialog = screen.getByRole("dialog");
		const catalogOptions = Array.from(
			dialog.querySelectorAll<HTMLElement>("[cmdk-item][data-catalog-slug]"),
		);
		const disabledOptions = catalogOptions.filter(
			(option) => option.getAttribute("data-disabled") === "true",
		);

		expect(catalogOptions).toHaveLength(121);
		expect(
			catalogOptions.filter((option) => option.getAttribute("data-disabled") !== "true"),
		).toHaveLength(120);
		expect(disabledOptions.map((option) => option.dataset.catalogSlug)).toEqual(PLANNED_SLUGS);
		for (const option of disabledOptions) {
			expect(option).toHaveTextContent("Planned");
			expect(option.querySelector('[data-page-status="planned"]')).toBeInTheDocument();
		}

		const search = within(dialog).getByPlaceholderText("Search pages...");
		fireEvent.change(search, { target: { value: "Maps" } });
		const maps = await within(dialog).findByRole("option", { name: /^Maps.*Planned$/ });
		expect(
			within(dialog).queryByRole("option", { name: "Flow Comparison" }),
		).not.toBeInTheDocument();
		fireEvent.click(maps);
		fireEvent.keyDown(search, { key: "Enter" });
		expect(screen.getByTestId("router-location")).toHaveAttribute("data-pathname", "/ui/button");
		expect(screen.getByRole("dialog")).toBeInTheDocument();

		fireEvent.keyDown(document, { key: "k", ctrlKey: true });
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
		fireEvent.keyDown(document, { key: "k", ctrlKey: true });
		const reopenedDialog = screen.getByRole("dialog");
		const reopenedSearch = within(reopenedDialog).getByPlaceholderText("Search pages...");
		expect(reopenedSearch).toHaveValue("");

		fireEvent.change(reopenedSearch, { target: { value: "Colors" } });
		expect(reopenedDialog.querySelector('[data-catalog-slug="colors"]')).toBeNull();
		const readyColors = reopenedDialog.querySelector<HTMLElement>(
			'[data-catalog-slug="chart-colors"]',
		);
		expect(readyColors).toHaveAttribute("data-disabled", "false");
		expect(readyColors).toHaveAttribute("data-selected", "true");
		fireEvent.keyDown(reopenedSearch, { key: "Enter" });
		await waitFor(() => {
			expect(screen.getByTestId("router-location")).toHaveAttribute(
				"data-pathname",
				"/ui/chart-colors",
			);
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});

	it("does not show pending maturity badges in the components sidebar", () => {
		renderSidebar();
		const rows = catalogRows();
		expect(rows).toHaveLength(121);
		expect(document.querySelectorAll('[data-maturity-status="pending"]')).toHaveLength(0);
		expect(document.querySelector("aside")?.textContent).not.toContain("待规范");
		for (const row of rows) {
			expect(row).not.toHaveTextContent("待规范");
			expect(row.querySelectorAll('[data-maturity-status="pending"]')).toHaveLength(0);
		}
	});

	it("keeps the collapsed mark in the fixed expanded rail slot", () => {
		const { unmount } = renderSidebar();
		const expandedHome = screen.getByRole("link", { name: "Home" });
		expect(expandedHome).toHaveAttribute("href", "/");
		const expanded = expandedHome.querySelector("img");
		expect(expanded).toHaveClass("size-basalt-5");
		expect(expanded?.closest("[data-slot=sidebar-brand-logo]")).toHaveClass(
			"w-basalt-sidebar-brand-slot",
		);
		unmount();
		renderSidebar("/ui/button", true);
		const collapsedHome = screen.getByRole("link", { name: "Home" });
		expect(collapsedHome).toHaveAttribute("href", "/");
		const collapsed = collapsedHome.querySelector("img");
		expect(collapsed).toHaveClass("size-basalt-5");
		expect(collapsed?.closest("[data-slot=sidebar-header]")).toHaveClass("px-basalt-layout-lg");
		expect(collapsed?.closest("[data-slot=sidebar-brand-logo]")).toHaveClass(
			"w-basalt-sidebar-brand-slot",
		);
	});

	it("aligns collapsed search with the icon rail", () => {
		renderSidebar("/ui/button", true);
		const search = screen.getByRole("button", { name: "Search (⌘K)" });
		const nav = document.querySelector("aside nav");
		const icons = Array.from(nav?.querySelectorAll(":scope > [data-sidebar-row]") ?? []);
		expect(nav).toHaveClass(
			"basalt-hover-list",
			"basalt-nav-list",
			"basalt-sidebar-nav",
			"gap-basalt-nav-gap",
		);
		expect(icons[0]).toBe(search);
		expect(icons.length).toBeGreaterThan(1);
		for (const icon of icons) {
			expect(icon).toHaveClass(
				"min-h-[calc(var(--basalt-line-row)+2*var(--basalt-space-lg))]",
				"w-basalt-control",
				"justify-center",
			);
			expect(icon).not.toHaveClass("min-h-basalt-control");
		}
	});

	it("keeps resizing by default and allows fixed compositions to disable it", () => {
		const { unmount } = renderSidebar();
		expect(screen.getByRole("separator", { name: "Resize sidebar" })).toBeInTheDocument();
		unmount();
		renderSidebar("/ui/button", false, false);
		expect(screen.queryByRole("separator", { name: "Resize sidebar" })).not.toBeInTheDocument();
	});

	it("does not nest a second full-viewport column inside the rail", () => {
		const { unmount } = renderSidebar();
		const expanded = document.querySelector("aside");
		expect(expanded).toBeTruthy();
		expect(expanded?.querySelector(".h-screen")).toBeNull();
		unmount();
		renderSidebar("/ui/button", true);
		const collapsed = document.querySelector("aside");
		expect(collapsed?.querySelector(".h-screen")).toBeNull();
	});
});
