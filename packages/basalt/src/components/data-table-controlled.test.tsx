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
			minWidth: "200px",
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

describe("record geometry", () => {
	it("keeps column widths, wrapping choices and scroll height under caller control", () => {
		render(
			<DataTable
				data={[{ id: "a", name: "A long company name", note: "Multiple words" }]}
				maxHeight={320}
				aria-label="Records"
				columns={[
					{ id: "name", header: "Company", width: 240, accessor: (row) => row.name },
					{ id: "note", header: "Note", wrap: true, accessor: (row) => row.note },
				]}
				defaultSelected={[]}
			/>,
		);
		expect(screen.getByRole("region", { name: "Records scroll area" })).toHaveClass(
			"focus-visible:-outline-offset-2",
		);
		expect(screen.getByRole("region", { name: "Records scroll area" })).toHaveStyle({
			maxHeight: "320px",
		});
		expect(screen.getByRole("columnheader", { name: "Company" })).toHaveStyle({
			minWidth: "240px",
		});
		expect(screen.getByRole("cell", { name: "A long company name" })).toHaveClass(
			"whitespace-nowrap",
		);
		expect(screen.getByRole("cell", { name: "Multiple words" })).toHaveClass("whitespace-normal");
		expect(screen.getByRole("checkbox", { name: "Select a" }).tagName).toBe("BUTTON");
	});
	it("uses one fixed-size, hidden-from-AT sort icon without changing header names", () => {
		render(
			<DataTable
				data={[{ name: "Zed" }, { name: "Amy" }]}
				columns={[{ id: "name", header: "Company", accessor: (row) => row.name }]}
			/>,
		);
		const button = screen.getByRole("button", { name: "Company" });
		expect(button.querySelectorAll("svg")).toHaveLength(1);
		expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
		fireEvent.click(button);
		expect(button.closest("th")).toHaveAttribute("aria-sort", "ascending");
		expect(button.textContent).toBe("Company");
		fireEvent.click(button);
		expect(button.closest("th")).toHaveAttribute("aria-sort", "descending");
	});
});

describe("column alignment", () => {
	it("aligns sortable numeric headers with values and preserves sort", () => {
		const onSortChange = vi.fn();
		render(
			<DataTable
				data={rows}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{
						id: "count",
						header: "Count",
						textAlign: "end",
						accessor: (row) => `$${row.count}`,
						sortValue: (row) => row.count,
					},
				]}
				onSortChange={onSortChange}
			/>,
		);
		const header = screen.getByRole("columnheader", { name: "Count" });
		const button = screen.getByRole("button", { name: "Count" });
		expect(header).toHaveClass("text-end", "tabular-nums");
		expect(button).toHaveClass("justify-end", "text-end", "p-0", "border-0");
		expect(button.firstElementChild?.tagName).toBe("svg");
		expect(button.querySelector("svg")).not.toHaveClass("ml-auto");
		expect(screen.getByRole("cell", { name: "$20" })).toHaveClass("text-end", "tabular-nums");
		fireEvent.click(button);
		expect(onSortChange).toHaveBeenCalledWith({ id: "count", dir: "asc" });
		expect(header).toHaveAttribute("aria-sort", "ascending");
		expect(names()).toEqual(["Birch", "Atlas"]);
	});

	it("does not force cell alignment when a column omits textAlign", () => {
		render(
			<DataTable
				data={rows}
				columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
			/>,
		);
		expect(screen.getByRole("cell", { name: "Atlas" }).className).not.toMatch(/\btext-start\b/);
		expect(screen.getByRole("columnheader", { name: "Name" })).toHaveClass("text-start");
	});

	it("aligns non-sortable headers without creating a sort control", () => {
		render(
			<DataTable
				data={rows}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{
						id: "count",
						header: "Total",
						textAlign: "end",
						sortable: false,
						accessor: (row) => row.count,
					},
				]}
			/>,
		);
		expect(screen.queryByRole("button", { name: "Total" })).not.toBeInTheDocument();
		expect(screen.getByText("Total").tagName).toBe("SPAN");
		expect(screen.getByRole("columnheader", { name: "Total" })).toHaveClass("text-end");
		expect(screen.getByText("Total")).toHaveClass("justify-end", "text-end");
	});

	it("stamps attached rails on display indices including numbers, select and state rows", () => {
		render(
			<DataTable
				data={rows}
				columns={columns}
				edge="attached"
				rowNumbers
				maxHeight={240}
				defaultSelected={[]}
				getRowId={(row) => row.id}
				aria-label="Aligned"
			/>,
		);
		expect(screen.getByRole("table")).not.toHaveAttribute("data-basalt-table-edge");
		const rowHead = screen.getByRole("columnheader", { name: "Row number" });
		const nameHead = screen.getByRole("columnheader", { name: "Name" });
		const countHead = screen.getByRole("columnheader", { name: "Count" });
		expect(rowHead).toHaveClass("ps-basalt-table-edge");
		expect(rowHead.className).not.toMatch(/\bpe-basalt-table-edge\b/);
		expect(nameHead.className).not.toMatch(/basalt-table-edge/);
		expect(countHead).toHaveClass("pe-basalt-table-edge");
		expect(countHead.className).not.toMatch(/\bps-basalt-table-edge\b/);
		expect(screen.getByRole("cell", { name: "1" })).toHaveClass("ps-basalt-table-edge");
		expect(screen.getByRole("cell", { name: "$20" })).toHaveClass("pe-basalt-table-edge");
		expect(screen.getByRole("region", { name: "Aligned scroll area" })).toHaveStyle({
			maxHeight: "240px",
		});
		expect(screen.getByRole("checkbox", { name: "Select a" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Select" }).className).not.toMatch(
			/basalt-table-edge/,
		);
	});

	it("applies both rails to attached full-row state cells", () => {
		render(<DataTable data={[]} columns={columns} edge="attached" empty="None" />);
		expect(screen.getByRole("cell", { name: "None" })).toHaveClass(
			"ps-basalt-table-edge",
			"pe-basalt-table-edge",
		);
		expect(screen.getByRole("columnheader", { name: "Name" })).toHaveClass("ps-basalt-table-edge");
		expect(screen.getByRole("columnheader", { name: "Count" })).toHaveClass("pe-basalt-table-edge");
	});

	it("insets attached pagination to the panel rail and keeps inset pagination compact", () => {
		const { rerender } = render(
			<DataTable data={rows} columns={columns} edge="attached" pageSize={1} />,
		);
		expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveClass(
			"px-basalt-panel-x",
			"pb-basalt-panel-y",
		);
		expect(screen.getByRole("button", { name: "Next page" })).toHaveClass("basalt-action-inset");
		rerender(<DataTable data={rows} columns={columns} pageSize={1} />);
		expect(screen.getByRole("navigation", { name: "Pagination" }).className).not.toMatch(
			/basalt-panel-x/,
		);
		expect(screen.getByRole("button", { name: "Next page" })).toHaveClass("basalt-action-inset");
	});
});

describe("row numbers", () => {
	it("numbers display order and continues through pagination without changing IDs", () => {
		render(
			<DataTable
				data={[
					{ id: "z", name: "Zed" },
					{ id: "a", name: "Amy" },
					{ id: "m", name: "Max" },
				]}
				columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
				rowNumbers
				pageSize={2}
				multiple
				defaultSelected={[]}
			/>,
		);
		expect(
			Array.from(document.querySelectorAll("[data-row-number]")).map((n) => n.textContent),
		).toEqual(["1", "2"]);
		fireEvent.click(screen.getByRole("button", { name: "Name" }));
		expect(
			screen.getByText("Amy").closest("tr")?.querySelector("[data-row-number]"),
		).toHaveTextContent("1");
		fireEvent.click(screen.getByRole("button", { name: "Next page" }));
		expect(
			screen.getByText("Zed").closest("tr")?.querySelector("[data-row-number]"),
		).toHaveTextContent("3");
		fireEvent.click(screen.getByRole("checkbox", { name: "Select z" }));
		expect(screen.getByText("Zed").closest("tr")).toHaveAttribute("aria-selected", "true");
	});
	it("numbers server pages and accounts for empty colspan", () => {
		const { rerender } = render(
			<DataTable
				data={[{ name: "Six" }]}
				columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
				rowNumbers
				manualPagination
				page={2}
				pageSize={5}
				total={9}
			/>,
		);
		expect(document.querySelector("[data-row-number]")).toHaveTextContent("6");
		rerender(
			<DataTable
				data={[]}
				columns={[{ id: "name", header: "Name", accessor: () => "" }]}
				rowNumbers
				defaultSelected={[]}
			/>,
		);
		expect(screen.getByText("No results").closest("td")).toHaveAttribute("colspan", "3");
	});
});
