import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "../providers/theme";
import { ThemeToggle, type ThemeToggleProps } from "./theme-toggle";

function acceptThemeToggleProps(_props: ThemeToggleProps) {}

describe("ThemeToggle", () => {
	it("cycles theme and has an accessible name", () => {
		render(
			<ThemeProvider persist={false} applyToDocument={false}>
				<ThemeToggle aria-label="Toggle theme" />
			</ThemeProvider>,
		);
		const button = screen.getByRole("button", { name: "Toggle theme" });
		expect(button).toHaveAttribute("data-theme", "system");
		fireEvent.click(button);
		expect(button).toHaveAttribute("data-theme", "light");
		fireEvent.click(button);
		expect(button).toHaveAttribute("data-theme", "dark");
		fireEvent.click(button);
		expect(button).toHaveAttribute("data-theme", "system");
		expect(button).toBeEnabled();
	});

	it("names the next theme in its accessible name and bottom tooltip by default", async () => {
		render(
			<ThemeProvider persist={false} applyToDocument={false}>
				<ThemeToggle />
			</ThemeProvider>,
		);
		const button = screen.getByRole("button", { name: "Switch to light theme" });
		expect(button).toHaveAttribute("data-slot", "header-action");
		act(() => button.focus());
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Switch to light theme");
		fireEvent.click(button);
		expect(button).toHaveAccessibleName("Switch to dark theme");
		fireEvent.click(button);
		expect(button).toHaveAccessibleName("Use system theme");
	});

	it("uses custom labels and can hide the tooltip", () => {
		const labels = { light: "切换为浅色主题", dark: "切换为深色主题", system: "跟随系统主题" };
		const { rerender } = render(
			<ThemeProvider persist={false} applyToDocument={false}>
				<ThemeToggle labels={labels} tooltip={false} />
			</ThemeProvider>,
		);
		const button = screen.getByRole("button", { name: "切换为浅色主题" });
		act(() => button.focus());
		expect(screen.queryByRole("tooltip")).toBeNull();
		fireEvent.click(button);
		expect(button).toHaveAccessibleName("切换为深色主题");
		rerender(
			<ThemeProvider persist={false} applyToDocument={false}>
				<ThemeToggle labels={{ system: "跟随系统主题" }} aria-label="主题" tooltip={false} />
			</ThemeProvider>,
		);
		expect(screen.getByRole("button", { name: "主题" })).toBeInTheDocument();
	});

	it("accepts optional labels and rejects unsupported Button props", () => {
		acceptThemeToggleProps({ "aria-label": "Toggle theme" });
		acceptThemeToggleProps({});
		acceptThemeToggleProps({ tooltip: false, labels: { dark: "Dark" } });
		// @ts-expect-error size is not a ThemeToggle prop
		acceptThemeToggleProps({ "aria-label": "Toggle theme", size: "icon" });
	});
});
