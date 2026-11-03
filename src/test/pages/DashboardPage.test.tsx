import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import DashboardPage from "@/pages/DashboardPage";

describe("DashboardPage", () => {
	it.each(["en", "zh"])("keeps demo data and labels coherent in %s", async (locale) => {
		const previous = i18n.language;
		await i18n.changeLanguage(locale);
		try {
			const { container } = render(<DashboardPage />);
			expect(screen.getByText(i18n.t("dashboard.metricDailySpend"))).toBeInTheDocument();
			expect(screen.getAllByText(i18n.t("dashboard.categoryNutrition")).length).toBeGreaterThan(0);
			expect(screen.getByText("$202,000")).toBeInTheDocument();
			expect(
				screen.getByRole("group", {
					name: i18n.t("dashboard.usageCategoryAria", { total: "$202,000" }),
				}),
			).toBeInTheDocument();
			expect(screen.getByText("$12,450.80")).toBeInTheDocument();
			expect(screen.getByText("$8,200.00")).toBeInTheDocument();
			expect(screen.getByText("$23,100.50")).toBeInTheDocument();
			const demo = screen
				.getByText(i18n.t("dashboard.demoActions"))
				.closest("[data-basalt-surface]");
			expect(demo).not.toBeNull();
			for (const button of within(demo as HTMLElement).getAllByRole("button")) {
				expect(button).toBeDisabled();
			}
			expect(container.querySelectorAll('[data-slot="stat-card"]')).toHaveLength(7);
		} finally {
			await i18n.changeLanguage(previous);
		}
	});
});
