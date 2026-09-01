import { DataTable } from "@nocoo/basalt/components/data-table";

export default function DataTableEmpty() {
	return (
		<DataTable
			data={[] as Array<{ name: string }>}
			empty="No records"
			columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
		/>
	);
}
