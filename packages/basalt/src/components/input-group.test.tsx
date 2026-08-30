import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InputGroup } from "./input-group";

describe("InputGroup", () => {
	it("renders a composed input", () => {
		render(
			<InputGroup>
				<InputGroup.Input aria-label="Query" />
			</InputGroup>,
		);
		expect(screen.getByRole("textbox", { name: "Query" })).toBeInTheDocument();
	});

	it("keeps the suffix inline with the value", () => {
		render(
			<InputGroup>
				<InputGroup.Input defaultValue="kumo" aria-label="Subdomain" />
				<InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
			</InputGroup>,
		);
		expect(screen.getByRole("textbox", { name: "Subdomain" })).toHaveValue("kumo");
		expect(screen.getByText(".workers.dev")).toBeInTheDocument();
	});

	it("disables nested controls when the group is disabled", () => {
		render(
			<InputGroup disabled>
				<InputGroup.Input aria-label="Query" />
				<InputGroup.Button aria-label="Go" />
			</InputGroup>,
		);
		expect(screen.getByRole("textbox", { name: "Query" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Go" })).toBeDisabled();
	});

	it("focuses the input when the group is clicked", () => {
		render(
			<InputGroup>
				<InputGroup.Input defaultValue="kumo" aria-label="Subdomain" />
				<InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
			</InputGroup>,
		);
		fireEvent.click(screen.getByText(".workers.dev"));
		expect(screen.getByRole("textbox", { name: "Subdomain" })).toHaveFocus();
	});
});
