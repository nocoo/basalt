import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
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

	it("sorts positive infinity after finite numbers", () => {
		render(
			<DataTable
				data={[
					{ name: "Pos", count: Number.POSITIVE_INFINITY },
					{ name: "Fin", count: 2 },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[0].textContent).toBe("Fin");
	});

	it("sorts a fractional number against a smaller bigint", () => {
		render(
			<DataTable
				data={[
					{ name: "Big", count: 2n },
					{ name: "Frac", count: 10.5 },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[0].textContent).toBe("Big");
	});

	it("sorts fractional numbers against each other", () => {
		render(
			<DataTable
				data={[
					{ name: "High", count: 10.5 },
					{ name: "Low", count: 2.5 },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[0].textContent).toBe("Low");
	});

	it("sorts object cells as strings", () => {
		render(
			<DataTable
				data={[{ name: "B" }, { name: "A" }]}
				columns={[
					{
						id: "name",
						header: "Name",
						accessor: (row) => row.name,
						sortValue: (row) => ({ label: row.name }) as unknown as string,
					},
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Name" }));
		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
	});

	it("sorts equal integer numbers and bigints together", () => {
		render(
			<DataTable
				data={[
					{ name: "Num", count: 2 },
					{ name: "Big", count: 2n },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getByText("Num")).toBeInTheDocument();
		expect(screen.getByText("Big")).toBeInTheDocument();
	});

	it("ignores a sort column that no longer exists", () => {
		const { rerender } = render(<DataTable data={rows} columns={columns} />);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		rerender(
			<DataTable
				data={rows}
				columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
			/>,
		);
		expect(screen.getByText("Zed")).toBeInTheDocument();
	});

	it("sorts a negative fraction before its truncated bigint", () => {
		render(
			<DataTable
				data={[
					{ name: "Int", count: -2n },
					{ name: "Frac", count: -2.5 },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[0].textContent).toBe("Frac");
	});

	it("sorts equal bigints without reordering", () => {
		render(
			<DataTable
				data={[
					{ name: "A", count: 2n },
					{ name: "B", count: 2n },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
	});

	it("sorts a fractional number after an equal truncated bigint", () => {
		render(
			<DataTable
				data={[
					{ name: "Int", count: 2n },
					{ name: "Frac", count: 2.5 },
				]}
				columns={[
					{ id: "name", header: "Name", accessor: (row) => row.name },
					{ id: "count", header: "Count", accessor: (row) => row.count },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByRole("cell")[0].textContent).toBe("Int");
	});

	it("filters with filterValue", () => {
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
						filterValue: (row) => row.name,
					},
				]}
				filter="idle"
			/>,
		);
		expect(screen.getByText("Idle")).toBeInTheDocument();
		expect(screen.queryByText("Active")).not.toBeInTheDocument();
	});

	it("does not filter object cells without sort or filter values", () => {
		render(
			<DataTable
				data={[{ name: "Active", count: 1 }]}
				columns={[
					{
						id: "status",
						header: "Status",
						accessor: (row) => <span>{row.name}</span>,
					},
				]}
				filter="active"
			/>,
		);
		expect(screen.queryByText("Active")).not.toBeInTheDocument();
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

	it("namespaces colliding explicit and generated row ids", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const named = { id: "basalt-row-0", name: "Named", count: 1 };
		const generated = { name: "Generated", count: 2 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
			{ id: "count", header: "Count", accessor: (row: { count: number }) => row.count },
		];
		const { rerender } = render(<DataTable data={[named, generated]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Named-0" }));
		fireEvent.click(screen.getByRole("button", { name: "Generated-0" }));
		expect(screen.getByRole("button", { name: "Named-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Generated-1" })).toBeInTheDocument();
		rerender(<DataTable data={[generated, named]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Named-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Generated-1" })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Name" }));
		expect(screen.getByRole("button", { name: "Named-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Generated-1" })).toBeInTheDocument();
	});

	it("preserves state when a row is replaced with the same id", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const first = { id: "row", name: "Same", count: 1 };
		const next = { id: "row", name: "Same", count: 1 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
			{ id: "count", header: "Count", accessor: (row: { count: number }) => row.count },
		];
		const { rerender } = render(<DataTable data={[first]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Same-0" }));
		rerender(<DataTable data={[next]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Same-1" })).toBeInTheDocument();
	});

	it("keeps row state when a duplicate id is added", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const solo = { id: "same", name: "Solo", count: 1 };
		const peer = { id: "same", name: "Peer", count: 2 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
			{ id: "count", header: "Count", accessor: (row: { count: number }) => row.count },
		];
		const { rerender } = render(<DataTable data={[solo]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Solo-0" }));
		rerender(<DataTable data={[solo, peer]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Solo-1" })).toBeInTheDocument();
		rerender(<DataTable data={[solo]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Solo-1" })).toBeInTheDocument();
	});

	it("keeps duplicate explicit ids stable across reorders", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const left = { id: "same", name: "Left", count: 1 };
		const right = { id: "same", name: "Right", count: 2 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
			{ id: "count", header: "Count", accessor: (row: { count: number }) => row.count },
		];
		const { rerender } = render(<DataTable data={[left, right]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Left-0" }));
		fireEvent.click(screen.getByRole("button", { name: "Right-0" }));
		rerender(<DataTable data={[right, left]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Left-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Right-1" })).toBeInTheDocument();
	});

	it("keeps state when a duplicate id is prepended", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const solo = { id: "same", name: "Solo", count: 1 };
		const peer = { id: "same", name: "Peer", count: 2 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
			{ id: "count", header: "Count", accessor: (row: { count: number }) => row.count },
		];
		const { rerender } = render(<DataTable data={[solo]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Solo-0" }));
		rerender(<DataTable data={[peer, solo]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Solo-1" })).toBeInTheDocument();
	});

	it("keeps the surviving duplicate row's state when its peer is removed", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const left = { id: "same", name: "Left", count: 1 };
		const right = { id: "same", name: "Right", count: 2 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
			{ id: "count", header: "Count", accessor: (row: { count: number }) => row.count },
		];
		const { rerender } = render(<DataTable data={[left, right]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Right-0" }));
		rerender(<DataTable data={[right]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Right-1" })).toBeInTheDocument();
	});

	it("keeps a duplicate survivor's key when a same-id object replaces it", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const left = { id: "same", name: "Left", count: 1 };
		const right = { id: "same", name: "Right", count: 2 };
		const next = { id: "same", name: "Next", count: 3 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
			{ id: "count", header: "Count", accessor: (row: { count: number }) => row.count },
		];
		const { rerender } = render(<DataTable data={[left, right]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Right-0" }));
		rerender(<DataTable data={[right]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Right-1" })).toBeInTheDocument();
		rerender(<DataTable data={[next]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Next-1" })).toBeInTheDocument();
	});

	it("does not let a returning duplicate steal a live inherited key", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const first = { id: "same", name: "A", count: 1 };
		const second = { id: "same", name: "B", count: 2 };
		const third = { id: "same", name: "C", count: 3 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
		];
		const { rerender } = render(<DataTable data={[first, second]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "B-0" }));
		rerender(<DataTable data={[first, third]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "C-1" })).toBeInTheDocument();
		rerender(<DataTable data={[second, third, first]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "C-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "B-0" })).toBeInTheDocument();
	});

	it("keeps function row state across reorders", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const left = () => "Left";
		const right = () => "Right";
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: () => string) => <NameCell name={row()} />,
			},
		];
		const { rerender } = render(<DataTable data={[left, right]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Left-0" }));
		fireEvent.click(screen.getByRole("button", { name: "Right-0" }));
		rerender(<DataTable data={[right, left]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Left-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Right-1" })).toBeInTheDocument();
	});

	it("reuses a duplicate key when the colliding row is replaced", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const left = { id: "same", name: "Left", count: 1 };
		const right = { id: "same", name: "Right", count: 2 };
		const next = { id: "same", name: "Next", count: 3 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
			{ id: "count", header: "Count", accessor: (row: { count: number }) => row.count },
		];
		const { rerender } = render(<DataTable data={[left, right]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Right-0" }));
		rerender(<DataTable data={[left, next]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Left-0" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Next-1" })).toBeInTheDocument();
	});

	it("keeps repeated row state when another row is prepended", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const row = { name: "Zed", count: 1 };
		const extra = { name: "Amy", count: 2 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
		];
		const { rerender } = render(<DataTable data={[row, row]} columns={identityColumns} />);
		const copies = screen.getAllByRole("button", { name: "Zed-0" });
		fireEvent.click(copies[1]);
		rerender(<DataTable data={[extra, row, row]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Amy-0" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Zed-0" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Zed-1" })).toBeInTheDocument();
	});

	it("keeps distinct symbol row state across reorders", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const left = Symbol("row");
		const right = Symbol("row");
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: symbol) => <NameCell name={row === left ? "Left" : "Right"} />,
			},
		];
		const { rerender } = render(<DataTable data={[left, right]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Left-0" }));
		fireEvent.click(screen.getByRole("button", { name: "Right-0" }));
		rerender(<DataTable data={[right, left]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Left-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Right-1" })).toBeInTheDocument();
	});

	it("honors empty getRowId values", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const first = { name: "A", count: 1 };
		const second = { name: "B", count: 2 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
		];
		const { rerender } = render(
			<DataTable data={[first]} columns={identityColumns} getRowId={() => ""} />,
		);
		fireEvent.click(screen.getByRole("button", { name: "A-0" }));
		rerender(<DataTable data={[second]} columns={identityColumns} getRowId={() => ""} />);
		expect(screen.getByRole("button", { name: "B-1" })).toBeInTheDocument();
	});

	it("does not let a returning row steal a live canonical key", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const first = { id: "x", name: "A", count: 1 };
		const second = { id: "x", name: "B", count: 2 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
			{ id: "count", header: "Count", accessor: (row: { count: number }) => row.count },
		];
		const { rerender } = render(<DataTable data={[first]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "A-0" }));
		rerender(<DataTable data={[second]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "B-1" })).toBeInTheDocument();
		rerender(<DataTable data={[first, second]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "A-0" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "B-1" })).toBeInTheDocument();
	});

	it("isolates synthesized keys from caller ids", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const first = { id: "x", name: "A", count: 1 };
		const second = { id: "x", name: "B", count: 2 };
		const caller = { id: "x:basalt-row-1", name: "C", count: 3 };
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: { name: string }) => <NameCell name={row.name} />,
			},
			{ id: "count", header: "Count", accessor: (row: { count: number }) => row.count },
		];
		const { rerender } = render(
			<DataTable data={[first, second, caller]} columns={identityColumns} />,
		);
		fireEvent.click(screen.getByRole("button", { name: "A-0" }));
		fireEvent.click(screen.getByRole("button", { name: "B-0" }));
		fireEvent.click(screen.getByRole("button", { name: "C-0" }));
		rerender(<DataTable data={[caller, second, first]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "A-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "B-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "C-1" })).toBeInTheDocument();
	});

	it("keeps duplicate row object occurrences distinct", () => {
		const row = { name: "Zed", count: 2 };
		render(<DataTable data={[row, row]} columns={columns} />);
		expect(screen.getAllByText("Zed")).toHaveLength(2);
		fireEvent.click(screen.getByRole("button", { name: /Count/ }));
		expect(screen.getAllByText("Zed")).toHaveLength(2);
	});

	it("keeps duplicate id object occurrences distinct", () => {
		const row = { id: "z", name: "Zed", count: 2 };
		render(<DataTable data={[row, row]} columns={columns} />);
		expect(screen.getAllByText("Zed")).toHaveLength(2);
	});

	it("renders mixed primitive rows", () => {
		render(
			<DataTable
				data={[null, 1, true, "Zed"] as Array<string | number | boolean | null>}
				columns={[{ id: "name", header: "Name", accessor: (row) => String(row) }]}
			/>,
		);
		expect(screen.getByText("null")).toBeInTheDocument();
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("true")).toBeInTheDocument();
		expect(screen.getByText("Zed")).toBeInTheDocument();
	});

	it("keeps undefined row state across reorders", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: string | undefined) => <NameCell name={row ?? "Empty"} />,
			},
		];
		const { rerender } = render(<DataTable data={[undefined, "A"]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Empty-0" }));
		rerender(<DataTable data={["A", undefined]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Empty-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "A-0" })).toBeInTheDocument();
	});

	it("keeps signed zero rows distinct across reorders", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: number) => <NameCell name={Object.is(row, -0) ? "Neg" : "Pos"} />,
			},
		];
		const { rerender } = render(<DataTable data={[0, -0]} columns={identityColumns} />);
		fireEvent.click(screen.getByRole("button", { name: "Pos-0" }));
		fireEvent.click(screen.getByRole("button", { name: "Neg-0" }));
		rerender(<DataTable data={[-0, 0]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "Pos-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Neg-1" })).toBeInTheDocument();
	});

	it("renders primitive rows", () => {
		render(
			<DataTable
				data={["Zed", "Amy"]}
				columns={[{ id: "name", header: "Name", accessor: (row) => row }]}
			/>,
		);
		expect(screen.getByText("Zed")).toBeInTheDocument();
		expect(screen.getByText("Amy")).toBeInTheDocument();
	});

	it("keeps colliding primitive keys from stealing sibling identity", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const identityColumns = [
			{
				id: "name",
				header: "Name",
				accessor: (row: string) => <NameCell name={row} />,
			},
		];
		const { rerender } = render(<DataTable data={["a", "a", "a-1"]} columns={identityColumns} />);
		const copies = screen.getAllByRole("button", { name: "a-0" });
		fireEvent.click(copies[1]);
		fireEvent.click(screen.getByRole("button", { name: "a-1-0" }));
		rerender(<DataTable data={["a-1", "a", "a"]} columns={identityColumns} />);
		expect(screen.getByRole("button", { name: "a-1-1" })).toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: "a-0" })).toHaveLength(1);
		expect(screen.getByRole("button", { name: "a-1" })).toBeInTheDocument();
	});

	it("keeps primitive row state across reorders", () => {
		function NameCell({ name }: { name: string }) {
			const [count, setCount] = useState(0);
			return (
				<button type="button" onClick={() => setCount((value) => value + 1)}>
					{name}-{count}
				</button>
			);
		}
		const { rerender } = render(
			<DataTable
				data={["A", "B"]}
				columns={[
					{
						id: "name",
						header: "Name",
						accessor: (row: string) => <NameCell name={row} />,
					},
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "A-0" }));
		fireEvent.click(screen.getByRole("button", { name: "B-0" }));
		rerender(
			<DataTable
				data={["B", "A"]}
				columns={[
					{
						id: "name",
						header: "Name",
						accessor: (row: string) => <NameCell name={row} />,
					},
				]}
			/>,
		);
		expect(screen.getByRole("button", { name: "A-1" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "B-1" })).toBeInTheDocument();
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
