import type { ReactNode } from "react";
import { cn } from "../utils/cn";
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
	/** Custom heading; falls back to PageHeader. */
	header?: ReactNode;
	/** Search and primary actions below the heading. */
	toolbar?: ReactNode;
	/** Active filters and their controls. */
	filters?: ReactNode;
	/** Selection-dependent actions. */
	bulkActions?: ReactNode;
	/** State content replacing the results; undefined falls through to children/data. */
	state?: ReactNode;
	/** Custom results such as a typed DataTable. */
	children?: ReactNode;
	/** Pagination or result summary after the results. */
	footer?: ReactNode;
	/** Classes for the root region. */
	className?: string;
	/** Show the default table loading state. @default false */
	loading?: boolean;
	/** Content shown when default data is empty. */
	empty?: ReactNode;
	/** Default table error content. */
	error?: ReactNode;
	/** Retry callback for the default table. */
	onRetry?: () => void;
};

const COLUMNS: DataTableColumn<ResourceListRow>[] = [
	{ id: "name", header: "Name", accessor: (row) => row.name },
	{ id: "status", header: "Status", accessor: (row) => row.status },
];

export function ResourceList({
	title,
	description,
	data,
	header,
	toolbar,
	filters,
	bulkActions,
	state,
	children,
	footer,
	className,
	loading,
	empty,
	error,
	onRetry,
}: ResourceListProps) {
	return (
		<div className={cn("min-w-0 space-y-4", className)}>
			{header ?? <PageHeader title={title} description={description} />}
			{toolbar != null ? <div>{toolbar}</div> : null}
			{filters != null ? <div>{filters}</div> : null}
			{bulkActions != null ? <div>{bulkActions}</div> : null}
			{state ?? children ?? (
				<DataTable
					data={data}
					columns={COLUMNS}
					loading={loading}
					empty={empty}
					error={error}
					onRetry={onRetry}
					aria-label={title}
				/>
			)}
			{footer != null ? <div>{footer}</div> : null}
		</div>
	);
}
