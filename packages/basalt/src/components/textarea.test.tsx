import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import { Textarea, type TextareaProps } from "./textarea";

function acceptTextareaProps(_props: TextareaProps) {}

const SIZE_CLASS = {
	sm: ["min-h-basalt-textarea-sm", "px-basalt-space-lg", "py-basalt-space-md", "text-basalt-md"],
	md: ["min-h-basalt-textarea", "px-basalt-control-x", "py-basalt-space-lg", "text-basalt-base"],
	lg: [
		"min-h-basalt-textarea-lg",
		"px-basalt-control-x-lg",
		"py-basalt-space-lg",
		"text-basalt-base",
	],
} as const;

describe("Textarea", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("renders a textarea with control surface styling", () => {
		render(<Textarea aria-label="Notes" />);
		const area = screen.getByRole("textbox", { name: "Notes" });
		expect(area).toBeEnabled();
		expect(area).toHaveAttribute("data-slot", "textarea");
		expect(area).not.toHaveAttribute("rows");
		expect(area).toHaveClass("resize-y");
		expect(area.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(area.className.split(/\s+/)).toEqual(
			expect.arrayContaining([
				"min-h-basalt-textarea",
				"px-basalt-control-x",
				"py-basalt-space-lg",
			]),
		);
		expect(area.className).toContain("bg-basalt-control");
	});

	it("can be disabled", () => {
		render(<Textarea aria-label="Notes" disabled />);
		expect(screen.getByRole("textbox", { name: "Notes" })).toBeDisabled();
	});

	it("applies named sizes and defaults to md", () => {
		const { rerender } = render(<Textarea aria-label="Notes" />);
		expect(screen.getByRole("textbox", { name: "Notes" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.md]),
		);
		rerender(<Textarea aria-label="Notes" size="md" />);
		expect(screen.getByRole("textbox", { name: "Notes" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.md]),
		);
		rerender(<Textarea aria-label="Notes" size="sm" />);
		expect(screen.getByRole("textbox", { name: "Notes" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.sm]),
		);
		rerender(<Textarea aria-label="Notes" size="lg" />);
		expect(screen.getByRole("textbox", { name: "Notes" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining([...SIZE_CLASS.lg]),
		);
	});

	it("auto-resizes to scrollHeight and clamps at maxRows when field-sizing is unsupported", () => {
		vi.stubGlobal("CSS", { supports: () => false });
		let currentScrollHeight = 64;
		vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get").mockImplementation(
			() => currentScrollHeight,
		);
		const { rerender } = render(<Textarea aria-label="Notes" autoResize defaultValue="Line 1" />);
		const area = screen.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
		expect(area).toHaveClass("resize-none");
		expect(area.style.height).toBe("64px");
		expect(area.style.overflowY).toBe("hidden");

		currentScrollHeight = 140;
		fireEvent.change(area, { target: { value: "Line 1\nLine 2\nLine 3\nLine 4" } });
		expect(area.style.height).toBe("140px");
		expect(area.style.overflowY).toBe("hidden");

		rerender(
			<Textarea aria-label="Notes" autoResize maxRows={3} value="Tall" onChange={() => {}} />,
		);
		expect(area.style.height).toBe("60px");
		expect(area.style.overflowY).toBe("auto");

		rerender(<Textarea aria-label="Notes" autoResize={false} value="Plain" onChange={() => {}} />);
		expect(area.style.height).toBe("");
		expect(area.style.overflowY).toBe("");
	});

	it("keeps a destructive invalid border that focus-visible cannot replace", () => {
		render(<Textarea aria-label="Notes" aria-invalid />);
		const area = screen.getByRole("textbox", { name: "Notes" });
		expect(area.className).toContain("aria-invalid:border-basalt-danger-solid");
		expect(area.className).toContain("aria-invalid:focus-visible:border-basalt-danger-solid");
		expect(area).toHaveClass("basalt-focus");
	});

	it("adds password-manager markers only when requested and does not let callers override them", () => {
		const { rerender } = render(<Textarea aria-label="Notes" />);
		const unmarked = screen.getByRole("textbox", { name: "Notes" });
		expect(unmarked.className).not.toContain("keeper-ignore");
		expect(unmarked).not.toHaveAttribute("data-1p-ignore");
		expect(unmarked).not.toHaveAttribute("data-bwignore");
		expect(unmarked).not.toHaveAttribute("data-form-type");
		expect(unmarked).not.toHaveAttribute("data-lpignore");
		rerender(
			<Textarea
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
		render(<Textarea aria-label="Notes" value="Ada" onChange={onChange} />);
		const area = screen.getByRole("textbox", { name: "Notes" });
		expect(area).toHaveValue("Ada");
		fireEvent.change(area, { target: { value: "Grace" } });
		expect(area).toHaveValue("Ada");
		expect(onChange).toHaveBeenCalled();
	});

	it("edits an uncontrolled value and restores it on native form reset", () => {
		render(
			<form>
				<Textarea aria-label="Notes" name="notes" defaultValue="Ada" />
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

	it("accepts numeric rows, size, autoResize, maxRows, passwordManagerIgnore, native attributes, and ref, and rejects illegal values", () => {
		acceptTextareaProps({ rows: 6 });
		acceptTextareaProps({ size: "sm" });
		acceptTextareaProps({ size: "md" });
		acceptTextareaProps({ size: "lg" });
		acceptTextareaProps({ autoResize: true, maxRows: 6 });
		acceptTextareaProps({ passwordManagerIgnore: true });
		acceptTextareaProps({
			className: "extra",
			placeholder: "Write a note",
			disabled: true,
			"aria-label": "Notes",
			value: "x",
			onChange: () => undefined,
			ref: createRef<HTMLTextAreaElement>(),
		});
		acceptTextareaProps({ defaultValue: "y" });
		// @ts-expect-error rows must be a number
		acceptTextareaProps({ rows: "6" });
		// @ts-expect-error size must be sm, md, or lg
		acceptTextareaProps({ size: "xl" });
	});

	it("forwards rows, native attributes, function and object ref, className, and change", () => {
		const ref = createRef<HTMLTextAreaElement>();
		const fnRef = vi.fn();
		const onChange = vi.fn();
		const { rerender } = render(
			<Textarea
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

		rerender(<Textarea ref={fnRef} aria-label="Notes" />);
		expect(fnRef).toHaveBeenCalledWith(area);
	});

	it("uses native field-sizing without scrollHeight reads when supported", () => {
		vi.stubGlobal("CSS", {
			supports: (property: string, value: string) =>
				property === "field-sizing" && value === "content",
		});
		const scrollSpy = vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get");
		render(
			<Textarea
				aria-label="Notes"
				autoResize
				maxRows={4}
				style={{ fontFamily: "inherit" }}
				defaultValue="Hello"
			/>,
		);
		const area = screen.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
		expect(area).toHaveClass("resize-none", "[field-sizing:content]");
		expect(area.style.maxBlockSize).toBe(
			"calc(4lh + 2 * var(--basalt-space-lg) + 2 * var(--basalt-border-width))",
		);
		expect(area.style.fontFamily).toBe("inherit");
		expect(area.style.height).toBe("");
		fireEvent.change(area, { target: { value: "Hello\nWorld" } });
		expect(scrollSpy).not.toHaveBeenCalled();
		expect(area.style.height).toBe("");
	});
});
