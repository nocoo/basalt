import { DataTable } from "@nocoo/basalt/components/data-table";

export default function DataTableDefault() {
	return (
		<DataTable
			data={[{ name: "Atlas" }]}
			columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
		/>
	);
}
