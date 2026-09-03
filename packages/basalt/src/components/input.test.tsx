import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { Input, type InputProps } from "./input";

function acceptInputProps(_props: InputProps) {}

const SIZE_CLASS = {
	sm: ["h-8", "px-2.5", "py-1.5", "text-xs"],
	default: ["h-9", "px-3", "py-2", "text-sm"],
	lg: ["h-10", "px-4", "py-2", "text-base"],
} as const;

describe("Input", () => {
	it("renders an enabled text field", () => {
		render(<Input aria-label="Name" />);
		const input = screen.getByRole("textbox", { name: "Name" });
		expect(input).toBeEnabled();
		expect(input.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(input.className.split(/\s+/)).toEqual(expect.arrayContaining(["h-9", "px-3", "py-2"]));
		expect(input.className).toContain("bg-basalt-control");
		expect(input.className).not.toContain("bg-basalt-background");
	});

	it("can be disabled", () => {
		render(<Input aria-label="Name" disabled />);
		expect(screen.getByRole("textbox", { name: "Name" })).toBeDisabled();
	});

	it("applies named sizes and keeps the default class", () => {
		const { rerender } = render(<Input aria-label="Name" />);
		expect(screen.getByRole("textbox", { name: "Name" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.default]),
		);
		rerender(<Input aria-label="Name" size="default" />);
		expect(screen.getByRole("textbox", { name: "Name" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.default]),
		);
		rerender(<Input aria-label="Name" size="sm" />);
		expect(screen.getByRole("textbox", { name: "Name" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.sm]),
		);
		rerender(<Input aria-label="Name" size="lg" />);
		expect(screen.getByRole("textbox", { name: "Name" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.lg]),
		);
	});

	it("keeps a destructive invalid border that focus-visible cannot replace", () => {
		render(<Input aria-label="Name" aria-invalid />);
		const input = screen.getByRole("textbox", { name: "Name" });
		expect(input.className).toContain("aria-invalid:border-basalt-destructive");
		expect(input.className).toContain("aria-invalid:focus-visible:border-basalt-destructive");
		expect(input.className).toContain("focus-visible:border-basalt-ring");
	});

	it("adds password-manager markers only when requested and does not let callers override them", () => {
		const { rerender } = render(<Input aria-label="Name" />);
		const unmarked = screen.getByRole("textbox", { name: "Name" });
		expect(unmarked.className).not.toContain("keeper-ignore");
		expect(unmarked).not.toHaveAttribute("data-1p-ignore");
		expect(unmarked).not.toHaveAttribute("data-bwignore");
		expect(unmarked).not.toHaveAttribute("data-form-type");
		expect(unmarked).not.toHaveAttribute("data-lpignore");
		rerender(
			<Input
				aria-label="Name"
				passwordManagerIgnore
				data-1p-ignore="false"
				data-bwignore="false"
				data-form-type="login"
				data-lpignore="false"
			/>,
		);
		const marked = screen.getByRole("textbox", { name: "Name" });
		expect(marked.className).toContain("keeper-ignore");
		expect(marked).toHaveAttribute("data-1p-ignore", "true");
		expect(marked).toHaveAttribute("data-bwignore", "true");
		expect(marked).toHaveAttribute("data-form-type", "other");
		expect(marked).toHaveAttribute("data-lpignore", "true");
	});

	it("keeps a controlled value and reports change", () => {
		const onChange = vi.fn();
		render(<Input aria-label="Name" value="Ada" onChange={onChange} />);
		const input = screen.getByRole("textbox", { name: "Name" });
		expect(input).toHaveValue("Ada");
		fireEvent.change(input, { target: { value: "Grace" } });
		expect(input).toHaveValue("Ada");
		expect(onChange).toHaveBeenCalled();
	});

	it("edits an uncontrolled value and restores it on native form reset", () => {
		render(
			<form>
				<Input aria-label="Name" name="name" defaultValue="Ada" />
				<button type="reset">Reset</button>
			</form>,
		);
		const input = screen.getByRole("textbox", { name: "Name" });
		expect(input).toHaveValue("Ada");
		fireEvent.change(input, { target: { value: "Grace" } });
		expect(input).toHaveValue("Grace");
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		expect(input).toHaveValue("Ada");
	});

	it("accepts type, size, passwordManagerIgnore, native attributes, and ref, and rejects illegal values", () => {
		acceptInputProps({ type: "email" });
		acceptInputProps({ type: "search" });
		acceptInputProps({ size: "sm" });
		acceptInputProps({ size: "default" });
		acceptInputProps({ size: "lg" });
		acceptInputProps({ passwordManagerIgnore: true });
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
		// @ts-expect-error size must be sm, default, or lg
		acceptInputProps({ size: "xl" });
		// @ts-expect-error native numeric size is not accepted
		acceptInputProps({ size: 20 });
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
		expect(input.className).toContain("bg-basalt-control");
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
