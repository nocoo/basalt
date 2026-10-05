export type DiffTableColumn = { id: string; label: string; width?: number };
export type DiffTableRow = {
	id: string;
	label: string;
	change: "add" | "remove" | "unchanged";
	values: Readonly<Record<string, string | number>>;
};

export function selectedDiffRows(rows: readonly DiffTableRow[], excluded: readonly string[]) {
	return rows.filter((row) => row.change !== "unchanged" && !excluded.includes(row.id));
}
