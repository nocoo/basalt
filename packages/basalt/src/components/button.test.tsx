import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, LinkButton } from "./button";

describe("Button", () => {
	it("renders the default action", () => {
		render(<Button>Save</Button>);
		expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
	});

	it("renders a secondary variant", () => {
		render(<Button variant="secondary">Cancel</Button>);
		expect(screen.getByRole("button", { name: "Cancel" }).className).toContain(
			"bg-basalt-secondary",
		);
	});

	it("can be disabled", () => {
		render(<Button disabled>Save</Button>);
		expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
	});

	it("supports asChild", () => {
		render(
			<Button asChild>
				<a href="/docs">Docs</a>
			</Button>,
		);
		expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
	});

	it("exposes an accessible name when icon-only", () => {
		render(<Button size="icon" aria-label="Close" />);
		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
	});

	it("renders an icon before the label", () => {
		render(
			<Button
				icon={
					<span data-testid="plus" aria-hidden="true">
						+
					</span>
				}
			>
				Add
			</Button>,
		);
		expect(screen.getByTestId("plus")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
	});

	it("disables the control and replaces the icon while loading", () => {
		render(
			<Button loading icon={<span data-testid="plus">+</span>}>
				Save
			</Button>,
		);
		const button = screen.getByRole("button", { name: "Save" });
		expect(button).toBeDisabled();
		expect(button).toHaveAttribute("aria-busy", "true");
		expect(screen.queryByTestId("plus")).not.toBeInTheDocument();
		expect(button.querySelector("svg")).toBeTruthy();
	});
});

describe("LinkButton", () => {
	it("renders a link with button styles", () => {
		render(<LinkButton href="/docs">Docs</LinkButton>);
		const link = screen.getByRole("link", { name: "Docs" });
		expect(link).toHaveAttribute("href", "/docs");
		expect(link.className).toContain("bg-basalt-primary");
	});
});
