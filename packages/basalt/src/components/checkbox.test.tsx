import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
	it("renders an enabled checkbox", () => {
		render(<Checkbox aria-label="Accept" />);
		expect(screen.getByRole("checkbox", { name: "Accept" })).toBeEnabled();
	});

	it("renders an indeterminate state", () => {
		render(<Checkbox aria-label="Partial" checked="indeterminate" />);
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
