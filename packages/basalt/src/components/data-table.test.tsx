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

	it("sorts negative infinity before finite numbers", () => {
		render(
			<DataTable
				data={[
					{ name: "Fin", count: 2 },
					{ name: "Neg", count: Number.NEGATIVE_INFINITY },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[0].textContent).toBe("Neg");
	});

	it("sorts mixed declared sort values in a total order", () => {
		render(
			<DataTable
				data={[
					{ name: "Str", count: "11" as number | bigint | string },
					{ name: "Num", count: 2 },
					{ name: "Big", count: 10n },
					{ name: "NaN", count: Number.NaN },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{
						id: "count",
						header: "Count",
						accessor: (row) => String(row.count),
						sortValue: (row) => row.count,
					},
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		const names = screen
			.getAllByRole("cell")
			.filter((_, index) => index % 2 === 0)
			.map((cell) => cell.textContent);
		expect(names).toEqual(["Num", "Big", "NaN", "Str"]);
	});

	it("sorts numbers numerically without sortValue", () => {
		render(
			<DataTable
				data={[
					{ name: "Ten", count: 10 },
					{ name: "Two", count: 2 },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[1].textContent).toBe("2");
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

	it("filters formatted cells via sortValue", () => {
		render(
			<DataTable
				data={[
					{ name: "Active", count: 1 },
					{ name: "Idle", count: 2 },
				]}
				columns={[
					{
						id: "status",
						header: "Status",
						accessor: (row) => <span>{row.name}</span>,
						sortValue: (row) => row.name,
					},
				]}
				filter="active"
			/>,
		);
		expect(screen.getByText("Active")).toBeInTheDocument();
		expect(screen.queryByText("Idle")).not.toBeInTheDocument();
	});

	it("keeps duplicate row object occurrences distinct", () => {
		const row = { name: "Zed", count: 2 };
		render(<DataTable data={[row, row]} columns={columns} />);
		expect(screen.getAllByText("Zed")).toHaveLength(2);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByText("Zed")).toHaveLength(2);
	});

	it("uses stable row ids", () => {
		render(<DataTable data={rows} columns={columns} getRowId={(row) => row.name} />);
		expect(screen.getByText("Zed")).toBeInTheDocument();
	});

	it("does not collide on nullish row ids", () => {
		const withIds = [
			{ id: undefined as string | undefined, name: "A", count: 1 },
			{ id: null as string | null, name: "B", count: 2 },
		];
		render(
			<DataTable
				data={withIds}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Name/ }));
		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
	});

	it("sorts bigints beyond the safe integer range", () => {
		render(
			<DataTable
				data={[
					{ name: "High", count: 9007199254740993n },
					{ name: "Low", count: 9007199254740992n },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[0].textContent).toBe("Low");
		expect(screen.getAllByRole("cell")[1].textContent).toBe("9007199254740992");
	});

	it("inherits header text color on sort buttons", () => {
		render(<DataTable data={rows} columns={columns} />);
		expect(screen.getByRole("button", { name: /Name/ }).className).toContain("text-inherit");
	});

	it("sorts huge bigints ahead of fractional numbers numerically", () => {
		render(
			<DataTable
				data={[
					{ name: "Huge", count: 10n ** 400n },
					{ name: "Half", count: 2.5 },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[0].textContent).toBe("Half");
	});

	it("sorts mixed fractional numbers and bigints numerically", () => {
		render(
			<DataTable
				data={[
					{ name: "Ten", count: 10n },
					{ name: "Half", count: 2.5 },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[1].textContent).toBe("2.5");
	});

	it("sorts mixed number and bigint cells numerically", () => {
		render(
			<DataTable
				data={[
					{ name: "Ten", count: 10n },
					{ name: "Two", count: 2 },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[1].textContent).toBe("2");
	});

	it("sorts bigint cells numerically", () => {
		render(
			<DataTable
				data={[
					{ name: "Ten", count: 10n },
					{ name: "Two", count: 2n },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[1].textContent).toBe("2");
	});

	it("filters bigint cells", () => {
		render(
			<DataTable
				data={[
					{ name: "A", count: 10n },
					{ name: "B", count: 2n },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
				filter="10"
			/>,
		);
		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("10")).toBeInTheDocument();
		expect(screen.queryByText("B")).not.toBeInTheDocument();
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
