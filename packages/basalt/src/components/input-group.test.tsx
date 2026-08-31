import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CONTROL_SURFACE_CLASS } from "./control-surface";
import { InputGroup } from "./input-group";

describe("InputGroup", () => {
	it("renders a composed input", () => {
		render(
			<InputGroup>
				<InputGroup.Input aria-label="Query" />
			</InputGroup>,
		);
		expect(screen.getByRole("textbox", { name: "Query" })).toBeInTheDocument();
		const root = document.querySelector("[data-slot=input-group]");
		expect(root).toBeTruthy();
		expect(root?.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(root?.className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-9", "[&>:first-child]:rounded-l-basalt-md"]),
		);
		expect(root?.className).not.toContain("bg-basalt-background");
		expect(root?.className).not.toContain("rounded-basalt-lg");
	});

	it("keeps the suffix inline with the value", () => {
		render(
			<InputGroup>
				<InputGroup.Input defaultValue="atlas" aria-label="Subdomain" />
				<InputGroup.Suffix>.example.com</InputGroup.Suffix>
			</InputGroup>,
		);
		expect(screen.getByRole("textbox", { name: "Subdomain" })).toHaveValue("atlas");
		expect(screen.getByText(".example.com")).toBeInTheDocument();
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
				<InputGroup.Input defaultValue="atlas" aria-label="Subdomain" />
				<InputGroup.Suffix>.example.com</InputGroup.Suffix>
			</InputGroup>,
		);
		fireEvent.click(screen.getByText(".example.com"));
		expect(screen.getByRole("textbox", { name: "Subdomain" })).toHaveFocus();
	});
});
