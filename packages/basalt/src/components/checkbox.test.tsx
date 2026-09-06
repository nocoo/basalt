import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	Checkbox,
	type CheckboxGroupProps,
	type CheckboxItemProps,
	type CheckboxLegendProps,
	type CheckboxProps,
} from "./checkbox";

function acceptCheckboxProps(_props: CheckboxProps) {}
function acceptCheckboxGroupProps(_props: CheckboxGroupProps) {}
function acceptCheckboxLegendProps(_props: CheckboxLegendProps) {}
function acceptCheckboxItemProps(_props: CheckboxItemProps) {}

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

	it("applies named sizes and keeps the default class", () => {
		const { rerender } = render(<Checkbox aria-label="Accept" />);
		expect(screen.getByRole("checkbox", { name: "Accept" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-4", "w-4"]),
		);
		rerender(<Checkbox aria-label="Accept" size="default" />);
		expect(screen.getByRole("checkbox", { name: "Accept" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-4", "w-4"]),
		);
		rerender(<Checkbox aria-label="Accept" size="sm" />);
		expect(screen.getByRole("checkbox", { name: "Accept" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-3", "w-3"]),
		);
	});

	it("accepts checked states and inherited attributes, and rejects illegal checked values", () => {
		acceptCheckboxProps({ checked: false });
		acceptCheckboxProps({ checked: true });
		acceptCheckboxProps({ checked: "indeterminate" });
		acceptCheckboxProps({ size: "sm" });
		acceptCheckboxProps({ size: "default" });
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
		// @ts-expect-error size must be sm or default
		acceptCheckboxProps({ size: "lg" });
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

	it("toggles grouped values with legend, error, and controlled updates", () => {
		const onValueChange = vi.fn();
		render(
			<Checkbox.Group value={["alpha"]} onValueChange={onValueChange} error="Pick at least two">
				<Checkbox.Legend>Topics</Checkbox.Legend>
				<Checkbox.Item value="alpha">Alpha</Checkbox.Item>
				<Checkbox.Item value="beta">Beta</Checkbox.Item>
			</Checkbox.Group>,
		);
		const group = screen.getByRole("group", { name: "Topics" });
		expect(group.tagName).toBe("FIELDSET");
		expect(group).toHaveAttribute("aria-invalid", "true");
		expect(screen.getByRole("alert")).toHaveTextContent("Pick at least two");
		expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeChecked();
		expect(screen.getByRole("checkbox", { name: "Beta" })).not.toBeChecked();
		fireEvent.click(screen.getByRole("checkbox", { name: "Beta" }));
		expect(onValueChange).toHaveBeenCalledWith(["alpha", "beta"]);
		expect(screen.getByRole("checkbox", { name: "Beta" })).not.toBeChecked();
	});

	it("merges caller described-by with generated group error", () => {
		render(
			<Checkbox.Group error="Pick at least two" aria-describedby="hint">
				<Checkbox.Legend>Topics</Checkbox.Legend>
				<Checkbox.Item value="alpha">Alpha</Checkbox.Item>
			</Checkbox.Group>,
		);
		const group = screen.getByRole("group", { name: "Topics" });
		const alert = screen.getByRole("alert");
		expect(group).toHaveAttribute("aria-invalid", "true");
		expect(group).toHaveAttribute("aria-describedby", `${alert.id} hint`);
	});

	it("restores grouped defaultValue on native form reset", async () => {
		render(
			<form>
				<Checkbox.Group defaultValue={["a"]}>
					<Checkbox.Legend>Topics</Checkbox.Legend>
					<Checkbox.Item value="a">Alpha</Checkbox.Item>
					<Checkbox.Item value="b">Beta</Checkbox.Item>
				</Checkbox.Group>
				<button type="reset">Reset</button>
			</form>,
		);
		const alpha = screen.getByRole("checkbox", { name: "Alpha" });
		const beta = screen.getByRole("checkbox", { name: "Beta" });
		expect(alpha).toBeChecked();
		expect(beta).not.toBeChecked();
		fireEvent.click(alpha);
		fireEvent.click(beta);
		expect(alpha).not.toBeChecked();
		expect(beta).toBeChecked();
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await waitFor(() => {
			expect(alpha).toBeChecked();
			expect(beta).not.toBeChecked();
		});
	});

	it("forwards object and function refs to the group", () => {
		const objectRef = createRef<HTMLFieldSetElement>();
		const functionRef = vi.fn();
		const { rerender } = render(
			<Checkbox.Group ref={objectRef}>
				<Checkbox.Legend>Topics</Checkbox.Legend>
				<Checkbox.Item value="a">Alpha</Checkbox.Item>
			</Checkbox.Group>,
		);
		expect(objectRef.current?.tagName).toBe("FIELDSET");
		rerender(
			<Checkbox.Group ref={functionRef}>
				<Checkbox.Legend>Topics</Checkbox.Legend>
				<Checkbox.Item value="a">Alpha</Checkbox.Item>
			</Checkbox.Group>,
		);
		expect(functionRef).toHaveBeenCalledWith(expect.any(HTMLFieldSetElement));
	});

	it("keeps caller invalid and described-by when there is no group error", () => {
		render(
			<Checkbox.Group aria-invalid={true} aria-describedby="hint">
				<Checkbox.Legend>Topics</Checkbox.Legend>
				<Checkbox.Item value="a">Alpha</Checkbox.Item>
			</Checkbox.Group>,
		);
		const group = screen.getByRole("group", { name: "Topics" });
		expect(group).toHaveAttribute("aria-invalid", "true");
		expect(group).toHaveAttribute("aria-describedby", "hint");
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("does not restore a controlled group on native form reset", async () => {
		const onValueChange = vi.fn();
		render(
			<form>
				<Checkbox.Group value={["b"]} onValueChange={onValueChange}>
					<Checkbox.Legend>Topics</Checkbox.Legend>
					<Checkbox.Item value="a">Alpha</Checkbox.Item>
					<Checkbox.Item value="b">Beta</Checkbox.Item>
				</Checkbox.Group>
				<button type="reset">Reset</button>
			</form>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await new Promise((r) => setTimeout(r, 20));
		expect(screen.getByRole("checkbox", { name: "Alpha" })).not.toBeChecked();
		expect(screen.getByRole("checkbox", { name: "Beta" })).toBeChecked();
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("does not restore when form reset is canceled", async () => {
		const onValueChange = vi.fn();
		render(
			<form
				onReset={(event) => {
					event.preventDefault();
				}}
			>
				<Checkbox.Group defaultValue={["a"]} onValueChange={onValueChange}>
					<Checkbox.Legend>Topics</Checkbox.Legend>
					<Checkbox.Item value="a">Alpha</Checkbox.Item>
					<Checkbox.Item value="b">Beta</Checkbox.Item>
				</Checkbox.Group>
				<button type="reset">Reset</button>
			</form>,
		);
		const alpha = screen.getByRole("checkbox", { name: "Alpha" });
		const beta = screen.getByRole("checkbox", { name: "Beta" });
		expect(alpha).toBeChecked();
		expect(beta).not.toBeChecked();
		fireEvent.click(beta);
		fireEvent.click(alpha);
		expect(alpha).not.toBeChecked();
		expect(beta).toBeChecked();
		const callCount = onValueChange.mock.calls.length;
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await new Promise((r) => setTimeout(r, 20));
		expect(alpha).not.toBeChecked();
		expect(beta).toBeChecked();
		expect(onValueChange.mock.calls.length).toBe(callCount);
	});

	it("clears grouped values on reset when defaultValue is omitted", async () => {
		render(
			<form>
				<Checkbox.Group>
					<Checkbox.Legend>Topics</Checkbox.Legend>
					<Checkbox.Item value="a">Alpha</Checkbox.Item>
				</Checkbox.Group>
				<button type="reset">Reset</button>
			</form>,
		);
		fireEvent.click(screen.getByRole("checkbox", { name: "Alpha" }));
		expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeChecked();
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await waitFor(() => {
			expect(screen.getByRole("checkbox", { name: "Alpha" })).not.toBeChecked();
		});
	});

	it("disables grouped items and keeps uncontrolled default values", () => {
		render(
			<Checkbox.Group defaultValue={["alpha"]} disabled>
				<Checkbox.Legend>Topics</Checkbox.Legend>
				<Checkbox.Item value="alpha">Alpha</Checkbox.Item>
				<Checkbox.Item value="beta">Beta</Checkbox.Item>
			</Checkbox.Group>,
		);
		expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeChecked();
		expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeDisabled();
		expect(screen.getByRole("checkbox", { name: "Beta" })).toBeDisabled();
	});

	it("accepts group, legend, and item props and rejects illegal values", () => {
		acceptCheckboxGroupProps({ value: ["a"] });
		acceptCheckboxGroupProps({
			defaultValue: ["a"],
			onValueChange: () => undefined,
			error: "Required",
			disabled: true,
			className: "extra",
			children: "x",
		});
		acceptCheckboxLegendProps({ children: "Topics", className: "legend" });
		acceptCheckboxItemProps({ value: "a" });
		acceptCheckboxItemProps({ value: "a", size: "sm", children: "Alpha" });
		// @ts-expect-error value must be a string array
		acceptCheckboxGroupProps({ value: "a" });
		// @ts-expect-error item value is required
		acceptCheckboxItemProps({});
		// @ts-expect-error item cannot take checked
		acceptCheckboxItemProps({ value: "a", checked: true });
	});

	it("forwards and cleans up external refs (object, callback, React 19 cleanup) on group", () => {
		// 1. Plain callback ref without cleanup
		const callbackEvents: string[] = [];
		const callbackRef = (node: HTMLFieldSetElement | null) => {
			callbackEvents.push(`call:${node ? node.tagName : "null"}`);
		};
		const { unmount } = render(
			<Checkbox.Group ref={callbackRef} aria-label="Plain Ref Group">
				<Checkbox.Item value="a">Alpha</Checkbox.Item>
			</Checkbox.Group>,
		);
		expect(callbackEvents).toEqual(["call:FIELDSET"]);
		unmount();
		expect(callbackEvents).toEqual(["call:FIELDSET", "call:null"]);

		// 2. React 19 callback ref with cleanup function
		let cleanupCalls = 0;
		let attachCalls = 0;
		const cleanupCallbackRef = (node: HTMLFieldSetElement | null) => {
			if (node) {
				attachCalls++;
				return () => {
					cleanupCalls++;
				};
			}
		};
		const { rerender: rerenderCleanup, unmount: unmountCleanup } = render(
			<Checkbox.Group ref={cleanupCallbackRef} aria-label="Cleanup Ref Group">
				<Checkbox.Item value="a">Alpha</Checkbox.Item>
			</Checkbox.Group>,
		);
		expect(attachCalls).toBe(1);
		expect(cleanupCalls).toBe(0);

		// Swapping callback ref executes cleanup and does not call with null
		let secondCleanupCalls = 0;
		const secondCleanupCallbackRef = (node: HTMLFieldSetElement | null) => {
			if (node) {
				return () => {
					secondCleanupCalls++;
				};
			}
		};
		rerenderCleanup(
			<Checkbox.Group ref={secondCleanupCallbackRef} aria-label="Cleanup Ref Group">
				<Checkbox.Item value="a">Alpha</Checkbox.Item>
			</Checkbox.Group>,
		);
		expect(cleanupCalls).toBe(1);
		expect(secondCleanupCalls).toBe(0);

		unmountCleanup();
		expect(secondCleanupCalls).toBe(1);

		// 3. Object ref clearing on unmount
		const objRef = createRef<HTMLFieldSetElement>();
		const { unmount: unmountObj } = render(
			<Checkbox.Group ref={objRef} aria-label="Object Ref Group">
				<Checkbox.Item value="a">Alpha</Checkbox.Item>
			</Checkbox.Group>,
		);
		expect(objRef.current?.tagName).toBe("FIELDSET");
		unmountObj();
		expect(objRef.current).toBeNull();
	});
});
