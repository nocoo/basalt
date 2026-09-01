import { DataTable } from "@nocoo/basalt/components/data-table";

export default function DataTablePagination() {
	return (
		<DataTable
			pageSize={1}
			data={[{ name: "Atlas" }, { name: "Nova" }]}
			columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
		/>
	);
}
