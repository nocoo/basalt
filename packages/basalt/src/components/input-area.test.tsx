import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CONTROL_SURFACE_CLASS } from "./control-surface";
import { InputArea } from "./input-area";

describe("InputArea", () => {
	it("renders a textarea", () => {
		render(<InputArea aria-label="Notes" />);
		const area = screen.getByRole("textbox", { name: "Notes" });
		expect(area).toBeEnabled();
		expect(area.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(area.className.split(/\s+/)).toEqual(
			expect.arrayContaining(["min-h-[80px]", "px-3", "py-2"]),
		);
		expect(area.className).toContain("bg-basalt-secondary");
	});

	it("can be disabled", () => {
		render(<InputArea aria-label="Notes" disabled />);
		expect(screen.getByRole("textbox", { name: "Notes" })).toBeDisabled();
	});
});
