import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
	it("renders an enabled checkbox", () => {
		render(<Checkbox aria-label="Accept" />);
		expect(screen.getByRole("checkbox", { name: "Accept" })).toBeEnabled();
	});

	it("keeps a square control", () => {
		render(<Checkbox aria-label="Accept" />);
		const box = screen.getByRole("checkbox", { name: "Accept" });
		expect(box.className).toContain("rounded-[4px]");
		expect(box.className).not.toContain("rounded-full");
		expect(box.className).not.toContain("rounded-sm");
	});

	it("keeps keyboard focus visible on the primary fill", () => {
		render(<Checkbox aria-label="Accept" />);
		expect(screen.getByRole("checkbox", { name: "Accept" }).className).toContain("ring-offset-2");
	});

	it("renders an indeterminate state", () => {
		render(<Checkbox aria-label="Partial" checked="indeterminate" />);
		const checkbox = screen.getByRole("checkbox", { name: "Partial" });
		expect(checkbox).toHaveAttribute("data-state", "indeterminate");
		expect(checkbox.className).toContain("data-[state=indeterminate]:bg-basalt-primary");
	});

	it("keeps mixed state when defaultChecked is indeterminate", () => {
		render(<Checkbox aria-label="Partial" defaultChecked="indeterminate" />);
		expect(screen.getByRole("checkbox", { name: "Partial" })).toHaveAttribute(
			"data-state",
			"indeterminate",
		);
	});

	it("can be disabled", () => {
		render(<Checkbox aria-label="Accept" disabled />);
		expect(screen.getByRole("checkbox", { name: "Accept" })).toBeDisabled();
	});
});
