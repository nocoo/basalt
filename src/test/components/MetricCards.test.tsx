import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SecondaryMetricCard } from "@/components/dashboard/SecondaryMetricCard";
import { SummaryMetricCard } from "@/components/dashboard/SummaryMetricCard";
import { TrendLineCard } from "@/components/dashboard/TrendLineCard";

describe("dashboard metric compositions", () => {
	it("uses one shared surface and compact plot", () => {
		const { container } = render(
			<>
				<SummaryMetricCard />
				<SecondaryMetricCard />
				<TrendLineCard />
			</>,
		);
		const cards = container.querySelectorAll('[data-slot="stat-card"]');
		expect(cards).toHaveLength(3);
		for (const card of cards) {
			expect(card).toHaveAttribute("data-basalt-surface", "");
			expect(card).toHaveAttribute("role", "group");
			expect(card.querySelector('[data-slot="card-header"]')).toBeNull();
			expect(card.querySelector(".basalt-chart")).toHaveClass("h-basalt-16", "w-full");
			expect(card.querySelector(".basalt-chart")).not.toHaveClass("flex-1");
			expect(card.querySelector('[data-slot="stat-card-trend"]')).toBeTruthy();
		}
		expect(screen.getByText("$8,800")).toBeInTheDocument();
		expect(screen.getByText("$4,500")).toBeInTheDocument();
		expect(screen.getByText("$4,300")).toBeInTheDocument();
		expect(screen.getByText("period not specified")).toBeInTheDocument();
		expect(screen.getByText("Today, every 2 hours · $8k–$9k care-fund scale")).toBeInTheDocument();
		expect(screen.getByText("Jan–Dec · monthly reimbursements")).toBeInTheDocument();
		expect(
			screen.getByRole("group", { name: "Available care funds $8,800 +3.1% vs last month" }),
		).toBeInTheDocument();
	});
});
