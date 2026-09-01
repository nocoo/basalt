import { TooltipProvider } from "@nocoo/basalt/components/tooltip";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "@/components/AppSidebar";
import { CATALOG, catalogNavName } from "@/pages/ui/catalog";

const PLANNED_SLUGS = [
	"installation",
	"contributing",
	"colors",
	"accessibility",
	"figma",
	"cli",
	"skill",
	"registry",
	"changelog",
	"maps",
	"resource-list",
	"delete-resource",
];

function RouterProbe() {
	const { pathname } = useLocation();
	return <span hidden data-testid="router-location" data-pathname={pathname} />;
}

function renderSidebar(path = "/ui/button") {
	return render(
		<ThemeProvider>
			<TooltipProvider>
				<MemoryRouter initialEntries={[path]}>
					<RouterProbe />
					<AppSidebar collapsed={false} onToggle={() => undefined} />
				</MemoryRouter>
			</TooltipProvider>
		</ThemeProvider>,
	);
}

describe("AppSidebar", () => {
	beforeAll(() => {
		Element.prototype.scrollIntoView = vi.fn();
	});

	it("keeps example pages and lists every library export", { timeout: 15_000 }, () => {
		renderSidebar();
		expect(screen.getByText("Examples")).toBeInTheDocument();
		expect(screen.getByText("Library")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
		for (const entry of CATALOG) {
			expect(
				screen.getAllByRole("button", { name: new RegExp(`^${catalogNavName(entry)}`) }).length,
			).toBeGreaterThan(0);
		}
		expect(screen.getByRole("button", { name: /^Installation.*Planned$/ })).toBeDisabled();
		expect(screen.getByRole("button", { name: /^Changelog.*Planned$/ })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Clipboard Text" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Page Header" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^Maps.*Planned$/ })).toBeDisabled();
		const components = screen.getByRole("button", { name: "Components", expanded: true });
		expect(components).toHaveAttribute("aria-expanded", "true");
		fireEvent.click(components);
		expect(components).toHaveAttribute("aria-expanded", "false");
		expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: "Charts" }).length).toBeGreaterThan(1);
		expect(screen.getAllByRole("button", { name: "Blocks" }).length).toBeGreaterThan(1);
	});

	it("disables exactly the planned sidebar entries without changing ready navigation", () => {
		const { unmount } = renderSidebar("/ui/maps");
		const directMaps = screen.getByRole("button", { name: /^Maps.*Planned$/ });
		expect(directMaps).not.toHaveClass("bg-basalt-accent");
		unmount();

		renderSidebar();
		const catalogButtons = Array.from(
			document.querySelectorAll<HTMLButtonElement>("aside button[data-catalog-slug]"),
		);
		const disabledButtons = catalogButtons.filter((button) => button.disabled);

		expect(catalogButtons).toHaveLength(101);
		expect(catalogButtons.filter((button) => !button.disabled)).toHaveLength(89);
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

		fireEvent.click(screen.getByRole("button", { name: "Clipboard Text" }));
		expect(screen.getByTestId("router-location")).toHaveAttribute(
			"data-pathname",
			"/ui/clipboard-text",
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

		expect(catalogOptions).toHaveLength(101);
		expect(
			catalogOptions.filter((option) => option.getAttribute("data-disabled") !== "true"),
		).toHaveLength(89);
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
		const plannedColors = reopenedDialog.querySelector<HTMLElement>('[data-catalog-slug="colors"]');
		const readyColors = reopenedDialog.querySelector<HTMLElement>(
			'[data-catalog-slug="chart-colors"]',
		);
		expect(plannedColors).toHaveAttribute("data-disabled", "true");
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
});
