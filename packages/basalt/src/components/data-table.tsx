import { type ReactNode, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

export type DataTableColumn<T> = {
	id: string;
	header: string;
	accessor: (row: T) => ReactNode;
	sortValue?: (row: T) => string | number;
};

export function DataTable<T>({
	data,
	columns,
	filter = "",
	getRowId,
	className,
}: {
	data: T[];
	columns: DataTableColumn<T>[];
	filter?: string;
	getRowId?: (row: T, index: number) => string;
	className?: string;
}) {
	const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
	const rowIds = useRef(new WeakMap<object, string>());
	const rowSeq = useRef(0);
	const query = filter.trim().toLowerCase();

	const rows = useMemo(() => {
		const filtered = query
			? data.filter((row) =>
					columns.some((column) =>
						String(column.sortValue?.(row) ?? column.accessor(row))
							.toLowerCase()
							.includes(query),
					),
				)
			: data;
		if (!sort) {
			return filtered;
		}
		const column = columns.find((item) => item.id === sort.id);
		if (!column) {
			return filtered;
		}
		return [...filtered].sort((a, b) => {
			const left = column.sortValue?.(a) ?? String(column.accessor(a));
			const right = column.sortValue?.(b) ?? String(column.accessor(b));
			const cmp = left < right ? -1 : left > right ? 1 : 0;
			return sort.dir === "asc" ? cmp : -cmp;
		});
	}, [columns, data, query, sort]);

	return (
		<Table className={cn("w-full", className)}>
			<TableHeader>
				<TableRow>
					{columns.map((column) => (
						<TableHead
							key={column.id}
							aria-sort={
								sort?.id === column.id ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
							}
						>
							<button
								type="button"
								className="font-medium"
								onClick={() =>
									setSort((current) =>
										current?.id === column.id && current.dir === "asc"
											? { id: column.id, dir: "desc" }
											: { id: column.id, dir: "asc" },
									)
								}
							>
								{column.header}
								{sort?.id === column.id ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}
							</button>
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.map((row, index) => {
					let id = getRowId?.(row, index);
					if (!id && row && typeof row === "object" && "id" in row) {
						const raw = (row as { id: unknown }).id;
						if (raw != null) {
							id = String(raw);
						}
					}
					if (!id && row && typeof row === "object") {
						id = rowIds.current.get(row as object);
						if (!id) {
							id = `row-${rowSeq.current++}`;
							rowIds.current.set(row as object, id);
						}
					}
					return (
						<TableRow key={id ?? String(index)}>
							{columns.map((column) => (
								<TableCell key={column.id}>{column.accessor(row)}</TableCell>
							))}
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
