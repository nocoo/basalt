import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SettingsPage from "@/pages/SettingsPage";

describe("SettingsPage", () => {
	it("paints controls from the nested surface instead of card", () => {
		const { container } = render(<SettingsPage />);
		expect(container.innerHTML).not.toContain("bg-card");
		expect(container.querySelector(".bg-basalt-control")).not.toBeNull();
	});
	it("keeps select preferences and compact spacing functional", () => {
		render(
			<ThemeProvider>
				<SettingsPage />
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Appearance" }));
		expect(screen.getByRole("button", { name: "Appearance" })).toHaveAttribute(
			"aria-current",
			"page",
		);
		const currency = screen.getByRole("combobox", { name: "Currency" });
		fireEvent.keyDown(currency, { key: "ArrowDown" });
		fireEvent.click(screen.getByRole("option", { name: "EUR (€)" }));
		expect(currency).toHaveTextContent("EUR");
		expect(screen.getByText(/Default display currency/)).toHaveTextContent("€1,240.00");
		const compact = screen.getByRole("switch", { name: "Compact mode" });
		const body = compact.parentElement?.parentElement;
		expect(body).toHaveClass("space-y-basalt-card");
		fireEvent.click(compact);
		expect(compact).toHaveAttribute("aria-checked", "true");
		expect(body).toHaveClass("space-y-basalt-card-sm");
	});
	it("keeps local-demo guidance and live notices inside the navigation island", () => {
		render(<SettingsPage />);
		const island = screen
			.getByRole("navigation", { name: "Settings" })
			.closest("[data-basalt-surface]");
		expect(island).not.toBeNull();
		expect(island).toContainElement(
			screen.getByText("Local demo. These actions do not update a real account or service."),
		);
		fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
		fireEvent.click(screen.getByRole("switch", { name: "Email notifications" }));
		const notice = screen.getByRole("status");
		expect(notice).toHaveAttribute("aria-live", "polite");
		expect(notice.closest("[data-basalt-surface]")).toBe(island);
	});
});
