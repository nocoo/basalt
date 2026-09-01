import { DataTable } from "@nocoo/basalt/components/data-table";

export default function DataTableLoading() {
	return (
		<DataTable
			loading
			data={[{ name: "Atlas" }]}
			columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
		/>
	);
}
