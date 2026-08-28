import { TooltipProvider } from "@nocoo/basalt/components/tooltip";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { AppSidebar } from "@/components/AppSidebar";
import { CATALOG } from "@/pages/ui/catalog";

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
			expect(screen.getByRole("button", { name: entry.name })).toBeInTheDocument();
		}
		const atoms = screen.getByRole("button", { name: "Atoms" });
		expect(atoms).toHaveAttribute("aria-expanded", "true");
		fireEvent.click(atoms);
		expect(atoms).toHaveAttribute("aria-expanded", "false");
		expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
	});
});
