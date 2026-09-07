import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterBar, FilterChip } from "./filter-bar";

describe("FilterBar and FilterChip", () => {
	it("groups caller controls, renders chips and requests clearing only while active", () => {
		const clear = vi.fn(),
			remove = vi.fn();
		const { rerender } = render(
			<FilterBar
				label="Filters"
				active
				onClear={clear}
				chips={<FilterChip label="Status" value="Active" onRemove={remove} />}
			>
				<input aria-label="Search" />
			</FilterBar>,
		);
		expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Remove Status" }));
		fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
		expect(remove).toHaveBeenCalledOnce();
		expect(clear).toHaveBeenCalledOnce();
		rerender(
			<FilterBar label="Filters" onClear={clear}>
				<input aria-label="Search" />
			</FilterBar>,
		);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		rerender(
			<FilterBar label="Filters" active>
				<input aria-label="Search" />
			</FilterBar>,
		);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		rerender(
			<FilterBar label="Filters" active onClear={clear} clearLabel="Reset all">
				<input aria-label="Search" />
			</FilterBar>,
		);
		expect(screen.getByRole("button", { name: "Reset all" })).toBeInTheDocument();
	});
	it("gives chip actions a custom name and enforces disabled removal", () => {
		const remove = vi.fn();
		render(
			<FilterChip
				label="Folder"
				value={<strong>Archive</strong>}
				removeLabel="Remove archive filter"
				disabled
				onRemove={remove}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Remove archive filter" }));
		expect(remove).not.toHaveBeenCalled();
		expect(screen.getByText("Archive")).toBeInTheDocument();
	});
});
