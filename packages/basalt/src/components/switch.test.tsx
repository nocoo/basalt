import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch, type SwitchProps } from "./switch";

function acceptSwitchProps(_props: SwitchProps) {}

describe("Switch", () => {
	it("renders an enabled switch", () => {
		render(<Switch aria-label="Alerts" />);
		expect(screen.getByRole("switch", { name: "Alerts" })).toBeEnabled();
	});

	it("can be disabled", () => {
		render(<Switch aria-label="Alerts" disabled />);
		expect(screen.getByRole("switch", { name: "Alerts" })).toBeDisabled();
	});

	it("supports a compact size", () => {
		render(<Switch aria-label="Alerts" size="sm" />);
		expect(screen.getByRole("switch", { name: "Alerts" }).className).toContain("h-4");
	});

	it("uses a bright white thumb", () => {
		render(<Switch aria-label="Alerts" />);
		expect(
			screen.getByRole("switch", { name: "Alerts" }).querySelector("span")?.className,
		).toContain("bg-white");
	});

	it("accepts checked and size states and inherited attributes, and rejects illegal values", () => {
		acceptSwitchProps({ checked: false });
		acceptSwitchProps({ checked: true });
		acceptSwitchProps({ size: "default" });
		acceptSwitchProps({ size: "sm" });
		acceptSwitchProps({
			checked: true,
			size: "sm",
			defaultChecked: true,
			onCheckedChange: () => undefined,
			disabled: true,
			required: true,
			name: "alerts",
			value: "on",
			form: "signup",
			asChild: false,
			className: "extra",
			"aria-label": "Alerts",
		});
		// @ts-expect-error checked must be a boolean
		acceptSwitchProps({ checked: "indeterminate" });
		// @ts-expect-error checked must be a boolean
		acceptSwitchProps({ checked: 1 });
		// @ts-expect-error size must be default or sm
		acceptSwitchProps({ size: "base" });
		// @ts-expect-error size must be default or sm
		acceptSwitchProps({ size: "lg" });
		// @ts-expect-error size must be default or sm
		acceptSwitchProps({ size: "xl" });
	});

	it("forwards ref, id, data, and className", () => {
		const ref = createRef<HTMLButtonElement>();
		render(
			<Switch ref={ref} id="alerts" className="extra" aria-label="Alerts" data-example="yes" />,
		);
		const root = screen.getByRole("switch", { name: "Alerts" });
		expect(root.tagName).toBe("BUTTON");
		expect(ref.current).toBe(root);
		expect(root).toHaveAttribute("id", "alerts");
		expect(root).toHaveAttribute("data-example", "yes");
		expect(root.className).toContain("extra");
		expect(root.className).toContain("h-6");
		expect(root.className).toContain("w-11");
		expect(root).not.toHaveAttribute("form");
	});

	it("toggles uncontrolled checked state", () => {
		render(<Switch aria-label="Alerts" />);
		const root = screen.getByRole("switch", { name: "Alerts" });
		expect(root).not.toBeChecked();
		fireEvent.click(root);
		expect(root).toBeChecked();
		fireEvent.click(root);
		expect(root).not.toBeChecked();
	});

	it("keeps a controlled checked value and reports the next state", () => {
		const onCheckedChange = vi.fn();
		render(<Switch aria-label="Alerts" checked onCheckedChange={onCheckedChange} />);
		const root = screen.getByRole("switch", { name: "Alerts" });
		expect(root).toBeChecked();
		fireEvent.click(root);
		expect(root).toBeChecked();
		expect(onCheckedChange).toHaveBeenCalledWith(false);
	});

	it("keeps default and compact root and thumb sizes", () => {
		const { rerender } = render(<Switch aria-label="Alerts" />);
		const root = screen.getByRole("switch", { name: "Alerts" });
		expect(root.className).toContain("h-6");
		expect(root.className).toContain("w-11");
		expect(root.querySelector("span")?.className).toContain("h-5");
		expect(root.querySelector("span")?.className).toContain("w-5");
		rerender(<Switch aria-label="Alerts" size="sm" />);
		const compact = screen.getByRole("switch", { name: "Alerts" });
		expect(compact.className).toContain("h-4");
		expect(compact.className).toContain("w-7");
		expect(compact.querySelector("span")?.className).toContain("h-3");
		expect(compact.querySelector("span")?.className).toContain("w-3");
	});
});
