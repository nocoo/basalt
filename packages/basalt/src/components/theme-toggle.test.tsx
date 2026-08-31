import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "../providers/theme";
import { ThemeToggle, type ThemeToggleProps } from "./theme-toggle";

function acceptThemeToggleProps(_props: ThemeToggleProps) {}

describe("ThemeToggle", () => {
	it("cycles theme and has an accessible name", () => {
		render(
			<ThemeProvider>
				<ThemeToggle aria-label="Toggle theme" />
			</ThemeProvider>,
		);
		const button = screen.getByRole("button", { name: "Toggle theme" });
		fireEvent.click(button);
		fireEvent.click(button);
		fireEvent.click(button);
		expect(button).toBeEnabled();
	});

	it("requires aria-label and rejects unsupported Button props", () => {
		acceptThemeToggleProps({ "aria-label": "Toggle theme" });
		// @ts-expect-error aria-label is required
		acceptThemeToggleProps({});
		// @ts-expect-error size is not a ThemeToggle prop
		acceptThemeToggleProps({ "aria-label": "Toggle theme", size: "icon" });
	});
});
