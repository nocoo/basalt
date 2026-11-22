import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardPage from "@/pages/DashboardPage";

describe("DashboardPage", () => {
	it("keeps demo data and labels coherent", () => {
		const { container } = render(<DashboardPage />);
		expect(screen.getByText("Avg. daily care spend")).toBeInTheDocument();
		expect(screen.getAllByText("Nutrition").length).toBeGreaterThan(0);
		expect(screen.getByText("$202,000")).toBeInTheDocument();
		expect(
			screen.getByRole("group", {
				name: "Monthly care spending from January to December, totaling $202,000",
			}),
		).toBeInTheDocument();
		expect(screen.getByText("$12,450.80")).toBeInTheDocument();
		expect(screen.getByText("$8,200.00")).toBeInTheDocument();
		expect(screen.getByText("$23,100.50")).toBeInTheDocument();
		const demo = screen.getByText("Demo actions are unavailable").closest("[data-basalt-surface]");
		expect(demo).not.toBeNull();
		for (const button of within(demo as HTMLElement).getAllByRole("button")) {
			expect(button).toBeDisabled();
		}
		expect(container.querySelectorAll('[data-slot="stat-card"]')).toHaveLength(7);
	});
});
