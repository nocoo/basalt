import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SecondaryMetricCard } from "@/components/dashboard/SecondaryMetricCard";
import { SparklineCard } from "@/components/dashboard/SparklineCard";
import { SummaryMetricCard } from "@/components/dashboard/SummaryMetricCard";
import { TrendLineCard } from "@/components/dashboard/TrendLineCard";
import i18n from "@/i18n";

describe("dashboard metric compositions", () => {
	it.each(["en", "zh"])("uses one shared surface and compact plot in %s", async (locale) => {
		const previous = i18n.language;
		await i18n.changeLanguage(locale);
		try {
			const { container } = render(
				<>
					<SummaryMetricCard />
					<SecondaryMetricCard />
					<TrendLineCard />
					<SparklineCard />
				</>,
			);
			const cards = container.querySelectorAll('[data-slot="stat-card"]');
			expect(cards).toHaveLength(4);
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
			expect(screen.getByText("$3,420")).toBeInTheDocument();
			expect(screen.getByText(i18n.t("dashboard.balancePeriod"))).toBeInTheDocument();
			expect(screen.getByText(i18n.t("dashboard.incomePeriod"))).toBeInTheDocument();
			expect(
				screen.getByRole("group", { name: i18n.t("dashboard.totalBalanceAria") }),
			).toBeInTheDocument();
		} finally {
			await i18n.changeLanguage(previous);
		}
	});
});
