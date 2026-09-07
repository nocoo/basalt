import { useMemo, useState } from "react";

const INVOICES = [
	{ id: "INV-2041", customer: "Nova Labs", status: "Paid", amount: 12400, date: "2026-02-01" },
	{ id: "INV-2042", customer: "Violet Corp", status: "Pending", amount: 5950, date: "2026-02-03" },
	{ id: "INV-2043", customer: "Atlas Works", status: "Paid", amount: 8100, date: "2026-02-05" },
	{ id: "INV-2044", customer: "Echo Systems", status: "Overdue", amount: 3250, date: "2026-02-07" },
];
type InvoiceKey = keyof (typeof INVOICES)[number];

export function useDataShowcaseViewModel() {
	const [query, setQueryState] = useState("");
	const [status, setStatusState] = useState("all");
	const [page, setPage] = useState(1);
	const [sort, setSort] = useState<{ key: InvoiceKey; direction: 1 | -1 }>({
		key: "id",
		direction: 1,
	});
	const filtered = useMemo(
		() =>
			INVOICES.filter(
				(row) =>
					(status === "all" || row.status === status) &&
					`${row.id} ${row.customer}`.toLowerCase().includes(query.trim().toLowerCase()),
			).sort((a, b) => {
				const left = a[sort.key],
					right = b[sort.key];
				return (
					(typeof left === "number" && typeof right === "number"
						? left - right
						: String(left).localeCompare(String(right))) * sort.direction
				);
			}),
		[query, status, sort],
	);
	const pageCount = Math.max(1, Math.ceil(filtered.length / 2));
	function reset() {
		setQueryState("");
		setStatusState("all");
		setPage(1);
	}
	return {
		query,
		status,
		sort,
		page,
		pageCount,
		total: filtered.length,
		rows: filtered.slice((page - 1) * 2, page * 2),
		reset,
		setQuery: (value: string) => {
			setQueryState(value);
			setPage(1);
		},
		setStatus: (value: string) => {
			setStatusState(value);
			setPage(1);
		},
		setPage: (value: number) => setPage(Math.max(1, Math.min(value, pageCount))),
		sortBy: (key: InvoiceKey) => {
			setSort((current) => ({
				key,
				direction: current.key === key && current.direction === 1 ? -1 : 1,
			}));
			setPage(1);
		},
	};
}
