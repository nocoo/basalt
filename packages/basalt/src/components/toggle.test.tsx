import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toggle } from "./toggle";

describe("Toggle", () => {
	it("renders a toggle button", () => {
		render(<Toggle aria-label="Bold">B</Toggle>);
		expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
	});
});
