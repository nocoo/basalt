import { ChartFrame } from "@nocoo/basalt/components/chart";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { StatCard } from "@nocoo/basalt/components/stat-card";
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
				<svg viewBox="0 0 40 40" role="img" aria-label="Alpha share">
					<circle
						cx="20"
						cy="20"
						r="14"
						fill="none"
						stroke="hsl(var(--basalt-chart-1))"
						strokeWidth="6"
					/>
				</svg>
			</ChartFrame>
		</StatCard>
		<DatePicker aria-label="Pick date" />
		<DataTable data={rows} columns={columns} />
	</StrictMode>,
);
