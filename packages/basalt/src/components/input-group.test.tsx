import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { Button } from "./button";
import {
	InputGroup,
	type InputGroupAddonProps,
	type InputGroupButtonProps,
	type InputGroupInputProps,
	type InputGroupProps,
	type InputGroupSuffixProps,
} from "./input-group";

function acceptRootProps(_props: InputGroupProps) {}
function acceptInputProps(_props: InputGroupInputProps) {}
function acceptAddonProps(_props: InputGroupAddonProps) {}
function acceptButtonProps(_props: InputGroupButtonProps) {}
function acceptSuffixProps(_props: InputGroupSuffixProps) {}

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

	it("accepts named props types for each surface and rejects invalid values", () => {
		acceptRootProps({ disabled: true, className: "root", id: "group" });
		acceptRootProps({ onClick: () => undefined, children: "x" });
		acceptInputProps({ type: "email" });
		acceptInputProps({
			type: "search",
			placeholder: "Search",
			disabled: true,
			"aria-label": "Query",
			defaultValue: "atlas",
			onChange: () => undefined,
		});
		acceptAddonProps({ align: "start" });
		acceptAddonProps({ align: "end", className: "addon", children: "https://" });
		acceptButtonProps({
			variant: "ghost",
			size: "icon",
			asChild: false,
			loading: false,
			icon: "+",
			type: "submit",
			onClick: () => undefined,
			disabled: false,
			children: "Go",
		});
		acceptSuffixProps({ children: ".example.com", className: "suffix", id: "host" });
		// @ts-expect-error align must be start or end
		acceptAddonProps({ align: "middle" });
		// @ts-expect-error variant must be a button variant
		acceptButtonProps({ variant: "primary" });
		// @ts-expect-error type must be a string
		acceptInputProps({ type: 1 });
	});

	it("defaults the nested button to ghost icon compact instead of a plain Button", () => {
		render(
			<InputGroup>
				<InputGroup.Button aria-label="Go" />
			</InputGroup>,
		);
		const nested = screen.getByRole("button", { name: "Go" });
		expect(nested.className).toContain("hover:bg-basalt-accent");
		expect(nested.className).toContain("h-7");
		expect(nested.className).toContain("w-7");
		expect(nested.className).not.toContain("bg-basalt-primary");
		expect(nested.className).not.toContain("px-4");
	});

	it("keeps a plain Button on default variant and size", () => {
		render(<Button aria-label="Plain">Plain</Button>);
		const plain = screen.getByRole("button", { name: "Plain" });
		expect(plain.className).toContain("bg-basalt-primary");
		expect(plain.className).toContain("h-9");
		expect(plain.className).toContain("px-4");
	});

	it("lets explicit variant and size override the nested button", () => {
		render(
			<InputGroup>
				<InputGroup.Button variant="secondary" size="sm" aria-label="Go" />
			</InputGroup>,
		);
		const overridden = screen.getByRole("button", { name: "Go" });
		expect(overridden.className).toContain("bg-basalt-control");
		expect(overridden.className).toContain("text-xs");
	});

	it("places addons at the start or end and keeps suffix and input refs", () => {
		const inputRef = createRef<HTMLInputElement>();
		render(
			<InputGroup>
				<InputGroup.Addon>https://</InputGroup.Addon>
				<InputGroup.Input ref={inputRef} aria-label="Host" />
				<InputGroup.Addon align="end">.com</InputGroup.Addon>
				<InputGroup.Suffix>.example.com</InputGroup.Suffix>
			</InputGroup>,
		);
		expect(document.querySelector("[data-slot=input-group-addon-start]")).toHaveTextContent(
			"https://",
		);
		expect(document.querySelector("[data-slot=input-group-addon-end]")).toHaveTextContent(".com");
		expect(screen.getByText(".example.com")).toBeInTheDocument();
		expect(inputRef.current).toBe(screen.getByRole("textbox", { name: "Host" }));
	});
});
