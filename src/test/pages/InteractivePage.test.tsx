import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InteractivePage from "@/pages/InteractivePage";

describe("InteractivePage", () => {
	it("keeps button icon spacing owned by Button", () => {
		render(<InteractivePage />);
		for (const name of ["Copy", "Success", "Error", "Warning", "Info", "Filter", "Profile"]) {
			const button = screen.getByRole("button", { name });
			expect(button).toHaveClass("gap-basalt-control-gap");
			for (const icon of button.querySelectorAll("svg")) {
				expect(icon.getAttribute("class")).not.toMatch(/\b(?:mr|ml)-/);
			}
		}
	});
	it("uses left-aligned profile actions and a separate sign-out row", async () => {
		render(<InteractivePage />);
		fireEvent.click(screen.getByRole("button", { name: "Profile" }));
		const panel = await screen.findByRole("dialog", { name: "Profile" });
		expect(within(panel).getByText("Zheng Li")).toBeInTheDocument();
		for (const name of ["Profile settings", "Billing", "Sign out"]) {
			const action = within(panel).getByRole("button", { name });
			expect(action).toHaveClass("justify-start", "text-left", "min-h-basalt-menu-row");
			expect(action.querySelector("svg")).not.toBeNull();
		}
		expect(panel.querySelectorAll('[data-orientation="horizontal"]')).toHaveLength(2);
	});
});
