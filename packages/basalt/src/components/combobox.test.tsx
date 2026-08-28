import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./combobox";

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

	it("closes on document Escape without committing", () => {
		const onValueChange = vi.fn();
		render(<Combobox items={["Apple"]} placeholder="Fruit" onValueChange={onValueChange} />);
		fireEvent.focus(screen.getByLabelText("Fruit"));
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
		fireEvent.keyDown(document, { key: "Escape" });
		expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument();
		expect(onValueChange).not.toHaveBeenCalled();
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
