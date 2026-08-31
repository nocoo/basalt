import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { Input, type InputProps } from "./input";

function acceptInputProps(_props: InputProps) {}

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

	it("accepts type, native attributes, and ref, and rejects a non-string type", () => {
		acceptInputProps({ type: "email" });
		acceptInputProps({ type: "search" });
		acceptInputProps({
			className: "extra",
			placeholder: "Jane Doe",
			disabled: true,
			"aria-label": "Name",
			value: "x",
			onChange: () => undefined,
			ref: createRef<HTMLInputElement>(),
		});
		acceptInputProps({ defaultValue: "y" });
		// @ts-expect-error type must be a string
		acceptInputProps({ type: 1 });
	});

	it("forwards type, native attributes, ref, className, and change", () => {
		const ref = createRef<HTMLInputElement>();
		const onChange = vi.fn();
		render(
			<Input
				ref={ref}
				type="email"
				className="extra"
				placeholder="you@example.com"
				id="email"
				name="email"
				aria-label="Email"
				defaultValue="a@b.c"
				onChange={onChange}
			/>,
		);
		const input = screen.getByRole("textbox", { name: "Email" });
		expect(input).toHaveAttribute("type", "email");
		expect(input).toHaveAttribute("placeholder", "you@example.com");
		expect(input).toHaveAttribute("id", "email");
		expect(input).toHaveAttribute("name", "email");
		expect(input).toHaveValue("a@b.c");
		expect(input.className).toContain("extra");
		expect(input.className).toContain("bg-basalt-secondary");
		expect(ref.current).toBe(input);
		fireEvent.change(input, { target: { value: "z@z.z" } });
		expect(onChange).toHaveBeenCalled();
	});

	it("forwards search type", () => {
		render(<Input type="search" aria-label="Search type" />);
		expect(screen.getByRole("searchbox", { name: "Search type" })).toHaveAttribute(
			"type",
			"search",
		);
	});
});
