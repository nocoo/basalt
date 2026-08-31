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
