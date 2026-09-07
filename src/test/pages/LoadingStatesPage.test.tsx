import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import LoadingStatesPage from "@/pages/LoadingStatesPage";

function renderPage() {
	return render(
		<MemoryRouter>
			<LoadingStatesPage />
		</MemoryRouter>,
	);
}

describe("LoadingStatesPage", () => {
	it("renders bones, spinners and composed layouts", () => {
		renderPage();
		expect(screen.getByRole("heading", { name: "Loading" })).toBeInTheDocument();
		expect(screen.getByRole("status", { name: "Loading card" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Saving" })).toHaveAttribute("aria-busy", "true");
		expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
		expect(document.querySelectorAll(".animate-basalt-shimmer").length).toBeGreaterThan(0);
		expect(screen.getByRole("link", { name: "Open loading screen" })).toHaveAttribute(
			"href",
			"/loading",
		);
	});

	it("replays the same compositions after data arrives", () => {
		renderPage();
		const dashboard = document.querySelector('[data-loading-composition="dashboard"]');
		expect(dashboard).toHaveAttribute("aria-busy", "true");
		fireEvent.click(screen.getByRole("button", { name: "Show loaded" }));
		expect(dashboard).toHaveAttribute("aria-busy", "false");
		expect(screen.getByText("Request volume is up 18.6% from last week.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Replay loading" })).toBeInTheDocument();
		expect(screen.getByRole("table")).not.toHaveAttribute("aria-busy", "true");
	});

	it("does not paint inner wells with bg-card", () => {
		const { container } = renderPage();
		expect(container.innerHTML).not.toContain("bg-card");
	});
});
