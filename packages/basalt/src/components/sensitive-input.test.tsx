import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { SensitiveInput, type SensitiveInputProps } from "./sensitive-input";

function acceptSensitiveInputProps(_props: SensitiveInputProps) {}

describe("SensitiveInput", () => {
	it("starts hidden and can reveal", () => {
		render(
			<SensitiveInput
				aria-label="Password"
				revealLabel="Show password"
				hideLabel="Hide password"
			/>,
		);
		expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
		fireEvent.click(screen.getByRole("button", { name: "Show password" }));
		expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
	});

	it("accepts required labels and native attributes, and rejects type or missing labels", () => {
		acceptSensitiveInputProps({
			revealLabel: "Show",
			hideLabel: "Hide",
			size: "sm",
			passwordManagerIgnore: true,
			"aria-label": "Password",
			name: "password",
			autoComplete: "current-password",
			required: true,
			disabled: true,
			value: "x",
			onChange: () => undefined,
			className: "extra",
			ref: createRef<HTMLInputElement>(),
		});
		// @ts-expect-error size must be sm, default, or lg
		acceptSensitiveInputProps({ revealLabel: "Show", hideLabel: "Hide", size: "xl" });
		// @ts-expect-error revealLabel is required
		acceptSensitiveInputProps({ hideLabel: "Hide" });
		// @ts-expect-error hideLabel is required
		acceptSensitiveInputProps({ revealLabel: "Show" });
		// @ts-expect-error type is not a SensitiveInput prop
		acceptSensitiveInputProps({ revealLabel: "Show", hideLabel: "Hide", type: "text" });
		// @ts-expect-error revealLabel must be a string
		acceptSensitiveInputProps({ revealLabel: 1, hideLabel: "Hide" });
		// @ts-expect-error hideLabel must be a string
		acceptSensitiveInputProps({ revealLabel: "Show", hideLabel: 1 });
	});

	it("forwards ref, native attributes, className, and value", () => {
		const ref = createRef<HTMLInputElement>();
		const onChange = vi.fn();
		render(
			<SensitiveInput
				ref={ref}
				className="extra"
				aria-label="Password"
				name="password"
				autoComplete="current-password"
				required
				defaultValue="hidden"
				revealLabel="Show"
				hideLabel="Hide"
				onChange={onChange}
			/>,
		);
		const input = screen.getByLabelText("Password");
		expect(input).toHaveAttribute("type", "password");
		expect(input).toHaveAttribute("name", "password");
		expect(input).toHaveAttribute("autocomplete", "current-password");
		expect(input).toBeRequired();
		expect(input).toHaveValue("hidden");
		expect(input.className).toContain("extra");
		expect(input.className).toContain("pr-10");
		expect(ref.current).toBe(input);
		fireEvent.change(input, { target: { value: "updated" } });
		expect(onChange).toHaveBeenCalled();
	});

	it("toggles password to text and back", () => {
		render(<SensitiveInput aria-label="Password" revealLabel="Show" hideLabel="Hide" />);
		const input = screen.getByLabelText("Password");
		expect(input).toHaveAttribute("type", "password");
		fireEvent.click(screen.getByRole("button", { name: "Show" }));
		expect(input).toHaveAttribute("type", "text");
		fireEvent.click(screen.getByRole("button", { name: "Hide" }));
		expect(input).toHaveAttribute("type", "password");
		expect(screen.getByRole("button", { name: "Show" })).toBeEnabled();
	});

	it("applies named sizes to the field and toggle", () => {
		const { rerender } = render(
			<SensitiveInput aria-label="Password" revealLabel="Show" hideLabel="Hide" />,
		);
		expect(screen.getByLabelText("Password").className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-9", "px-3", "py-2", "text-sm"]),
		);
		expect(screen.getByRole("button", { name: "Show" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-9", "w-9"]),
		);
		rerender(
			<SensitiveInput aria-label="Password" size="sm" revealLabel="Show" hideLabel="Hide" />,
		);
		expect(screen.getByLabelText("Password").className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-8", "px-2.5", "py-1.5", "text-xs"]),
		);
		rerender(
			<SensitiveInput aria-label="Password" size="lg" revealLabel="Show" hideLabel="Hide" />,
		);
		expect(screen.getByLabelText("Password").className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-10", "px-4", "py-2", "text-base"]),
		);
	});

	it("shows a destructive border when invalid", () => {
		render(
			<SensitiveInput aria-label="Password" aria-invalid revealLabel="Show" hideLabel="Hide" />,
		);
		expect(screen.getByLabelText("Password").className).toContain(
			"aria-invalid:border-basalt-destructive",
		);
	});

	it("edits an uncontrolled value and restores it on native form reset", () => {
		render(
			<form>
				<SensitiveInput
					aria-label="Password"
					name="secret"
					defaultValue="Ada"
					revealLabel="Show"
					hideLabel="Hide"
				/>
				<button type="reset">Reset</button>
			</form>,
		);
		const input = screen.getByLabelText("Password");
		expect(input).toHaveValue("Ada");
		fireEvent.change(input, { target: { value: "Grace" } });
		expect(input).toHaveValue("Grace");
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		expect(input).toHaveValue("Ada");
	});

	it("does not reveal when disabled", () => {
		render(
			<SensitiveInput
				aria-label="Disabled password"
				disabled
				revealLabel="Show"
				hideLabel="Hide"
			/>,
		);
		const input = screen.getByLabelText("Disabled password");
		const toggle = screen.getByRole("button", { name: "Show" });
		expect(input).toHaveAttribute("type", "password");
		expect(input).toBeDisabled();
		expect(toggle).toBeDisabled();
		fireEvent.click(toggle);
		expect(input).toHaveAttribute("type", "password");
	});
});
