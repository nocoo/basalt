import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BankingDashboardPage from "@/pages/BankingDashboardPage";
import NetworkOpsDashboardPage from "@/pages/NetworkOpsDashboardPage";

const IMPROVEMENT_CLASS = "text-basalt-tag-success-foreground";

describe("dashboard trend semantics", () => {
	it("marks a lower portfolio risk as an improvement", () => {
		render(<BankingDashboardPage />);
		const trend = screen.getByText("-3.2%");
		expect(trend).toHaveClass(IMPROVEMENT_CLASS);
		expect(trend).not.toHaveClass("text-basalt-destructive");
	});

	it("marks lower latency and lower packet loss as improvements", () => {
		render(<NetworkOpsDashboardPage />);
		for (const value of ["-4.2%", "-0.04%"]) {
			const trend = screen.getByText(value);
			expect(trend).toHaveClass(IMPROVEMENT_CLASS);
			expect(trend).not.toHaveClass("text-basalt-destructive");
		}
	});
});
