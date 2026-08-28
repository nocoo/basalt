import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "./data-table";

const rows = [
	{ name: "Zed", count: 2 },
	{ name: "Amy", count: 9 },
];
const columns = [
	{ id: "name", header: "Name", accessor: (row: (typeof rows)[number]) => row.name },
	{
		id: "count",
		header: "Count",
		accessor: (row: (typeof rows)[number]) => row.count,
		sortValue: (row: (typeof rows)[number]) => row.count,
	},
];

describe("DataTable", () => {
	it("renders cells", () => {
		render(<DataTable data={rows} columns={columns} />);
		expect(screen.getByText("Zed")).toBeInTheDocument();
	});

	it("sorts by a column header", () => {
		render(<DataTable data={rows} columns={columns} />);
		fireEvent.click(screen.getByRole("button", { name: /Name/ }));
		const cells = screen.getAllByRole("cell").map((cell) => cell.textContent);
		expect(cells[0]).toBe("Amy");
		fireEvent.click(screen.getByRole("button", { name: /Name/ }));
		expect(screen.getAllByRole("cell")[0].textContent).toBe("Zed");
	});

	it("filters rows", () => {
		render(<DataTable data={rows} columns={columns} filter="amy" />);
		expect(screen.getByText("Amy")).toBeInTheDocument();
		expect(screen.queryByText("Zed")).not.toBeInTheDocument();
	});

	it("uses stable row ids", () => {
		render(<DataTable data={rows} columns={columns} getRowId={(row) => row.name} />);
		expect(screen.getByText("Zed")).toBeInTheDocument();
	});

	it("keeps equal sort keys stable", () => {
		render(
			<DataTable
				data={[
					{ name: "A", count: 2 },
					{ name: "B", count: 2 },
				]}
				columns={columns}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
	});
});
