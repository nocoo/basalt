import { AccentProvider } from "@nocoo/basalt/providers/accent";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccentPicker } from "@/components/AccentPicker";

describe("AccentPicker", () => {
	it("lets the user pick a palette accent", () => {
		window.localStorage.removeItem("basalt-accent");
		render(
			<ThemeProvider>
				<AccentProvider>
					<AccentPicker />
				</AccentProvider>
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Accent color" }));
		fireEvent.click(screen.getByRole("button", { name: "Teal" }));
		expect(window.localStorage.getItem("basalt-accent")).toBe("teal");
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("186 80% 32%");
	});
});
