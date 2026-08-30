import { DonutChart } from "@nocoo/basalt/charts/donut";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import "@nocoo/basalt/styles/standalone";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const rows = [{ name: "alpha" }];
const columns = [
	{
		id: "name",
		header: "Name",
		accessor: (row: { name: string }) => row.name,
	},
];

const root = document.getElementById("root");
if (!root) {
	throw new Error("root element missing");
}

createRoot(root).render(
	<StrictMode>
		<DonutChart />
		<DatePicker aria-label="Pick date" />
		<DataTable data={rows} columns={columns} />
	</StrictMode>,
);
