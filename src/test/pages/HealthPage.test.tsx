import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HealthPage from "@/pages/HealthPage";
import WearableDashboardPage from "@/pages/WearableDashboardPage";

describe("HealthPage", () => {
	it("marks unavailable insights as a demo while keeping the prompt editable", () => {
		render(<HealthPage />);

		expect(screen.getByRole("textbox", { name: "Prompt studio" })).toBeEnabled();
		expect(screen.getByText("Demo only. Insight generation is unavailable.")).toBeInTheDocument();
		for (const name of [
			"Summarize week",
			"Improve sleep",
			"Boost focus",
			"Plan recovery",
			"Generate insight",
		]) {
			expect(screen.getByRole("button", { name })).toBeDisabled();
		}
	});

	it.each([
		["health", HealthPage, "Daily timeline", "Activities"],
		["wearable", WearableDashboardPage, "Daily timeline", "Workouts"],
	] as const)(
		"shows a truthful sample day, accessible charts and full-year data for %s",
		(_name, Page, timeline, metric) => {
			render(<Page />);
			expect(screen.getByText("Sample day")).toBeInTheDocument();
			expect(screen.queryByRole("button", { name: "Previous day" })).not.toBeInTheDocument();
			expect(
				screen.getByRole("img", { name: "Illustrative sleep stages, not actual measurements" }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("img", { name: "Illustrative heart rate zones, not actual measurements" }),
			).toBeInTheDocument();
			expect(
				within(screen.getByRole("list", { name: timeline })).getAllByRole("listitem"),
			).toHaveLength(5);
			expect(
				screen.getByRole("button", { name: new RegExp(`^2026-01-01, ${metric}: [1-9]`) }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: new RegExp(`^2026-12-31, ${metric}: [1-9]`) }),
			).toBeInTheDocument();
		},
	);
});
