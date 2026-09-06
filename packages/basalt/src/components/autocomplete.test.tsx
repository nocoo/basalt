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

	it("preserves controlled value and display on form reset without calling onValueChange", async () => {
		const onValueChange = vi.fn();
		render(
			<form>
				<Autocomplete
					items={[APPLE, BANANA]}
					value="apple"
					onValueChange={onValueChange}
					placeholder="Fruit"
					name="fruit"
				/>
				<button type="reset">Reset</button>
			</form>,
		);
		const input = screen.getByLabelText("Fruit");
		expect(input).toHaveValue("Apple");
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("apple");

		// User edits input draft to "Ba"
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Ba" } });
		expect(input).toHaveValue("Ba");

		// Reset form: input restores to controlled display "Apple", hidden input stays "apple", onValueChange not called
		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		await new Promise((r) => setTimeout(r, 20));
		expect(input).toHaveValue("Apple");
		expect(document.querySelector('input[name="fruit"]')).toHaveValue("apple");
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("commits matching freeform query on blur and does not trigger on IME composing escape", () => {
		const onValueChange = vi.fn();
		render(
			<Autocomplete items={[APPLE, BANANA]} onValueChange={onValueChange} placeholder="Fruit" />,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Banana" } });
		// Blur commits exact match
		fireEvent.blur(input);
		expect(onValueChange).toHaveBeenCalledWith("banana");

		// Keydown Escape while isComposing does not close list or cancel query
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "App" } });
		expect(input).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();

		fireEvent.keyDown(input, { key: "Escape", isComposing: true });
		expect(input).toHaveValue("App");
		expect(input).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByRole("option", { name: "Apple" })).toBeVisible();
	});

	it("ignores pointermove on options when pointer position has not changed", () => {
		const onValueChange = vi.fn();
		render(
			<Autocomplete items={[APPLE, BANANA]} placeholder="Fruit" onValueChange={onValueChange} />,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "a" } });
		const appleOption = screen.getByRole("option", { name: "Apple" });
		const bananaOption = screen.getByRole("option", { name: "Banana" });

		// 1. Move pointer over Apple at (100, 100) -> Apple selected
		fireEvent(
			appleOption,
			new MouseEvent("pointermove", { bubbles: true, clientX: 100, clientY: 100 }),
		);
		expect(appleOption).toHaveAttribute("aria-selected", "true");
		expect(bananaOption).toHaveAttribute("aria-selected", "false");

		// 2. Keyboard ArrowDown moves selection to Banana
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(appleOption).toHaveAttribute("aria-selected", "false");
		expect(bananaOption).toHaveAttribute("aria-selected", "true");

		// 3. Pointer move on Apple with identical position (100, 100) is ignored; Banana remains active
		fireEvent(
			appleOption,
			new MouseEvent("pointermove", { bubbles: true, clientX: 100, clientY: 100 }),
		);
		expect(appleOption).toHaveAttribute("aria-selected", "false");
		expect(bananaOption).toHaveAttribute("aria-selected", "true");

		// 4. Enter commits Banana
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).toHaveBeenCalledWith("banana");
	});

	it("supports keyboard navigation with empty filtered results", () => {
		render(<Autocomplete items={[APPLE]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "zzz" } });
		// When filtered is empty, ArrowDown and ArrowUp reset active to null without error
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(input).not.toHaveAttribute("aria-activedescendant");
		fireEvent.keyDown(input, { key: "ArrowUp" });
		expect(input).not.toHaveAttribute("aria-activedescendant");
	});

	it("commits freeform value matching item value on blur", () => {
		const onValueChange = vi.fn();
		render(
			<Autocomplete
				items={[{ value: "custom-val", label: "Custom Label" }]}
				placeholder="Fruit"
				onValueChange={onValueChange}
			/>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		// Type matching value instead of label
		fireEvent.change(input, { target: { value: "custom-val" } });
		fireEvent.blur(input);
		expect(onValueChange).toHaveBeenCalledWith("custom-val");
		expect(input).toHaveValue("Custom Label");
	});

	it("commits freeform non-matching text on Enter", () => {
		const onValueChange = vi.fn();
		render(<Autocomplete items={[APPLE]} placeholder="Fruit" onValueChange={onValueChange} />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "Dragonfruit" } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onValueChange).toHaveBeenCalledWith("Dragonfruit");
		expect(input).toHaveValue("Dragonfruit");
	});

	it("supports arrow navigation after changing the filter", () => {
		render(<Autocomplete items={[APPLE, BANANA]} placeholder="Fruit" />);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "a" } });
		expect(input).toHaveAttribute("aria-expanded", "true");
		// ArrowUp when active is null selects the last item
		fireEvent.keyDown(input, { key: "ArrowUp" });
		const bananaOption = screen.getByRole("option", { name: "Banana" });
		expect(bananaOption).toHaveAttribute("aria-selected", "true");

		// ArrowDown when active is null selects the first item
		fireEvent.change(input, { target: { value: "ap" } });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		const appleOption = screen.getByRole("option", { name: "Apple" });
		expect(appleOption).toHaveAttribute("aria-selected", "true");
	});

	it("supports aria-describedby and aria-busy when loading", () => {
		render(
			<Autocomplete items={[APPLE]} placeholder="Fruit" loading aria-describedby="fruit-desc" />,
		);
		const input = screen.getByLabelText("Fruit");
		expect(input).toHaveAttribute("aria-busy", "true");
		expect(input).toHaveAttribute("aria-describedby", "fruit-desc");
	});

	it("ignores clicks on disabled options", () => {
		const onValueChange = vi.fn();
		render(
			<Autocomplete
				items={[{ value: "apple", label: "Apple", disabled: true }]}
				placeholder="Fruit"
				onValueChange={onValueChange}
			/>,
		);
		const input = screen.getByLabelText("Fruit");
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "a" } });
		const option = screen.getByRole("option", { name: "Apple" });
		expect(option).toBeDisabled();
		fireEvent.pointerMove(option, { clientX: 50, clientY: 50 });
		expect(option).toHaveAttribute("aria-selected", "false");
		fireEvent.click(option);
		expect(onValueChange).not.toHaveBeenCalled();
	});
});
