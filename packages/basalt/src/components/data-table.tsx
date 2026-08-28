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
	const truncated = BigInt(Math.trunc(num));
	if (truncated < big) {
		return -1;
	}
	if (truncated > big) {
		return 1;
	}
	return num > Number(truncated) ? 1 : -1;
}

function rank(value: unknown): number {
	if (value === Number.NEGATIVE_INFINITY) {
		return 0;
	}
	if (typeof value === "bigint" || (typeof value === "number" && Number.isFinite(value))) {
		return 1;
	}
	if (value === Number.POSITIVE_INFINITY) {
		return 2;
	}
	if (typeof value === "number") {
		return 3;
	}
	if (typeof value === "string") {
		return 4;
	}
	return 5;
}

function compareUnknown(left: unknown, right: unknown): number {
	const leftRank = rank(left);
	const rightRank = rank(right);
	if (leftRank !== rightRank) {
		return leftRank - rightRank;
	}
	if (leftRank === 1) {
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
	const leftStr = String(left);
	const rightStr = String(right);
	return leftStr < rightStr ? -1 : leftStr > rightStr ? 1 : 0;
}

function primitiveKey(
	row: unknown,
	index: number,
	symbols: Map<symbol, string>,
	seq: { current: number },
): string {
	if (row === null) {
		return "prim:null";
	}
	if (row === undefined) {
		return "prim:undefined";
	}
	if (typeof row === "symbol") {
		let key = symbols.get(row);
		if (!key) {
			key = `prim:symbol:${seq.current++}`;
			symbols.set(row, key);
		}
		return key;
	}
	const type = typeof row;
	if (type === "number") {
		if (Object.is(row, -0)) {
			return "prim:number:-0";
		}
		return `prim:number:${String(row)}`;
	}
	if (type === "string" || type === "bigint" || type === "boolean") {
		return `prim:${type}:${String(row)}`;
	}
	return `prim:${index}`;
}

function isInstanceKey(key: string) {
	return key.startsWith("dup:") || key.startsWith("gen:");
}

function isCanonicalKey(key: string) {
	return key.startsWith("id:") || key.startsWith("get:");
}

function isRefRow(row: unknown): row is object {
	return typeof row === "function" || (typeof row === "object" && row !== null);
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
	const assignedKeys = useRef(new WeakMap<object, string[]>());
	const lastCanonical = useRef(new Map<string, object>());
	const lastOwner = useRef(new Map<string, object>());
	const lastKeyByCanonical = useRef(new Map<string, string>());
	const lastDupsByCanonical = useRef(new Map<string, string[]>());
	const symbolKeys = useRef(new Map<symbol, string>());
	const query = filter.trim().toLowerCase();

	const rows = useMemo(() => {
		const identityOf = (row: object) => {
			let stored = rowIds.current.get(row);
			if (!stored) {
				stored = `basalt-row-${rowSeq.current++}`;
				rowIds.current.set(row, stored);
			}
			return stored;
		};
		const canonicalOf = (row: T, index: number) => {
			const requested = getRowId?.(row, index);
			if (requested !== undefined) {
				return `get:${requested}`;
			}
			if (isRefRow(row) && "id" in row) {
				const raw = (row as { id: unknown }).id;
				if (raw != null) {
					return `id:${String(raw)}`;
				}
			}
		};
		const present = new Set<object>();
		const presentSymbols = new Set<symbol>();
		for (const row of data) {
			if (isRefRow(row)) {
				present.add(row);
			} else if (typeof row === "symbol") {
				presentSymbols.add(row);
			}
		}
		for (const [canonical, owner] of lastCanonical.current) {
			if (!present.has(owner)) {
				lastCanonical.current.delete(canonical);
			}
		}
		for (const [key, owner] of lastOwner.current) {
			if (!present.has(owner)) {
				lastOwner.current.delete(key);
			}
		}
		for (const symbol of symbolKeys.current.keys()) {
			if (!presentSymbols.has(symbol)) {
				symbolKeys.current.delete(symbol);
			}
		}
		const used = new Set<string>();
		const nextLastKey = new Map<string, string>();
		const nextDups = new Map<string, string[]>();
		const nextAssigned = new WeakMap<object, string[]>();
		const rememberKey = (row: T, index: number, key: string, objectRow: object | null) => {
			if (!objectRow) {
				return;
			}
			const list = nextAssigned.get(objectRow) ?? [];
			list.push(key);
			nextAssigned.set(objectRow, list);
			assignedKeys.current.set(objectRow, list);
			lastOwner.current.set(key, objectRow);
			if (isCanonicalKey(key)) {
				lastCanonical.current.set(key, objectRow);
			}
			const canonical = canonicalOf(row, index);
			if (!canonical) {
				return;
			}
			nextLastKey.set(canonical, key);
			if (isInstanceKey(key)) {
				const dups = nextDups.get(canonical) ?? [];
				dups.push(key);
				nextDups.set(canonical, dups);
			}
		};
		const counts = new WeakMap<object, number>();
		const pending = data.map((row, index) => {
			const objectRow = isRefRow(row) ? row : null;
			const occurrence = objectRow ? (counts.get(objectRow) ?? 0) : 0;
			if (objectRow) {
				counts.set(objectRow, occurrence + 1);
			}
			return {
				row,
				index,
				occurrence,
				key: undefined as string | undefined,
			};
		});
		for (const item of pending) {
			const objectRow = isRefRow(item.row) ? item.row : null;
			if (!objectRow) {
				continue;
			}
			const previous = assignedKeys.current.get(objectRow)?.[item.occurrence];
			if (!previous || used.has(previous)) {
				continue;
			}
			if (lastOwner.current.get(previous) === objectRow) {
				item.key = previous;
				used.add(previous);
			}
		}
		const keyed = pending.map(({ row, index, occurrence, key: reserved }) => {
			const objectRow = isRefRow(row) ? row : null;
			if (reserved) {
				rememberKey(row, index, reserved, objectRow);
				return { row, key: reserved };
			}
			const isRepeat = occurrence > 0;
			let key: string | undefined;
			const requested = canonicalOf(row, index);
			if (requested) {
				key = requested;
			}
			if (objectRow) {
				const stored = identityOf(objectRow);
				if (!key) {
					key = isRepeat ? `gen:${stored}#${occurrence}` : `gen:${stored}`;
				} else if (used.has(key) || isRepeat) {
					const reused = (lastDupsByCanonical.current.get(key) ?? []).find(
						(candidate) => !used.has(candidate),
					);
					key = reused ?? (isRepeat ? `dup:${stored}#${occurrence}` : `dup:${stored}`);
				} else {
					const inherited = lastKeyByCanonical.current.get(key);
					if (inherited && !used.has(inherited) && isInstanceKey(inherited)) {
						key = inherited;
					}
				}
			}
			key = key ?? primitiveKey(row, index, symbolKeys.current, rowSeq);
			while (used.has(key)) {
				key = `${key}-${index}`;
			}
			used.add(key);
			rememberKey(row, index, key, objectRow);
			return { row, key };
		});
		lastKeyByCanonical.current = nextLastKey;
		lastDupsByCanonical.current = nextDups;
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
