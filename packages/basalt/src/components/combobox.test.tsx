import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./combobox";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

describe("Combobox", () => {
	it("renders an input", () => {
		render(<Combobox items={["Apple", "Banana"]} placeholder="Search fruits" />);
		expect(screen.getByLabelText("Search fruits")).toBeInTheDocument();
	});

	it("commits a selection and closes the list", () => {
		const onValueChange = vi.fn();
		render(
			<Combobox
				items={["Apple", "Banana"]}
				placeholder="Search fruits"
				name="fruit"
				onValueChange={onValueChange}
			/>,
		);
		const input = screen.getByLabelText("Search fruits");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		expect(onValueChange).toHaveBeenCalledWith("Banana");
		expect(screen.queryByRole("button", { name: "Banana" })).not.toBeInTheDocument();
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("Banana");
	});

	it("supports a controlled value", () => {
		const { rerender } = render(<Combobox items={["Apple"]} value="Apple" placeholder="Fruit" />);
		expect(screen.getByLabelText("Fruit")).toHaveValue("Apple");
		rerender(<Combobox items={["Apple", "Pear"]} value="Pear" placeholder="Fruit" />);
		expect(screen.getByLabelText("Fruit")).toHaveValue("Pear");
	});

	it("keeps the controlled display if the parent ignores the selection", () => {
		render(<Combobox items={["Apple", "Banana"]} value="Apple" placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		expect(input).toHaveValue("Apple");
	});

	it("commits the highlighted option with Enter", () => {
		const onValueChange = vi.fn();
		render(
			<Combobox items={["Apple", "Banana"]} placeholder="Fruit" onValueChange={onValueChange} />,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).toHaveBeenCalledWith("Banana");
	});

	it("gives duplicate labels unique option ids", () => {
		render(<Combobox items={["New York", "New York"]} placeholder="City" />);
		fireEvent.change(screen.getByLabelText("City"), { target: { value: "New" } });
		const options = screen.getAllByRole("option", { name: "New York" });
		expect(options).toHaveLength(2);
		expect(options[0].id).not.toBe(options[1].id);
		expect(options[0].id).toMatch(/opt-0$/);
	});

	it("hides the list when nothing matches", () => {
		render(<Combobox items={["Apple"]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "zzz" } });
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
		expect(input).toHaveAttribute("aria-expanded", "false");
	});

	it("keeps focus on the input after selecting", () => {
		render(<Combobox items={["Apple"]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.mouseDown(screen.getByRole("option", { name: "Apple" }));
		fireEvent.click(screen.getByRole("option", { name: "Apple" }));
		expect(input).toHaveFocus();
	});

	it("restores defaultValue on form reset", async () => {
		render(
			<form>
				<Combobox
					items={["Apple", "Banana"]}
					defaultValue="Apple"
					placeholder="Fruit"
					name="fruit"
				/>
				<button type="reset">Reset</button>
			</form>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("Banana");
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await waitFor(() => {
			expect(screen.getByLabelText("Fruit")).toHaveValue("Apple");
		});
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("Apple");
	});

	it("does not restore when form reset is canceled", async () => {
		render(
			<form
				onReset={(event) => {
					event.preventDefault();
				}}
			>
				<Combobox
					items={["Apple", "Banana"]}
					defaultValue="Apple"
					placeholder="Fruit"
					name="fruit"
				/>
				<button type="reset">Reset</button>
			</form>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await waitFor(() => {
			expect(document.querySelector('input[name="fruit"]')).toHaveValue("Banana");
		});
	});

	it("stays closed after selecting a focused option", () => {
		render(<Combobox items={["Apple"]} placeholder="Fruit" />);
		fireEvent.focus(screen.getByLabelText("Fruit"));
		const option = screen.getByRole("option", { name: "Apple" });
		option.focus();
		fireEvent.click(option);
		expect(screen.getByLabelText("Fruit")).toHaveFocus();
		expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
	});

	it("ignores the process key", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={["Apple"]} placeholder="Fruit" onValueChange={onValueChange} />);
		fireEvent.focus(screen.getByLabelText("Fruit"));
		fireEvent.keyDown(screen.getByLabelText("Fruit"), { key: "Process" });
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("keeps highlight at zero when no options match", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={["Apple"]} placeholder="Fruit" onValueChange={onValueChange} />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "zzz" } });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowUp" });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("opens ArrowUp on the first option when closed", () => {
		render(<Combobox items={["Apple", "Banana"]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: "Escape" });
		fireEvent.keyDown(input, { key: "ArrowUp" });
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
	});

	it("opens ArrowDown on the first option when closed", () => {
		const onValueChange = vi.fn();
		render(
			<Combobox items={["Apple", "Banana"]} placeholder="Fruit" onValueChange={onValueChange} />,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: "Escape" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).toHaveBeenCalledWith("Apple");
	});

	it("highlights a controlled value that changes while open", () => {
		const onValueChange = vi.fn();
		const { rerender } = render(
			<Combobox
				items={["Pineapple", "Apple"]}
				value=""
				placeholder="Fruit"
				onValueChange={onValueChange}
			/>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		expect(screen.getByRole("option", { name: "Pineapple" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		rerender(
			<Combobox
				items={["Pineapple", "Apple"]}
				value="Apple"
				placeholder="Fruit"
				onValueChange={onValueChange}
			/>,
		);
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).toHaveBeenCalledWith("Apple");
	});

	it("keeps query edits focused on the first match", () => {
		const onValueChange = vi.fn();
		render(
			<Combobox
				items={["Apple", "Banana"]}
				defaultValue="Banana"
				placeholder="Fruit"
				onValueChange={onValueChange}
			/>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-selected", "true");
		fireEvent.change(input, { target: { value: "a" } });
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).toHaveBeenCalledWith("Apple");
	});

	it("highlights the selected option when opened", () => {
		const onValueChange = vi.fn();
		render(
			<Combobox
				items={["Pineapple", "Apple"]}
				defaultValue="Apple"
				placeholder="Fruit"
				onValueChange={onValueChange}
			/>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).not.toHaveBeenCalledWith("Pineapple");
		expect(input).toHaveValue("Apple");
	});

	it("syncs the query when a controlled value is cleared", () => {
		const { rerender } = render(
			<Combobox items={["Apple", "Banana"]} value="Apple" placeholder="Fruit" />,
		);
		expect(screen.getByLabelText("Fruit")).toHaveValue("Apple");
		rerender(<Combobox items={["Apple", "Banana"]} placeholder="Fruit" />);
		expect(screen.getByLabelText("Fruit")).toHaveValue("Apple");
	});

	it("keeps the submitted value when becoming uncontrolled", () => {
		const { rerender } = render(
			<form>
				<Combobox items={["Apple"]} value="Apple" name="fruit" placeholder="Fruit" />
			</form>,
		);
		rerender(
			<form>
				<Combobox items={["Apple"]} name="fruit" placeholder="Fruit" />
			</form>,
		);
		expect(screen.getByLabelText("Fruit")).toHaveValue("Apple");
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("Apple");
	});

	it("ignores keys during IME composition", () => {
		const onValueChange = vi.fn();
		render(
			<Combobox items={["Apple", "Banana"]} placeholder="Fruit" onValueChange={onValueChange} />,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: "Enter", isComposing: true });
		fireEvent.keyDown(input, { key: "ArrowDown", isComposing: true });
		expect(onValueChange).not.toHaveBeenCalled();
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
	});

	it("reopens on click while focused", () => {
		render(<Combobox items={["Apple"]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: "Escape" });
		expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
		fireEvent.click(input);
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
	});

	it("restores the query when focus leaves", () => {
		render(<Combobox items={["Apple", "Banana"]} placeholder="Fruit" defaultValue="Apple" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ban" } });
		fireEvent.focusOut(input, { relatedTarget: document.body });
		expect(input).toHaveValue("Apple");
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("closes on document Escape without committing", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={["Apple"]} placeholder="Fruit" onValueChange={onValueChange} />);
		fireEvent.focus(screen.getByLabelText("Fruit"));
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
		fireEvent.keyDown(document, { key: "Escape" });
		expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("resets the highlight when Escape restores the query", () => {
		render(<Combobox items={["Apple", "Apricot", "Banana"]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ap" } });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(screen.getByRole("option", { name: "Apricot" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		fireEvent.keyDown(input, { key: "Escape" });
		fireEvent.click(input);
		expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
	});

	it("keeps a parent dialog open on Escape while the list is open", () => {
		render(
			<Dialog open>
				<DialogContent>
					<DialogTitle>Pick</DialogTitle>
					<Combobox items={["Apple", "Banana"]} placeholder="Fruit" />
				</DialogContent>
			</Dialog>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
		fireEvent.keyDown(window, { key: "Escape" });
		expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
		expect(screen.getByRole("dialog", { name: "Pick" })).toBeInTheDocument();
	});

	it("does not close on composing Escape", () => {
		render(<Combobox items={["Apple"]} placeholder="Fruit" />);
		fireEvent.focus(screen.getByLabelText("Fruit"));
		fireEvent.keyDown(document, { key: "Escape", isComposing: true });
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
	});

	it("clamps the highlight when items shrink", () => {
		const { rerender } = render(<Combobox items={["A", "B", "C", "D", "E"]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(screen.getByRole("option", { name: "E" })).toHaveAttribute("aria-selected", "true");
		rerender(<Combobox items={["A", "B", "C"]} placeholder="Fruit" />);
		fireEvent.keyDown(input, { key: "ArrowUp" });
		expect(screen.getByRole("option", { name: "B" })).toHaveAttribute("aria-selected", "true");
	});

	it("marks the active duplicate option by index", () => {
		render(<Combobox items={["New York", "New York"]} placeholder="City" />);
		fireEvent.focus(screen.getByLabelText("City"));
		const options = screen.getAllByRole("option", { name: "New York" });
		expect(options[0]).toHaveAttribute("aria-selected", "true");
		expect(options[1]).toHaveAttribute("aria-selected", "false");
		expect(options[0]).toHaveAttribute("tabindex", "-1");
		fireEvent.keyDown(screen.getByLabelText("City"), { key: "ArrowDown" });
		const next = screen.getAllByRole("option", { name: "New York" });
		expect(next[0]).toHaveAttribute("aria-selected", "false");
		expect(next[1]).toHaveAttribute("aria-selected", "true");
	});
});
