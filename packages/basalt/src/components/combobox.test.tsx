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
		fireEvent.click(screen.getByRole("button", { name: "Banana" }));
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
		fireEvent.click(screen.getByRole("button", { name: "Banana" }));
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

	it("hides the list when nothing matches", () => {
		render(<Combobox items={["Apple"]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "zzz" } });
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
	});
});
