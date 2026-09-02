import { DataTable } from "@nocoo/basalt/components/data-table";

export default function DataTableFilter() {
	return (
		<DataTable
			filter="Atlas"
			data={[{ name: "Atlas" }, { name: "Nova" }]}
			columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
		/>
	);
}
