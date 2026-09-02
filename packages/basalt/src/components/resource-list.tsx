import { DataTable, type DataTableColumn } from "./data-table";
import { PageHeader } from "./page-header";

export type ResourceListRow = {
	name: string;
	status: string;
};

export type ResourceListProps = {
	title: string;
	description?: string;
	data: ResourceListRow[];
};

const COLUMNS: DataTableColumn<ResourceListRow>[] = [
	{ id: "name", header: "Name", accessor: (row) => row.name },
	{ id: "status", header: "Status", accessor: (row) => row.status },
];

export function ResourceList({ title, description, data }: ResourceListProps) {
	return (
		<div className="space-y-4">
			<PageHeader title={title} description={description} />
			<DataTable data={data} columns={COLUMNS} />
		</div>
	);
}
