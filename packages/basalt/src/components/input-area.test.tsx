import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InputArea } from "./input-area";

describe("InputArea", () => {
	it("renders a textarea", () => {
		render(<InputArea aria-label="Notes" />);
		expect(screen.getByRole("textbox", { name: "Notes" })).toBeEnabled();
	});

	it("can be disabled", () => {
		render(<InputArea aria-label="Notes" disabled />);
		expect(screen.getByRole("textbox", { name: "Notes" })).toBeDisabled();
	});
});
