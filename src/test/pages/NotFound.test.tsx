import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import NotFound from "@/pages/NotFound";

describe("NotFound", () => {
	it("renders the minimal 404 island with heading and homepage link", () => {
		const { container } = render(
			<MemoryRouter initialEntries={["/missing-route"]}>
				<NotFound />
			</MemoryRouter>,
		);

		expect(container.querySelector("[data-basalt-surface-root]")).toBeInTheDocument();
		expect(container.querySelector("[data-basalt-surface]")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Back to Homepage" })).toHaveAttribute("href", "/");
	});
});
