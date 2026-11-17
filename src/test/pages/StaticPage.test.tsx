import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import StaticPage from "@/pages/StaticPage";

describe("StaticPage", () => {
	it("renders the single-column legal sheet with back link and all five sections", () => {
		const { container } = render(
			<MemoryRouter>
				<StaticPage />
			</MemoryRouter>,
		);

		expect(container.querySelector("[data-basalt-surface-root]")).toBeInTheDocument();
		expect(container.querySelector("[data-basalt-surface]")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", "/");
		expect(screen.getByRole("heading", { level: 1, name: "Terms of Service" })).toBeInTheDocument();
		expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(5);
	});
});
