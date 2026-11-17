import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import StaticPage from "@/pages/StaticPage";

describe("StaticPage", () => {
	it("renders the editorial legal document layout with all five clauses and navigation", () => {
		const { container } = render(
			<ThemeProvider persist={false} applyToDocument={false}>
				<MemoryRouter>
					<StaticPage />
				</MemoryRouter>
			</ThemeProvider>,
		);

		expect(container.querySelector("[data-basalt-surface-root]")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", "/");
		expect(screen.getByRole("heading", { level: 1, name: "Terms of Service" })).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "Clauses" })).toBeInTheDocument();
		for (let i = 1; i <= 5; i++) {
			expect(container.querySelector(`#clause-${i}`)).toBeInTheDocument();
		}
		expect(screen.getByRole("link", { name: "Back to Homepage" })).toHaveAttribute("href", "/");
	});
});
