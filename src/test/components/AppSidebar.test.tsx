import { TooltipProvider } from "@nocoo/basalt/components/tooltip";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { AppSidebar } from "@/components/AppSidebar";
import { CATALOG, catalogNavName } from "@/pages/ui/catalog";

function renderSidebar() {
	return render(
		<ThemeProvider>
			<TooltipProvider>
				<MemoryRouter initialEntries={["/ui/button"]}>
					<AppSidebar collapsed={false} onToggle={() => undefined} />
				</MemoryRouter>
			</TooltipProvider>
		</ThemeProvider>,
	);
}

describe("AppSidebar", () => {
	it("keeps example pages and lists every library export", () => {
		renderSidebar();
		expect(screen.getByText("Examples")).toBeInTheDocument();
		expect(screen.getByText("Library")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
		for (const entry of CATALOG) {
			expect(screen.getAllByRole("button", { name: catalogNavName(entry) }).length).toBeGreaterThan(
				0,
			);
		}
		expect(screen.getByRole("button", { name: "Clipboard Text" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Page Header" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Maps" })).toBeInTheDocument();
		const components = screen.getByRole("button", { name: "Components", expanded: true });
		expect(components).toHaveAttribute("aria-expanded", "true");
		fireEvent.click(components);
		expect(components).toHaveAttribute("aria-expanded", "false");
		expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: "Charts" }).length).toBeGreaterThan(1);
		expect(screen.getAllByRole("button", { name: "Blocks" }).length).toBeGreaterThan(1);
	});
});
