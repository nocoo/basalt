import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import LoadingPage from "@/pages/LoadingPage";

describe("LoadingPage", () => {
	it("renders a single status landmark, progress meter, and home navigation inside a surface root", () => {
		const { container } = render(
			<ThemeProvider persist={false} applyToDocument={false}>
				<MemoryRouter>
					<LoadingPage />
				</MemoryRouter>
			</ThemeProvider>,
		);

		expect(container.querySelector("[data-basalt-surface-root]")).toBeInTheDocument();
		expect(screen.getAllByRole("status")).toHaveLength(1);
		expect(screen.getByRole("status", { name: "Preparing workspace" })).toBeInTheDocument();
		expect(screen.getByRole("meter", { name: "Session readiness" })).toHaveAttribute(
			"aria-valuenow",
			"68",
		);
		expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", "/");
	});
});
