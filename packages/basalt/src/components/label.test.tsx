import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./label";
import { TooltipProvider } from "./tooltip";

describe("Label", () => {
	it("renders and associates with a control via htmlFor", () => {
		render(
			<>
				<Label htmlFor="email">Email</Label>
				<input id="email" />
			</>,
		);
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
	});

	it("shows an optional marker", () => {
		render(<Label showOptional>Optional Field</Label>);
		expect(screen.getByText("Optional Field")).toBeInTheDocument();
		expect(screen.getByText("(optional)")).toBeInTheDocument();
	});

	it("shows a tooltip trigger", () => {
		render(
			<TooltipProvider>
				<Label tooltip="More information about this field">With Tooltip</Label>
			</TooltipProvider>,
		);
		expect(screen.getByText("With Tooltip")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "More information" })).toBeInTheDocument();
	});
});
