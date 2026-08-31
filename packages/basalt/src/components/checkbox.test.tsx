import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox, type CheckboxProps } from "./checkbox";

function acceptCheckboxProps(_props: CheckboxProps) {}

describe("Checkbox", () => {
	it("renders an enabled checkbox", () => {
		render(<Checkbox aria-label="Accept" />);
		expect(screen.getByRole("checkbox", { name: "Accept" })).toBeEnabled();
	});

	it("keeps a square control", () => {
		render(<Checkbox aria-label="Accept" />);
		const box = screen.getByRole("checkbox", { name: "Accept" });
		expect(box.className).toContain("rounded-[4px]");
		expect(box.className).not.toContain("rounded-full");
		expect(box.className).not.toContain("rounded-sm");
	});

	it("keeps keyboard focus visible on the primary fill", () => {
		render(<Checkbox aria-label="Accept" />);
		expect(screen.getByRole("checkbox", { name: "Accept" }).className).toContain("ring-offset-2");
	});

	it("renders an indeterminate state", () => {
		render(<Checkbox aria-label="Partial" checked="indeterminate" />);
		const checkbox = screen.getByRole("checkbox", { name: "Partial" });
		expect(checkbox).toHaveAttribute("data-state", "indeterminate");
		expect(checkbox.className).toContain("data-[state=indeterminate]:bg-basalt-primary");
	});

	it("keeps mixed state when defaultChecked is indeterminate", () => {
		render(<Checkbox aria-label="Partial" defaultChecked="indeterminate" />);
		expect(screen.getByRole("checkbox", { name: "Partial" })).toHaveAttribute(
			"data-state",
			"indeterminate",
		);
	});

	it("can be disabled", () => {
		render(<Checkbox aria-label="Accept" disabled />);
		expect(screen.getByRole("checkbox", { name: "Accept" })).toBeDisabled();
	});

	it("accepts checked states and inherited attributes, and rejects illegal checked values", () => {
		acceptCheckboxProps({ checked: false });
		acceptCheckboxProps({ checked: true });
		acceptCheckboxProps({ checked: "indeterminate" });
		acceptCheckboxProps({
			defaultChecked: true,
			onCheckedChange: () => undefined,
			disabled: true,
			required: true,
			name: "terms",
			value: "yes",
			form: "signup",
			asChild: false,
			className: "extra",
			"aria-label": "Accept",
		});
		// @ts-expect-error checked must be boolean or indeterminate
		acceptCheckboxProps({ checked: "mixed" });
		// @ts-expect-error checked must be boolean or indeterminate
		acceptCheckboxProps({ checked: 1 });
	});

	it("forwards ref, native attributes, and className", () => {
		const ref = createRef<HTMLButtonElement>();
		render(
			<Checkbox ref={ref} className="extra" aria-label="Accept" id="terms" value="yes" required />,
		);
		const box = screen.getByRole("checkbox", { name: "Accept" });
		expect(box.tagName).toBe("BUTTON");
		expect(ref.current).toBe(box);
		expect(box).toHaveAttribute("id", "terms");
		expect(box).toHaveAttribute("value", "yes");
		expect(box).toBeRequired();
		expect(box.className).toContain("extra");
		expect(box.className).toContain("rounded-[4px]");
	});

	it("toggles uncontrolled checked state", () => {
		render(<Checkbox aria-label="Accept" />);
		const box = screen.getByRole("checkbox", { name: "Accept" });
		expect(box).not.toBeChecked();
		fireEvent.click(box);
		expect(box).toBeChecked();
		fireEvent.click(box);
		expect(box).not.toBeChecked();
	});

	it("keeps a controlled checked value and reports the next state", () => {
		const onCheckedChange = vi.fn();
		render(<Checkbox aria-label="Accept" checked onCheckedChange={onCheckedChange} />);
		const box = screen.getByRole("checkbox", { name: "Accept" });
		expect(box).toBeChecked();
		fireEvent.click(box);
		expect(box).toBeChecked();
		expect(onCheckedChange).toHaveBeenCalledWith(false);
	});
});
