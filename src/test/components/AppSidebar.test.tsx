import { TooltipProvider } from "@nocoo/basalt/components/tooltip";
import { LinkProvider } from "@nocoo/basalt/providers/link";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Link as RouterLink, useLocation } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "@/components/AppSidebar";
import { CATALOG, catalogNavName } from "@/pages/ui/catalog";

function catalogRows() {
	return Array.from(document.querySelectorAll<HTMLElement>("aside [data-catalog-slug]"));
}

function navRows(name: string | RegExp) {
	return [...screen.queryAllByRole("link", { name }), ...screen.queryAllByRole("button", { name })];
}

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
		expect(screen.getByRole("link", { name: "Typeface" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
		expect(screen.queryByText("System")).not.toBeInTheDocument();
		expect(screen.queryByText("Controls")).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
		const following = Node.DOCUMENT_POSITION_FOLLOWING;
		const links = [
			"Component library",
			"Color Palette",
			"Typeface",
			"Layout",
			"Loading",
			"Animation",
			"Tables",
			"Interactive",
			"Data",
			"Forms",
			"Navigation",
			"Dialogs",
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
		const components = screen.getByRole("button", { name: "Actions", expanded: true });
		expect(components).toHaveAttribute("aria-expanded", "true");
		fireEvent.click(components);
		expect(components).toHaveAttribute("aria-expanded", "false");
		expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
		expect(navRows("Layouts")).not.toHaveLength(0);
		expect(navRows("Blocks").length).toBeGreaterThan(1);
	});

	it("keeps every retained sidebar entry ready", () => {
		renderSidebar();
		const rows = catalogRows();
		const disabledButtons = rows.filter(
			(row): row is HTMLButtonElement => row instanceof HTMLButtonElement && row.disabled,
		);
		expect(rows).toHaveLength(82);
		expect(disabledButtons).toEqual([]);
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

	it("finds the templates gallery and individual standalone templates", async () => {
		renderSidebar();
		expect(screen.getByRole("link", { name: "Templates" })).toHaveAttribute("href", "/templates");
		fireEvent.keyDown(document, { key: "k", ctrlKey: true });
		const search = screen.getByPlaceholderText("Search pages...");
		fireEvent.change(search, { target: { value: "agent workspace" } });
		fireEvent.click(await screen.findByRole("option", { name: "Agent workspace" }));
		expect(screen.getByTestId("router-location")).toHaveAttribute(
			"data-pathname",
			"/view/agent-workspace",
		);
	});

	it("applies the ready gate in the command palette", async () => {
		renderSidebar();
		fireEvent.keyDown(document, { key: "k", ctrlKey: true });
		const dialog = screen.getByRole("dialog");
		const catalogOptions = Array.from(
			dialog.querySelectorAll<HTMLElement>("[cmdk-item][data-catalog-slug]"),
		);
		const disabledOptions = catalogOptions.filter(
			(option) => option.getAttribute("data-disabled") === "true",
		);

		expect(catalogOptions).toHaveLength(82);
		expect(
			catalogOptions.filter((option) => option.getAttribute("data-disabled") !== "true"),
		).toHaveLength(82);
		expect(disabledOptions).toEqual([]);

		const search = within(dialog).getByPlaceholderText("Search pages...");
		fireEvent.change(search, { target: { value: "Chart" } });
		const chart = dialog.querySelector<HTMLElement>('[data-catalog-slug="chart"]');
		expect(chart).toHaveAttribute("data-disabled", "false");
		expect(chart).toHaveAttribute("data-selected", "true");
		fireEvent.keyDown(search, { key: "Enter" });
		await waitFor(() => {
			expect(screen.getByTestId("router-location")).toHaveAttribute("data-pathname", "/ui/chart");
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});

	it("does not show pending maturity badges in the components sidebar", () => {
		renderSidebar();
		const rows = catalogRows();
		expect(rows).toHaveLength(82);
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
		expect(expanded).not.toHaveClass("size-basalt-5");
		expect(expanded?.closest("[data-slot=sidebar-brand-logo]")).toHaveClass(
			"basalt-sidebar-brand-logo",
			"[&>a>img]:size-full",
		);
		unmount();
		renderSidebar("/ui/button", true);
		const collapsedHome = screen.getByRole("link", { name: "Home" });
		expect(collapsedHome).toHaveAttribute("href", "/");
		const collapsed = collapsedHome.querySelector("img");
		expect(collapsed).not.toHaveClass("size-basalt-5");
		expect(collapsed?.closest("[data-slot=sidebar-header]")).toHaveClass("px-basalt-layout-lg");
		expect(collapsed?.closest("[data-slot=sidebar-brand-logo]")).toHaveClass(
			"basalt-sidebar-brand-logo",
			"[&>a>img]:size-full",
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
				"min-h-basalt-control",
				"py-basalt-row-y",
				"leading-basalt-row",
				"w-basalt-control",
				"justify-center",
			);
			expect(icon).not.toHaveClass("py-basalt-space-lg");
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
