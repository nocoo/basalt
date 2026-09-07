import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MultiSelect } from "./multi-select";

const options = [
	{ value: "a", label: "Atlas", description: "Research", leading: <span>A</span> },
	{ value: "locked", label: "Archive", disabled: true },
	{ value: "b", label: "Boreal" },
	{ value: "c", label: "Cedar" },
];
beforeAll(() => {
	HTMLElement.prototype.scrollIntoView = vi.fn();
});
async function open() {
	fireEvent.click(screen.getByRole("button", { name: "Models" }));
	return screen.findByRole("combobox");
}

describe("MultiSelect", () => {
	it("can delegate chip rendering to a FilterBar while preserving selection count and keyboard removal", () => {
		render(<MultiSelect label="Models" options={options} defaultValue={["a"]} showChips={false} />);
		expect(screen.queryByRole("button", { name: "Remove Atlas" })).not.toBeInTheDocument();
		const trigger = screen.getByRole("button", { name: "Models" });
		expect(trigger).toHaveAccessibleDescription("1 selected");
		fireEvent.keyDown(trigger, { key: "Backspace" });
		expect(trigger).toHaveAccessibleDescription("0 selected");
	});
	it("selects by search and keyboard, skips disabled options and writes repeated native entries", async () => {
		const change = vi.fn();
		const { container } = render(
			<form>
				<MultiSelect label="Models" name="models" options={options} onValueChange={change} />
			</form>,
		);
		expect(screen.getByText("Select options")).toBeInTheDocument();
		const input = await open();
		expect(input).toHaveFocus();
		expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(change).toHaveBeenLastCalledWith(["b"]);
		fireEvent.keyDown(input, { key: "ArrowUp" });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(change).toHaveBeenLastCalledWith(["b", "a"]);
		expect(
			new FormData(container.querySelector("form") as HTMLFormElement).getAll("models"),
		).toEqual(["b", "a"]);
		fireEvent.change(input, { target: { value: " RESEARCH " } });
		expect(screen.getAllByRole("option")).toHaveLength(1);
		fireEvent.keyDown(input, { key: "Enter" });
		expect(change).toHaveBeenLastCalledWith(["b"]);
		fireEvent.change(input, { target: { value: "no match" } });
		expect(screen.getByRole("status")).toHaveTextContent("No options found.");
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(change).toHaveBeenCalledTimes(3);
	});
	it("removes chips and the last removable selection without changing locked entries", async () => {
		const change = vi.fn();
		render(
			<MultiSelect
				label="Models"
				options={options}
				defaultValue={["a", "missing", "locked"]}
				onValueChange={change}
			/>,
		);
		expect(screen.getByRole("button", { name: "Remove Archive" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Remove Atlas" }));
		expect(change).toHaveBeenLastCalledWith(["missing", "locked"]);
		const trigger = screen.getByRole("button", { name: "Models" });
		fireEvent.keyDown(trigger, { key: "Backspace" });
		expect(change).toHaveBeenLastCalledWith(["locked"]);
		fireEvent.keyDown(trigger, { key: "Backspace" });
		expect(change).toHaveBeenCalledTimes(2);
		const input = await open();
		fireEvent.keyDown(input, { key: "Backspace" });
		fireEvent.change(input, { target: { value: "a" } });
		fireEvent.keyDown(input, { key: "Backspace" });
		fireEvent.keyDown(trigger, { key: "Backspace" });
		expect(change).toHaveBeenCalledTimes(2);
	});
	it("preserves controlled selection, query and open until the caller accepts requests", async () => {
		const value = vi.fn(),
			query = vi.fn(),
			visibility = vi.fn();
		const { rerender } = render(
			<MultiSelect
				label="Models"
				options={options}
				value={["a"]}
				query=""
				open={false}
				onValueChange={value}
				onQueryChange={query}
				onOpenChange={visibility}
			/>,
		);
		fireEvent.keyDown(screen.getByRole("button", { name: "Models" }), {
			key: "ArrowUp",
		});
		expect(visibility).toHaveBeenLastCalledWith(true);
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		rerender(
			<MultiSelect
				label="Models"
				options={options}
				value={["a"]}
				query=""
				open
				onValueChange={value}
				onQueryChange={query}
				onOpenChange={visibility}
			/>,
		);
		const input = await screen.findByRole("combobox");
		fireEvent.change(input, { target: { value: "ced" } });
		expect(query).toHaveBeenLastCalledWith("ced");
		expect(input).toHaveValue("");
		fireEvent.click(screen.getByRole("option", { name: "Cedar" }));
		expect(value).toHaveBeenLastCalledWith(["a", "c"]);
		expect(screen.getByRole("option", { name: "Cedar" })).toHaveAttribute("aria-selected", "false");
		fireEvent.keyDown(input, { key: "Escape" });
		expect(visibility).toHaveBeenLastCalledWith(false);
		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});
	it("supports asynchronous filtering, localized labels, loading and disabled transitions", async () => {
		const props = {
			label: "Models",
			options,
			defaultValue: ["c"],
			defaultQuery: "unmatched",
			defaultOpen: true,
			filterOptions: false,
			formatSelectionCount: (n: number) => `${n} chosen`,
		};
		const { rerender, container } = render(
			<MultiSelect {...props} loading loadingLabel="Finding models" name="models" />,
		);
		const input = await screen.findByRole("combobox");
		expect(screen.getByRole("status")).toHaveTextContent("Finding models");
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(input).not.toHaveAttribute("aria-activedescendant");
		rerender(<MultiSelect {...props} removeLabel="Delete" name="models" />);
		expect(screen.getAllByRole("option")).toHaveLength(4);
		expect(screen.getByRole("button", { name: "Delete Cedar" })).toBeEnabled();
		expect(screen.getByRole("group", { name: "Models: 1 chosen" })).toBeInTheDocument();
		rerender(<MultiSelect {...props} disabled name="models" />);
		expect(screen.getByRole("button", { name: "Models" })).toBeDisabled();
		expect(container.querySelector('input[name="models"]')).toBeNull();
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});
	it("keeps keyboard activity when a stationary pointer is over another option", async () => {
		render(<MultiSelect label="Models" options={options} defaultOpen />);
		const input = await screen.findByRole("combobox");
		const cedar = screen.getByRole("option", { name: "Cedar" });
		fireEvent.pointerMove(cedar, { clientX: 10, clientY: 10 });
		expect(fireEvent.mouseDown(cedar)).toBe(false);
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.pointerMove(cedar, { clientX: 10, clientY: 10 });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(screen.getByRole("button", { name: "Remove Atlas" })).toBeInTheDocument();
		fireEvent.keyDown(input, { key: "Backspace" });
		expect(screen.queryByRole("button", { name: "Remove Atlas" })).not.toBeInTheDocument();
	});
	it("does not submit IME keystrokes or allow disabled options to change selection", async () => {
		const change = vi.fn();
		render(
			<MultiSelect label="Models" options={[options[1]]} defaultOpen onValueChange={change} />,
		);
		const input = await screen.findByRole("combobox");
		fireEvent.keyDown(input, { key: "Enter", isComposing: true });
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.keyDown(input, { key: "ArrowUp" });
		fireEvent.click(screen.getByRole("option"));
		fireEvent.keyDown(screen.getByRole("button", { name: "Models" }), {
			key: "Backspace",
			isComposing: true,
		});
		expect(change).not.toHaveBeenCalled();
		expect(input).not.toHaveAttribute("aria-activedescendant");
	});
	it("uses current defaults on accepted reset and respects a cancelled reset after a parent render", async () => {
		function Form() {
			const [cancel, setCancel] = useState(true);
			const [count, setCount] = useState(0);
			return (
				<form
					aria-label="Owner"
					onReset={(event) => {
						if (cancel) event.preventDefault();
						setCount(count + 1);
					}}
				>
					<MultiSelect label="Models" name="models" options={options} defaultValue={["a"]} />
					<button type="button" onClick={() => setCancel(false)}>
						Accept resets
					</button>
				</form>
			);
		}
		render(<Form />);
		const input = await open();
		fireEvent.click(screen.getByRole("option", { name: "Cedar" }));
		fireEvent.change(input, { target: { value: "query" } });
		const form = screen.getByRole("form") as HTMLFormElement;
		act(() => form.reset());
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 10));
		});
		expect(new FormData(form).getAll("models")).toEqual(["a", "c"]);
		expect(input).toHaveValue("query");
		fireEvent.click(screen.getByRole("button", { name: "Accept resets" }));
		act(() => form.reset());
		await waitFor(() => expect(new FormData(form).getAll("models")).toEqual(["a"]));
		expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
	});
	it("rebinds external form ownership, retains controlled reset state and cleans queued work", async () => {
		const props = {
			label: "Models",
			options,
			name: "models",
			value: ["c"],
			query: "ced",
			open: true,
		};
		const { rerender, unmount } = render(
			<>
				<form id="first" aria-label="First" />
				<form id="second" aria-label="Second" />
				<MultiSelect {...props} form="first" />
			</>,
		);
		const first = screen.getByRole("form", { name: "First" }) as HTMLFormElement;
		const second = screen.getByRole("form", { name: "Second" }) as HTMLFormElement;
		expect(new FormData(first).getAll("models")).toEqual(["c"]);
		rerender(
			<>
				<form id="first" aria-label="First" />
				<form id="second" aria-label="Second" />
				<MultiSelect {...props} form="second" />
			</>,
		);
		act(() => {
			first.reset();
			second.reset();
		});
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 10));
		});
		expect(new FormData(first).getAll("models")).toEqual([]);
		expect(new FormData(second).getAll("models")).toEqual(["c"]);
		expect(screen.getByRole("combobox")).toHaveValue("ced");
		act(() => second.reset());
		unmount();
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 10));
		});
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});
});
