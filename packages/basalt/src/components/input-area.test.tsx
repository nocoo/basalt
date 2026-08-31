import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { InputArea, type InputAreaProps } from "./input-area";

function acceptInputAreaProps(_props: InputAreaProps) {}

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
		expect(area.className).toContain("bg-basalt-secondary");
	});

	it("can be disabled", () => {
		render(<InputArea aria-label="Notes" disabled />);
		expect(screen.getByRole("textbox", { name: "Notes" })).toBeDisabled();
	});

	it("accepts numeric rows, native attributes, and ref, and rejects a string rows", () => {
		acceptInputAreaProps({ rows: 6 });
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
		expect(area.className).toContain("bg-basalt-secondary");
		expect(ref.current).toBe(area);
		fireEvent.change(area, { target: { value: "updated" } });
		expect(onChange).toHaveBeenCalled();
	});
});
