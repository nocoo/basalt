import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./data-table";

const rows = [
	{ id: "a", name: "Atlas", count: 20 },
	{ id: "b", name: "Birch", count: 5 },
];
const columns: DataTableColumn<(typeof rows)[number]>[] = [
	{ id: "name", header: "Name", accessor: (row) => row.name },
	{
		id: "count",
		header: "Count",
		accessor: (row) => `$${row.count}`,
		sortValue: (row) => row.count,
	},
];
const names = () =>
	screen
		.getAllByRole("row")
		.slice(1)
		.map((row) => within(row).getAllByRole("cell")[0]?.textContent);

describe("DataTable controlled and server state", () => {
	it("reports a controlled sort without reordering until accepted and supports null", () => {
		const onSortChange = vi.fn();
		const { rerender } = render(
			<DataTable data={rows} columns={columns} sort={null} onSortChange={onSortChange} />,
		);
		fireEvent.click(screen.getByRole("button", { name: "Count" }));
		expect(onSortChange).toHaveBeenLastCalledWith({ id: "count", dir: "asc" });
		expect(names()).toEqual(["Atlas", "Birch"]);
		rerender(
			<DataTable
				data={rows}
				columns={columns}
				sort={{ id: "count", dir: "asc" }}
				onSortChange={onSortChange}
			/>,
		);
		expect(names()).toEqual(["Birch", "Atlas"]);
		fireEvent.click(screen.getByRole("button", { name: "Count" }));
		expect(onSortChange).toHaveBeenLastCalledWith({ id: "count", dir: "desc" });
	});
	it("shows an entire returned server page and leaves filtering/sorting to the caller", () => {
		const onSortChange = vi.fn();
		render(
			<DataTable
				data={rows}
				columns={columns}
				manualPagination
				manualSorting
				manualFiltering
				filter="absent"
				page={2}
				pageSize={2}
				total={5}
				defaultSort={{ id: "count", dir: "asc" }}
				onSortChange={onSortChange}
			/>,
		);
		expect(names()).toEqual(["Atlas", "Birch"]);
		fireEvent.click(screen.getByRole("button", { name: "Count" }));
		expect(onSortChange).toHaveBeenCalledWith({ id: "count", dir: "desc" });
		expect(names()).toEqual(["Atlas", "Birch"]);
	});
	it("preserves stable selections across server page replacement", () => {
		const onSelectedChange = vi.fn();
		const props = {
			columns,
			manualPagination: true,
			pageSize: 2,
			total: 4,
			multiple: true,
			defaultSelected: [],
			onSelectedChange,
		};
		const { rerender } = render(<DataTable {...props} data={rows} page={1} />);
		fireEvent.click(screen.getByRole("checkbox", { name: "Select a" }));
		rerender(<DataTable {...props} data={[{ id: "c", name: "Cedar", count: 8 }]} page={2} />);
		fireEvent.click(screen.getByRole("checkbox", { name: "Select c" }));
		expect(onSelectedChange).toHaveBeenLastCalledWith(["a", "c"]);
		rerender(<DataTable {...props} data={rows} page={1} />);
		expect(screen.getByRole("checkbox", { name: "Select a" })).toBeChecked();
	});
	it("corrects an out-of-range page once, including when a controlled caller refuses", () => {
		const onPageChange = vi.fn();
		const { rerender } = render(
			<DataTable
				data={rows}
				columns={columns}
				page={3}
				pageSize={2}
				manualPagination
				total={5}
				onPageChange={onPageChange}
			/>,
		);
		rerender(
			<DataTable
				data={rows}
				columns={columns}
				page={3}
				pageSize={2}
				manualPagination
				total={2}
				onPageChange={onPageChange}
			/>,
		);
		expect(onPageChange).toHaveBeenCalledExactlyOnceWith(1);
		rerender(
			<DataTable
				data={[...rows]}
				columns={[...columns]}
				page={3}
				pageSize={2}
				manualPagination
				total={2}
				onPageChange={(next) => onPageChange(next)}
			/>,
		);
		expect(onPageChange).toHaveBeenCalledTimes(1);
	});
	it("defers page correction until loading finishes and corrects uncontrolled pages", () => {
		const onPageChange = vi.fn();
		const { rerender } = render(
			<DataTable
				data={rows}
				columns={columns}
				defaultPage={2}
				pageSize={1}
				onPageChange={onPageChange}
			/>,
		);
		rerender(
			<DataTable
				data={[]}
				columns={columns}
				defaultPage={2}
				pageSize={1}
				loading
				onPageChange={onPageChange}
			/>,
		);
		expect(onPageChange).not.toHaveBeenCalled();
		rerender(
			<DataTable
				data={[]}
				columns={columns}
				defaultPage={2}
				pageSize={1}
				onPageChange={onPageChange}
			/>,
		);
		expect(onPageChange).toHaveBeenCalledExactlyOnceWith(1);
	});
	it("renders named rich headers, unsortable actions, column geometry and error recovery", () => {
		const retry = vi.fn();
		const rich: DataTableColumn<(typeof rows)[number]>[] = [
			{
				id: "name",
				header: "Name",
				accessor: (row) => row.name,
				headerContent: <span>Workspace name</span>,
				width: 200,
				headerClassName: "heading",
				cellClassName: "numeric",
			},
			{ id: "action", header: "Actions", sortable: false, accessor: () => "Inspect" },
		];
		const { rerender } = render(
			<DataTable data={rows} columns={rich} aria-label="Workspaces" aria-describedby="summary" />,
		);
		expect(screen.getByRole("button", { name: "Name" })).toHaveTextContent("Workspace name");
		expect(screen.queryByRole("button", { name: "Actions" })).not.toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Workspace name" })).toHaveStyle({
			width: "200px",
		});
		expect(screen.getByText("Atlas").closest("td")).toHaveClass("numeric");
		expect(screen.getByRole("table", { name: "Workspaces" })).toHaveAttribute(
			"aria-describedby",
			"summary",
		);
		rerender(
			<DataTable
				data={rows}
				columns={columns}
				error="Network unavailable"
				onRetry={retry}
				retryLabel="Reconnect"
			/>,
		);
		expect(screen.queryByText("Atlas")).not.toBeInTheDocument();
		fireEvent.click(within(screen.getByRole("alert")).getByRole("button", { name: "Reconnect" }));
		expect(retry).toHaveBeenCalledOnce();
		rerender(<DataTable data={rows} columns={columns} error={0} />);
		expect(screen.getByRole("alert")).toHaveTextContent("0");
		rerender(<DataTable data={rows} columns={columns} error={false} />);
		expect(screen.getByText("Atlas")).toBeVisible();
	});
});
