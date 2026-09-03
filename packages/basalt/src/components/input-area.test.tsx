import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { InputArea, type InputAreaProps } from "./input-area";

function acceptInputAreaProps(_props: InputAreaProps) {}

const SIZE_CLASS = {
	sm: ["min-h-[64px]", "px-2.5", "py-1.5", "text-xs"],
	default: ["min-h-[80px]", "px-3", "py-2", "text-sm"],
	lg: ["min-h-[96px]", "px-4", "py-2", "text-base"],
} as const;

describe("InputArea", () => {
	it("renders a textarea", () => {
		render(<InputArea aria-label="Notes" />);
		const area = screen.getByRole("textbox", { name: "Notes" });
		expect(area).toBeEnabled();
		expect(area).not.toHaveAttribute("rows");
		expect(area.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(area.className.split(/\s+/)).toEqual(
			expect.arrayContaining(["min-h-[80px]", "px-3", "py-2"]),
		);
		expect(area.className).toContain("bg-basalt-control");
	});

	it("can be disabled", () => {
		render(<InputArea aria-label="Notes" disabled />);
		expect(screen.getByRole("textbox", { name: "Notes" })).toBeDisabled();
	});

	it("applies named sizes and keeps the default class", () => {
		const { rerender } = render(<InputArea aria-label="Notes" />);
		expect(screen.getByRole("textbox", { name: "Notes" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.default]),
		);
		rerender(<InputArea aria-label="Notes" size="default" />);
		expect(screen.getByRole("textbox", { name: "Notes" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.default]),
		);
		rerender(<InputArea aria-label="Notes" size="sm" />);
		expect(screen.getByRole("textbox", { name: "Notes" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.sm]),
		);
		rerender(<InputArea aria-label="Notes" size="lg" />);
		expect(screen.getByRole("textbox", { name: "Notes" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.lg]),
		);
	});

	it("keeps a destructive invalid border that focus-visible cannot replace", () => {
		render(<InputArea aria-label="Notes" aria-invalid />);
		const area = screen.getByRole("textbox", { name: "Notes" });
		expect(area.className).toContain("aria-invalid:border-basalt-destructive");
		expect(area.className).toContain("aria-invalid:focus-visible:border-basalt-destructive");
		expect(area.className).toContain("focus-visible:border-basalt-ring");
	});

	it("adds password-manager markers only when requested and does not let callers override them", () => {
		const { rerender } = render(<InputArea aria-label="Notes" />);
		const unmarked = screen.getByRole("textbox", { name: "Notes" });
		expect(unmarked.className).not.toContain("keeper-ignore");
		expect(unmarked).not.toHaveAttribute("data-1p-ignore");
		expect(unmarked).not.toHaveAttribute("data-bwignore");
		expect(unmarked).not.toHaveAttribute("data-form-type");
		expect(unmarked).not.toHaveAttribute("data-lpignore");
		rerender(
			<InputArea
				aria-label="Notes"
				passwordManagerIgnore
				data-1p-ignore="false"
				data-bwignore="false"
				data-form-type="login"
				data-lpignore="false"
			/>,
		);
		const marked = screen.getByRole("textbox", { name: "Notes" });
		expect(marked.className).toContain("keeper-ignore");
		expect(marked).toHaveAttribute("data-1p-ignore", "true");
		expect(marked).toHaveAttribute("data-bwignore", "true");
		expect(marked).toHaveAttribute("data-form-type", "other");
		expect(marked).toHaveAttribute("data-lpignore", "true");
	});

	it("keeps a controlled value and reports change", () => {
		const onChange = vi.fn();
		render(<InputArea aria-label="Notes" value="Ada" onChange={onChange} />);
		const area = screen.getByRole("textbox", { name: "Notes" });
		expect(area).toHaveValue("Ada");
		fireEvent.change(area, { target: { value: "Grace" } });
		expect(area).toHaveValue("Ada");
		expect(onChange).toHaveBeenCalled();
	});

	it("edits an uncontrolled value and restores it on native form reset", () => {
		render(
			<form>
				<InputArea aria-label="Notes" name="notes" defaultValue="Ada" />
				<button type="reset">Reset</button>
			</form>,
		);
		const area = screen.getByRole("textbox", { name: "Notes" });
		expect(area).toHaveValue("Ada");
		fireEvent.change(area, { target: { value: "Grace" } });
		expect(area).toHaveValue("Grace");
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		expect(area).toHaveValue("Ada");
	});

	it("accepts numeric rows, size, passwordManagerIgnore, native attributes, and ref, and rejects illegal values", () => {
		acceptInputAreaProps({ rows: 6 });
		acceptInputAreaProps({ size: "sm" });
		acceptInputAreaProps({ size: "default" });
		acceptInputAreaProps({ size: "lg" });
		acceptInputAreaProps({ passwordManagerIgnore: true });
		acceptInputAreaProps({
			className: "extra",
			placeholder: "Write a note",
			disabled: true,
			"aria-label": "Notes",
			value: "x",
			onChange: () => undefined,
			ref: createRef<HTMLTextAreaElement>(),
		});
		acceptInputAreaProps({ defaultValue: "y" });
		// @ts-expect-error rows must be a number
		acceptInputAreaProps({ rows: "6" });
		// @ts-expect-error size must be sm, default, or lg
		acceptInputAreaProps({ size: "xl" });
	});

	it("forwards rows, native attributes, ref, className, and change", () => {
		const ref = createRef<HTMLTextAreaElement>();
		const onChange = vi.fn();
		render(
			<InputArea
				ref={ref}
				rows={6}
				className="extra"
				placeholder="Write a note"
				id="notes"
				name="notes"
				aria-label="Notes"
				defaultValue="hello"
				onChange={onChange}
			/>,
		);
		const area = screen.getByRole("textbox", { name: "Notes" });
		expect(area).toHaveAttribute("rows", "6");
		expect(area).toHaveAttribute("placeholder", "Write a note");
		expect(area).toHaveAttribute("id", "notes");
		expect(area).toHaveAttribute("name", "notes");
		expect(area).toHaveValue("hello");
		expect(area.className).toContain("extra");
		expect(area.className).toContain("bg-basalt-control");
		expect(ref.current).toBe(area);
		fireEvent.change(area, { target: { value: "updated" } });
		expect(onChange).toHaveBeenCalled();
	});
});
