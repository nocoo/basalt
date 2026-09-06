import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, LinkButton } from "./button";

describe("Button", () => {
	it("renders the default action", () => {
		render(<Button>Save</Button>);
		expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
	});

	it("keeps keyboard focus visible on the primary fill", () => {
		render(<Button>Save</Button>);
		expect(screen.getByRole("button", { name: "Save" }).className).toContain("ring-offset-2");
	});

	it("renders a secondary variant", () => {
		render(<Button variant="secondary">Cancel</Button>);
		expect(screen.getByRole("button", { name: "Cancel" }).className).toContain("bg-basalt-control");
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
		expect(screen.getByRole("link", { name: "Docs" })).toHaveClass("basalt-ui");
	});

	it("disables asChild anchor and blocks child handlers when disabled or loading", () => {
		let childClicked = false;
		let parentClicked = false;
		render(
			<Button
				disabled
				asChild
				onClick={() => {
					parentClicked = true;
				}}
			>
				{/* biome-ignore lint/a11y/useValidAnchor: test fixture asserts navigation cancellation on disabled asChild anchor */}
				<a
					href="#activated"
					aria-disabled="false"
					tabIndex={0}
					onClick={() => {
						childClicked = true;
					}}
				>
					Docs
				</a>
			</Button>,
		);
		const link = screen.getByText("Docs");
		expect(link).toHaveAttribute("aria-disabled", "true");
		expect(link).toHaveAttribute("tabindex", "-1");
		link.click();
		expect(childClicked).toBe(false);
		expect(parentClicked).toBe(false);
	});

	it("sets native disabled on asChild button element and blocks child handlers", () => {
		let clicked = false;
		render(
			<Button
				loading
				asChild
				onClick={() => {
					clicked = true;
				}}
			>
				<button
					type="button"
					disabled={false}
					onClick={() => {
						clicked = true;
					}}
				>
					Action
				</button>
			</Button>,
		);
		const btn = screen.getByRole("button", { name: "Action" });
		expect(btn).toBeDisabled();
		expect(btn).toHaveAttribute("aria-disabled", "true");
		expect(btn).toHaveAttribute("aria-busy", "true");
		expect(btn).toHaveAttribute("tabindex", "-1");
		btn.click();
		expect(clicked).toBe(false);
	});

	it("blocks Enter and Space activations but allows Tab navigation when disabled asChild", () => {
		let keyActionFired = false;

		render(
			<Button
				disabled
				asChild
				onKeyDown={() => {
					keyActionFired = true;
				}}
			>
				<a
					href="#forbidden"
					onKeyDown={() => {
						keyActionFired = true;
					}}
				>
					Anchor
				</a>
			</Button>,
		);

		const link = screen.getByText("Anchor");

		// Simulate Enter key
		const enterEvent = new KeyboardEvent("keydown", {
			key: "Enter",
			bubbles: true,
			cancelable: true,
		});
		link.dispatchEvent(enterEvent);
		expect(keyActionFired).toBe(false);
		expect(enterEvent.defaultPrevented).toBe(true);

		// Simulate Space key
		const spaceEvent = new KeyboardEvent("keydown", {
			key: " ",
			bubbles: true,
			cancelable: true,
		});
		link.dispatchEvent(spaceEvent);
		expect(keyActionFired).toBe(false);
		expect(spaceEvent.defaultPrevented).toBe(true);

		// Simulate Tab key: should NOT be defaultPrevented
		const tabEvent = new KeyboardEvent("keydown", {
			key: "Tab",
			bubbles: true,
			cancelable: true,
		});
		link.dispatchEvent(tabEvent);
		expect(keyActionFired).toBe(false);
		expect(tabEvent.defaultPrevented).toBe(false);
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
