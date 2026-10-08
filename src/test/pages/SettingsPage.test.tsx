import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
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
		expect(body).toHaveClass("space-y-basalt-space-lg");
		fireEvent.click(compact);
		expect(compact).toHaveAttribute("aria-checked", "true");
		expect(body).toHaveClass("space-y-basalt-space-sm");
	});
	it("preserves language selection through the shared provider", async () => {
		render(
			<ThemeProvider>
				<SettingsPage />
			</ThemeProvider>,
		);
		try {
			fireEvent.click(screen.getByRole("button", { name: "Appearance" }));
			fireEvent.keyDown(screen.getByRole("combobox", { name: "Language" }), { key: "ArrowDown" });
			fireEvent.click(screen.getByRole("option", { name: "简体中文" }));
			await waitFor(() => expect(i18n.resolvedLanguage).toBe("zh"));
		} finally {
			await i18n.changeLanguage("en");
		}
	});
});
