import { DataTable } from "@nocoo/basalt/components/data-table";

export default function DataTableSelection() {
	return (
		<DataTable
			data={[{ name: "Atlas" }, { name: "Nova" }]}
			columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
			getRowId={(row) => row.name}
			defaultSelected={["Atlas"]}
		/>
	);
}
