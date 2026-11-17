import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import NotFound from "@/pages/NotFound";

describe("NotFound", () => {
	it("renders the 404 diagnostic card with path readout and navigation actions", () => {
		const { container } = render(
			<ThemeProvider persist={false} applyToDocument={false}>
				<MemoryRouter initialEntries={["/missing-route"]}>
					<NotFound />
				</MemoryRouter>
			</ThemeProvider>,
		);

		expect(container.querySelector("[data-basalt-surface-root]")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();
		expect(screen.getByText("/missing-route")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Back to Homepage" })).toHaveAttribute("href", "/");
		expect(screen.getByRole("link", { name: "Open Dashboard" })).toHaveAttribute(
			"href",
			"/dashboard",
		);
	});
});
