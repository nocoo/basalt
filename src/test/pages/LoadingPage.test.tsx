import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import LoadingPage from "@/pages/LoadingPage";

describe("LoadingPage", () => {
	it("renders a single status landmark inside a surface-rooted island", () => {
		const { container } = render(
			<MemoryRouter>
				<LoadingPage />
			</MemoryRouter>,
		);

		expect(container.querySelector("[data-basalt-surface-root]")).toBeInTheDocument();
		expect(container.querySelector("[data-basalt-surface]")).toBeInTheDocument();
		expect(screen.getAllByRole("status")).toHaveLength(1);
		expect(screen.getByRole("status", { name: "Preparing workspace" })).toBeInTheDocument();
	});
});
