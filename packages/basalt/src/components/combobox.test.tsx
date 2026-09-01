import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxProps } from "./combobox";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

const APPLE = { value: "apple", label: "Apple" };
const BANANA = { value: "banana", label: "Banana" };
const APRICOT = { value: "apricot", label: "Apricot" };
const PEAR = { value: "pear", label: "Pear" };
const FRUITS = [APPLE, BANANA];

function acceptComboboxProps(_props: ComboboxProps) {}

function typeQuery(name: string, query: string) {
	const input = screen.getByLabelText(name);
	fireEvent.focus(input);
	fireEvent.change(input, { target: { value: query } });
	return input;
}

describe("Combobox", () => {
	it("renders an input", () => {
		render(<Combobox items={FRUITS} placeholder="Search fruits" />);
		expect(screen.getByLabelText("Search fruits")).toBeInTheDocument();
	});

	it("shows all options on focus before a query is typed", () => {
		render(<Combobox items={FRUITS} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		fireEvent.focus(input);
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
	});

	it("opens the list below the field with inset highlight", () => {
		render(<Combobox items={FRUITS} placeholder="Fruit" />);
		typeQuery("Fruit", "a");
		const list = screen.getByRole("listbox");
		expect(list.className).toContain("top-full");
		expect(list.className).toContain("mt-1");
		expect(list.className).toContain("py-1.5");
		expect(screen.getByRole("option", { name: "Apple" }).className).toContain("mx-1.5");
	});

	it("does not highlight an option until hover or arrow keys", () => {
		render(<Combobox items={FRUITS} placeholder="Fruit" />);
		typeQuery("Fruit", "a");
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "false");
		expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute(
			"aria-selected",
			"false",
		);
		fireEvent.mouseEnter(screen.getByRole("option", { name: "Banana" }));
		expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-selected", "true");
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "false");
	});

	it("commits a selection and closes the list", () => {
		const onValueChange = vi.fn();
		render(
			<Combobox
				items={FRUITS}
				placeholder="Search fruits"
				name="fruit"
				onValueChange={onValueChange}
			/>,
		);
		const input = screen.getByLabelText("Search fruits");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		expect(onValueChange).toHaveBeenCalledWith("banana");
		expect(input).toHaveValue("Banana");
		expect(screen.queryByRole("button", { name: "Banana" })).not.toBeInTheDocument();
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("banana");
	});

	it("supports a controlled value", () => {
		const { rerender } = render(<Combobox items={[APPLE]} value="apple" placeholder="Fruit" />);
		expect(screen.getByLabelText("Fruit")).toHaveValue("Apple");
		rerender(<Combobox items={[APPLE, PEAR]} value="pear" placeholder="Fruit" />);
		expect(screen.getByLabelText("Fruit")).toHaveValue("Pear");
	});

	it("keeps the controlled display if the parent ignores the selection", () => {
		render(<Combobox items={FRUITS} value="apple" placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		expect(input).toHaveValue("Apple");
	});

	it("commits the highlighted option with Enter", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={FRUITS} placeholder="Fruit" onValueChange={onValueChange} />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).toHaveBeenCalledWith("banana");
	});

	it("gives duplicate labels unique option ids", () => {
		render(
			<Combobox
				items={[
					{ value: "ny-1", label: "New York" },
					{ value: "ny-2", label: "New York" },
				]}
				placeholder="City"
			/>,
		);
		fireEvent.change(screen.getByLabelText("City"), { target: { value: "New" } });
		const options = screen.getAllByRole("option", { name: "New York" });
		expect(options).toHaveLength(2);
		expect(options[0].id).not.toBe(options[1].id);
		expect(options[0].id).toMatch(/opt-0$/);
	});

	it("hides the list when nothing matches", () => {
		render(<Combobox items={[APPLE]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "zzz" } });
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
		expect(input).toHaveAttribute("aria-expanded", "false");
	});

	it("keeps focus on the input after selecting", () => {
		render(<Combobox items={[APPLE]} placeholder="Fruit" />);
		const input = typeQuery("Fruit", "A");
		fireEvent.mouseDown(screen.getByRole("option", { name: "Apple" }));
		fireEvent.click(screen.getByRole("option", { name: "Apple" }));
		expect(input).toHaveFocus();
	});

	it("restores defaultValue on form reset", async () => {
		render(
			<form>
				<Combobox items={FRUITS} defaultValue="apple" placeholder="Fruit" name="fruit" />
				<button type="reset">Reset</button>
			</form>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("banana");
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await waitFor(() => {
			expect(screen.getByLabelText("Fruit")).toHaveValue("Apple");
		});
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("apple");
	});

	it("does not restore when form reset is canceled", async () => {
		render(
			<form
				onReset={(event) => {
					event.preventDefault();
				}}
			>
				<Combobox items={FRUITS} defaultValue="apple" placeholder="Fruit" name="fruit" />
				<button type="reset">Reset</button>
			</form>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await waitFor(() => {
			expect(document.querySelector('input[name="fruit"]')).toHaveValue("banana");
		});
	});

	it("stays closed after selecting a focused option", () => {
		render(<Combobox items={[APPLE]} placeholder="Fruit" />);
		typeQuery("Fruit", "A");
		const option = screen.getByRole("option", { name: "Apple" });
		option.focus();
		fireEvent.click(option);
		expect(screen.getByLabelText("Fruit")).toHaveFocus();
		expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
	});

	it("ignores the process key", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={[APPLE]} placeholder="Fruit" onValueChange={onValueChange} />);
		fireEvent.focus(screen.getByLabelText("Fruit"));
		fireEvent.keyDown(screen.getByLabelText("Fruit"), { key: "Process" });
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("keeps highlight at zero when no options match", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={[APPLE]} placeholder="Fruit" onValueChange={onValueChange} />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "zzz" } });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowUp" });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("opens ArrowUp on the last option when closed", () => {
		render(<Combobox items={[APPLE, APRICOT]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: "Escape" });
		fireEvent.keyDown(input, { key: "ArrowUp" });
		expect(screen.getByRole("option", { name: "Apricot" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
	});

	it("opens ArrowDown on the first option when closed", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={[APPLE, APRICOT]} placeholder="Fruit" onValueChange={onValueChange} />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: "Escape" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).toHaveBeenCalledWith("apple");
	});

	it("does not move highlight when a controlled value changes while open", () => {
		const onValueChange = vi.fn();
		const { rerender } = render(
			<Combobox
				items={[{ value: "pineapple", label: "Pineapple" }, APPLE]}
				value=""
				placeholder="Fruit"
				onValueChange={onValueChange}
			/>,
		);
		const input = typeQuery("Fruit", "p");
		expect(screen.getByRole("option", { name: "Pineapple" })).toHaveAttribute(
			"aria-selected",
			"false",
		);
		rerender(
			<Combobox
				items={[{ value: "pineapple", label: "Pineapple" }, APPLE]}
				value="apple"
				placeholder="Fruit"
				onValueChange={onValueChange}
			/>,
		);
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "false");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("clears highlight when the query changes", () => {
		const onValueChange = vi.fn();
		render(
			<Combobox
				items={FRUITS}
				defaultValue="banana"
				placeholder="Fruit"
				onValueChange={onValueChange}
			/>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.mouseEnter(screen.getByRole("option", { name: "Banana" }));
		expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-selected", "true");
		fireEvent.change(input, { target: { value: "a" } });
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "false");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("does not commit on Enter until an option is highlighted", () => {
		const onValueChange = vi.fn();
		render(
			<Combobox
				items={[{ value: "pineapple", label: "Pineapple" }, APPLE]}
				defaultValue="apple"
				placeholder="Fruit"
				onValueChange={onValueChange}
			/>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "false");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).not.toHaveBeenCalled();
		expect(input).toHaveValue("Apple");
	});

	it("does not commit a typed query that is not in the list", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={FRUITS} placeholder="Fruit" onValueChange={onValueChange} />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "Kiwi" } });
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.focusOut(input, { relatedTarget: document.body });
		expect(onValueChange).not.toHaveBeenCalled();
		expect(input).toHaveValue("");
	});

	it("keeps a disabled item from becoming the value", () => {
		render(
			<Combobox
				items={[APPLE, { value: "banana", label: "Banana", disabled: true }]}
				placeholder="Fruit"
			/>,
		);
		fireEvent.focus(screen.getByLabelText("Fruit"));
		const banana = screen.getByRole("option", { name: "Banana" });
		expect(banana).toBeDisabled();
		fireEvent.click(banana);
		expect(screen.getByLabelText("Fruit")).toHaveValue("");
	});

	it("applies named sizes and loading", () => {
		const { rerender } = render(<Combobox items={FRUITS} placeholder="Fruit" />);
		expect(screen.getByLabelText("Fruit").className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-9", "px-3"]),
		);
		rerender(<Combobox items={FRUITS} placeholder="Fruit" size="sm" />);
		expect(screen.getByLabelText("Fruit").className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-8", "px-2.5"]),
		);
		rerender(<Combobox items={FRUITS} placeholder="Fruit" loading />);
		expect(screen.getByLabelText("Fruit")).toBeDisabled();
		expect(screen.getByLabelText("Fruit")).toHaveAttribute("aria-busy", "true");
	});

	it("accepts item objects, size, and loading, and rejects string items", () => {
		acceptComboboxProps({ items: FRUITS, size: "sm", loading: true, disabled: true });
		acceptComboboxProps({ items: FRUITS, value: "apple", onValueChange: () => undefined });
		// @ts-expect-error items must be objects with value and label
		acceptComboboxProps({ items: ["Apple"] });
		// @ts-expect-error size must be sm, default, or lg
		acceptComboboxProps({ items: FRUITS, size: "xl" });
	});

	it("syncs the query when a controlled value is cleared", () => {
		const { rerender } = render(<Combobox items={FRUITS} value="apple" placeholder="Fruit" />);
		expect(screen.getByLabelText("Fruit")).toHaveValue("Apple");
		rerender(<Combobox items={FRUITS} placeholder="Fruit" />);
		expect(screen.getByLabelText("Fruit")).toHaveValue("Apple");
	});

	it("keeps the submitted value when becoming uncontrolled", () => {
		const { rerender } = render(
			<form>
				<Combobox items={[APPLE]} value="apple" name="fruit" placeholder="Fruit" />
			</form>,
		);
		rerender(
			<form>
				<Combobox items={[APPLE]} name="fruit" placeholder="Fruit" />
			</form>,
		);
		expect(screen.getByLabelText("Fruit")).toHaveValue("Apple");
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("apple");
	});

	it("ignores keys during IME composition", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={FRUITS} placeholder="Fruit" onValueChange={onValueChange} />);
		const input = typeQuery("Fruit", "a");
		fireEvent.keyDown(input, { key: "Enter", isComposing: true });
		fireEvent.keyDown(input, { key: "ArrowDown", isComposing: true });
		expect(onValueChange).not.toHaveBeenCalled();
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "false");
	});

	it("reopens on click while focused", () => {
		render(<Combobox items={[APPLE]} defaultValue="apple" placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: "Escape" });
		expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
		fireEvent.click(input);
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
	});

	it("restores the query when focus leaves", () => {
		render(<Combobox items={FRUITS} placeholder="Fruit" defaultValue="apple" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ban" } });
		fireEvent.focusOut(input, { relatedTarget: document.body });
		expect(input).toHaveValue("Apple");
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("closes on document Escape without committing", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={[APPLE]} placeholder="Fruit" onValueChange={onValueChange} />);
		typeQuery("Fruit", "A");
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
		fireEvent.keyDown(document, { key: "Escape" });
		expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("resets the highlight when Escape restores the query", () => {
		render(<Combobox items={[APPLE, APRICOT, BANANA]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ap" } });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(screen.getByRole("option", { name: "Apricot" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		fireEvent.keyDown(input, { key: "Escape" });
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		expect(input).toHaveValue("");
	});

	it("keeps a parent dialog open on Escape while the list is open", () => {
		render(
			<Dialog open>
				<DialogContent>
					<DialogTitle>Pick</DialogTitle>
					<Combobox items={FRUITS} placeholder="Fruit" />
				</DialogContent>
			</Dialog>,
		);
		typeQuery("Fruit", "a");
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
		fireEvent.keyDown(window, { key: "Escape" });
		expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
		expect(screen.getByRole("dialog", { name: "Pick" })).toBeInTheDocument();
	});

	it("does not close on composing Escape", () => {
		render(<Combobox items={[APPLE]} placeholder="Fruit" />);
		typeQuery("Fruit", "A");
		fireEvent.keyDown(document, { key: "Escape", isComposing: true });
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
	});

	it("clamps the highlight when items shrink", () => {
		const { rerender } = render(
			<Combobox
				items={[
					{ value: "a1", label: "A1" },
					{ value: "a2", label: "A2" },
					{ value: "a3", label: "A3" },
					{ value: "a4", label: "A4" },
					{ value: "a5", label: "A5" },
				]}
				placeholder="Fruit"
			/>,
		);
		const input = typeQuery("Fruit", "A");
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(screen.getByRole("option", { name: "A5" })).toHaveAttribute("aria-selected", "true");
		rerender(
			<Combobox
				items={[
					{ value: "a1", label: "A1" },
					{ value: "a2", label: "A2" },
					{ value: "a3", label: "A3" },
				]}
				placeholder="Fruit"
			/>,
		);
		fireEvent.keyDown(input, { key: "ArrowUp" });
		expect(screen.getByRole("option", { name: "A2" })).toHaveAttribute("aria-selected", "true");
	});

	it("marks the active duplicate option by index", () => {
		render(
			<Combobox
				items={[
					{ value: "ny-1", label: "New York" },
					{ value: "ny-2", label: "New York" },
				]}
				placeholder="City"
			/>,
		);
		typeQuery("City", "New");
		const options = screen.getAllByRole("option", { name: "New York" });
		expect(options[0]).toHaveAttribute("aria-selected", "false");
		expect(options[1]).toHaveAttribute("aria-selected", "false");
		expect(options[0]).toHaveAttribute("tabindex", "-1");
		fireEvent.keyDown(screen.getByLabelText("City"), { key: "ArrowDown" });
		const highlighted = screen.getAllByRole("option", { name: "New York" });
		expect(highlighted[0]).toHaveAttribute("aria-selected", "true");
		expect(highlighted[1]).toHaveAttribute("aria-selected", "false");
		fireEvent.keyDown(screen.getByLabelText("City"), { key: "ArrowDown" });
		const next = screen.getAllByRole("option", { name: "New York" });
		expect(next[0]).toHaveAttribute("aria-selected", "false");
		expect(next[1]).toHaveAttribute("aria-selected", "true");
	});
});
