import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toggle } from "./toggle";

describe("Toggle", () => {
	it("renders a toggle button", () => {
		render(<Toggle aria-label="Bold">B</Toggle>);
		expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
	});

	it("toggles pressed state", () => {
		render(<Toggle aria-label="Bold">B</Toggle>);
		const button = screen.getByRole("button", { name: "Bold" });
		fireEvent.click(button);
		expect(button).toHaveAttribute("data-state", "on");
	});
});
