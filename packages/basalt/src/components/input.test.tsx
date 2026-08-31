import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CONTROL_SURFACE_CLASS } from "./control-surface";
import { Input } from "./input";

describe("Input", () => {
	it("renders an enabled text field", () => {
		render(<Input aria-label="Name" />);
		const input = screen.getByRole("textbox", { name: "Name" });
		expect(input).toBeEnabled();
		expect(input.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(input.className.split(/\s+/)).toEqual(expect.arrayContaining(["h-9", "px-3", "py-2"]));
		expect(input.className).toContain("bg-basalt-secondary");
		expect(input.className).not.toContain("bg-basalt-background");
	});

	it("can be disabled", () => {
		render(<Input aria-label="Name" disabled />);
		expect(screen.getByRole("textbox", { name: "Name" })).toBeDisabled();
	});
});
