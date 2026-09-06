import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

	it("commits freeform text on blur without restoring focus to input", () => {
		const onValueChange = vi.fn();
		render(
			<div>
				<Autocomplete items={[APPLE]} placeholder="Fruit" onValueChange={onValueChange} />
				<button type="button" id="next-btn">
					Next
				</button>
			</div>,
		);
		const input = screen.getByLabelText("Fruit");
		const nextBtn = screen.getByRole("button", { name: "Next" });
		fireEvent.change(input, { target: { value: "Mango" } });
		fireEvent.blur(input, { relatedTarget: nextBtn });
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith("Mango");
		expect(input).toHaveValue("Mango");
		expect(document.activeElement).not.toBe(input);
	});

	it("commits exact matching label on blur without restoring focus to input", () => {
		const onValueChange = vi.fn();
		render(
			<div>
				<Autocomplete items={[APPLE, BANANA]} placeholder="Fruit" onValueChange={onValueChange} />
				<button type="button" id="next-btn">
					Next
				</button>
			</div>,
		);
		const input = screen.getByLabelText("Fruit");
		const nextBtn = screen.getByRole("button", { name: "Next" });
		fireEvent.change(input, { target: { value: "Apple" } });
		fireEvent.blur(input, { relatedTarget: nextBtn });
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith("apple");
		expect(input).toHaveValue("Apple");
		expect(document.activeElement).not.toBe(input);
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

	it("commits a typed label as the matching item value", () => {
		const onValueChange = vi.fn();
		render(
			<Autocomplete items={[APPLE, BANANA]} placeholder="Fruit" onValueChange={onValueChange} />,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.change(input, { target: { value: "Apple" } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).toHaveBeenCalledWith("apple");
		expect(input).toHaveValue("Apple");
	});

	it("advertises list autocomplete", () => {
		render(<Autocomplete items={[APPLE]} placeholder="Fruit" />);
		expect(screen.getByLabelText("Fruit")).toHaveAttribute("aria-autocomplete", "list");
	});

	it("restores default value on native form reset", async () => {
		render(
			<form>
				<Autocomplete
					items={[APPLE, BANANA]}
					defaultValue="apple"
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
				<Autocomplete
					items={[APPLE, BANANA]}
					defaultValue="apple"
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
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("banana");
		expect(screen.getByLabelText("Fruit")).toHaveValue("Banana");
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await new Promise((r) => setTimeout(r, 20));
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("banana");
		expect(screen.getByLabelText("Fruit")).toHaveValue("Banana");
	});

	it("accepts item objects and rejects string items", () => {
		acceptAutocompleteProps({ items: [APPLE], size: "lg", loading: false });
		// @ts-expect-error items must be objects with value and label
		acceptAutocompleteProps({ items: ["Apple"] });
	});
});
