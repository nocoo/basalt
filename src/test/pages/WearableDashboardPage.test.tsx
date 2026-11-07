import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import i18n from "@/i18n";
import WearableDashboardPage from "@/pages/WearableDashboardPage";

beforeAll(async () => {
	await i18n.changeLanguage("en");
});

describe("WearableDashboardPage", () => {
	it("lays out sleep stages and heart zones with readable legends", () => {
		render(<WearableDashboardPage />);

		expect(
			screen.getByRole("heading", { name: "Wearable performance dashboard" }),
		).toBeInTheDocument();
		expect(screen.getByRole("img", { name: /^Sleep stages: Deep/ })).toBeInTheDocument();
		expect(screen.getByRole("img", { name: /^Heart rate zones: Rest/ })).toBeInTheDocument();
		for (const stage of ["Deep", "Light", "REM", "Awake"]) {
			expect(screen.getByText(stage)).toBeInTheDocument();
		}
		for (const zone of ["Rest", "Easy", "Cardio", "Peak"]) {
			expect(screen.getByText(zone)).toBeInTheDocument();
		}
	});

	it("moves the whole day back and forward with the date navigation", () => {
		render(<WearableDashboardPage />);

		expect(screen.getByText(/Feb 13, 2026/)).toBeInTheDocument();
		const before = document.body.textContent;

		fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
		expect(screen.getByText(/Feb 12, 2026/)).toBeInTheDocument();
		expect(document.body.textContent).not.toBe(before);

		const previous = document.body.textContent;
		fireEvent.click(screen.getByRole("button", { name: "Next day" }));
		expect(screen.getByText(/Feb 13, 2026/)).toBeInTheDocument();
		expect(document.body.textContent).not.toBe(previous);
	});

	it("returns to the real today from the reference day", () => {
		render(<WearableDashboardPage />);
		const todayLabel = new Date().toLocaleDateString("en", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
		});

		const today = screen.getByRole("button", { name: "Today" });
		expect(today).toBeEnabled();
		fireEvent.click(today);

		expect(screen.getByText(todayLabel)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Today" })).toBeDisabled();
	});
});
