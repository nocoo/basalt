import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Autocomplete, type AutocompleteProps } from "./autocomplete";

const APPLE = { value: "apple", label: "Apple" };
const BANANA = { value: "banana", label: "Banana" };

function acceptAutocompleteProps(_props: AutocompleteProps) {}

describe("Autocomplete", () => {
	it("renders an input", () => {
		render(<Autocomplete items={[APPLE]} placeholder="Search fruits" />);
		expect(screen.getByLabelText("Search fruits")).toBeInTheDocument();
	});

	it("hides options until the query is non-empty", () => {
		render(<Autocomplete items={[APPLE, BANANA]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		fireEvent.change(input, { target: { value: "a" } });
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
	});

	it("commits freeform text that is not in the list", () => {
		const onValueChange = vi.fn();
		render(
			<Autocomplete items={[APPLE, BANANA]} placeholder="Fruit" onValueChange={onValueChange} />,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "Kiwi" } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).toHaveBeenCalledWith("Kiwi");
		expect(input).toHaveValue("Kiwi");
	});

	it("commits freeform text on blur", () => {
		const onValueChange = vi.fn();
		render(<Autocomplete items={[APPLE]} placeholder="Fruit" onValueChange={onValueChange} />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "Mango" } });
		fireEvent.focusOut(input, { relatedTarget: document.body });
		expect(onValueChange).toHaveBeenCalledWith("Mango");
		expect(input).toHaveValue("Mango");
	});

	it("commits a matching suggestion by value", () => {
		const onValueChange = vi.fn();
		render(
			<Autocomplete items={[APPLE, BANANA]} placeholder="Fruit" onValueChange={onValueChange} />,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "Ba" } });
		fireEvent.click(screen.getByRole("option", { name: "Banana" }));
		expect(onValueChange).toHaveBeenCalledWith("banana");
		expect(input).toHaveValue("Banana");
	});

	it("accepts item objects and rejects string items", () => {
		acceptAutocompleteProps({ items: [APPLE], size: "lg", loading: false });
		// @ts-expect-error items must be objects with value and label
		acceptAutocompleteProps({ items: ["Apple"] });
	});
});
