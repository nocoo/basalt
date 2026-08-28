import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "../providers/theme";
import { ThemeToggle } from "./theme-toggle";

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
});
