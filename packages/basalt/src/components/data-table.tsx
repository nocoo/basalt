import { type ReactNode, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

export type DataTableColumn<T> = {
	id: string;
	header: string;
	accessor: (row: T) => ReactNode;
	sortValue?: (row: T) => string | number | bigint;
	filterValue?: (row: T) => string | number | bigint;
};

function asBigint(value: unknown): bigint | null {
	if (typeof value === "bigint") {
		return value;
	}
	if (typeof value === "number" && Number.isFinite(value) && Number.isInteger(value)) {
		return BigInt(value);
	}
	return null;
}

function compareNumberAndBigint(num: number, big: bigint): number {
	if (!Number.isFinite(num)) {
		if (Number.isNaN(num)) {
			return 0;
		}
		return num === Number.POSITIVE_INFINITY ? 1 : -1;
	}
	const truncated = BigInt(Math.trunc(num));
	if (truncated < big) {
		return -1;
	}
	if (truncated > big) {
		return 1;
	}
	if (num === Number(truncated)) {
		return 0;
	}
	return num > Number(truncated) ? 1 : -1;
}

function rank(value: unknown): number {
	if (typeof value === "bigint") {
		return 0;
	}
	if (typeof value === "number") {
		return Number.isFinite(value) ? 0 : 1;
	}
	if (typeof value === "string") {
		return 2;
	}
	return 3;
}

function compareNonFinite(left: number, right: number): number {
	const order = (value: number) => {
		if (value === Number.NEGATIVE_INFINITY) {
			return 0;
		}
		if (value === Number.POSITIVE_INFINITY) {
			return 1;
		}
		return 2;
	};
	return order(left) - order(right);
}

function compareUnknown(left: unknown, right: unknown): number {
	const leftRank = rank(left);
	const rightRank = rank(right);
	if (leftRank !== rightRank) {
		return leftRank - rightRank;
	}
	if (leftRank === 0) {
		if (typeof left === "bigint" && typeof right === "bigint") {
			return left < right ? -1 : left > right ? 1 : 0;
		}
		const leftInt = asBigint(left);
		const rightInt = asBigint(right);
		if (leftInt !== null && rightInt !== null) {
			return leftInt < rightInt ? -1 : leftInt > rightInt ? 1 : 0;
		}
		if (typeof left === "number" && typeof right === "bigint") {
			return compareNumberAndBigint(left, right);
		}
		if (typeof left === "bigint" && typeof right === "number") {
			return -compareNumberAndBigint(right, left);
		}
		return (left as number) - (right as number);
	}
	if (leftRank === 1) {
		return compareNonFinite(left as number, right as number);
	}
	const leftStr = String(left);
	const rightStr = String(right);
	return leftStr < rightStr ? -1 : leftStr > rightStr ? 1 : 0;
}

function filterSource<T>(column: DataTableColumn<T>, row: T): string {
	if (column.filterValue) {
		return String(column.filterValue(row));
	}
	if (column.sortValue) {
		return String(column.sortValue(row));
	}
	const rendered = column.accessor(row);
	if (
		typeof rendered === "string" ||
		typeof rendered === "number" ||
		typeof rendered === "bigint"
	) {
		return String(rendered);
	}
	return "";
}

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
		const keyed = data.map((row, index) => {
			let key = getRowId?.(row, index);
			if (!key && row && typeof row === "object" && "id" in row) {
				const raw = (row as { id: unknown }).id;
				if (raw != null) {
					key = String(raw);
				}
			}
			if (!key && row && typeof row === "object") {
				key = rowIds.current.get(row as object);
				if (!key) {
					key = `basalt-row-${rowSeq.current++}`;
					rowIds.current.set(row as object, key);
				}
			}
			return { row, key: key ?? `basalt-primitive-${index}` };
		});
		const filtered = query
			? keyed.filter(({ row }) =>
					columns.some((column) => filterSource(column, row).toLowerCase().includes(query)),
				)
			: keyed;
		if (!sort) {
			return filtered;
		}
		const column = columns.find((item) => item.id === sort.id);
		if (!column) {
			return filtered;
		}
		return [...filtered].sort((a, b) => {
			const left = column.sortValue?.(a.row) ?? column.accessor(a.row);
			const right = column.sortValue?.(b.row) ?? column.accessor(b.row);
			const cmp = compareUnknown(left, right);
			return sort.dir === "asc" ? cmp : -cmp;
		});
	}, [columns, data, getRowId, query, sort]);

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
								className="appearance-none border-0 bg-transparent p-0 font-inherit text-inherit font-medium cursor-pointer"
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
				{rows.map(({ row, key }) => (
					<TableRow key={key}>
						{columns.map((column) => {
							const cell = column.accessor(row);
							return (
								<TableCell key={column.id}>
									{typeof cell === "bigint" ? String(cell) : cell}
								</TableCell>
							);
						})}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
