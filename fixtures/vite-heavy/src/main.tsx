import { ChartFrame } from "@nocoo/basalt/components/chart";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { StatCard } from "@nocoo/basalt/components/stat-card";
import { DonutChart } from "./charts/donut";
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
		<StatCard value={1} title="Chart consumers">
			<ChartFrame ariaLabel="Heavy consumer chart frame" size="h-basalt-20 w-full">
				<DonutChart data={[{ name: "alpha", value: 1 }]} />
			</ChartFrame>
		</StatCard>
		<DatePicker aria-label="Pick date" />
		<DataTable data={rows} columns={columns} />
	</StrictMode>,
);
