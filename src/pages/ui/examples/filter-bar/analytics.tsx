import { Button } from "@nocoo/basalt/components/button";
import { DatePicker, type DatePickerRange } from "@nocoo/basalt/components/date-picker";
import { FilterBar, FilterChip } from "@nocoo/basalt/components/filter-bar";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useState } from "react";

const records = [
	{ date: "2026-09-01", requests: 1800 },
	{ date: "2026-09-03", requests: 2400 },
	{ date: "2026-09-05", requests: 3200 },
	{ date: "2026-09-07", requests: 2900 },
];

export default function AnalyticsFilters() {
	const [range, setRange] = useState<DatePickerRange>({
		from: "2026-09-01",
		to: "2026-09-07",
	});
	const rows = records.filter(
		(row) => (!range.from || row.date >= range.from) && (!range.to || row.date <= range.to),
	);
	return (
		<div className="w-full space-y-basalt-space-lg">
			<FilterBar
				label="Analytics filters"
				active={!!range.from || !!range.to}
				onClear={() => setRange({ from: "", to: "" })}
				chips={
					range.from && (
						<FilterChip
							label="Period"
							value={`${range.from} → ${range.to ?? "…"}`}
							onRemove={() => setRange({ from: "", to: "" })}
						/>
					)
				}
			>
				<DatePicker
					mode="range"
					aria-label="Analytics period"
					rangeValue={range}
					onRangeChange={setRange}
				/>
				<Button
					variant="outline"
					onClick={() => setRange({ from: "2026-09-05", to: "2026-09-07" })}
				>
					Last 3 days
				</Button>
				<Button
					variant="outline"
					onClick={() => setRange({ from: "2026-09-01", to: "2026-09-07" })}
				>
					This week
				</Button>
			</FilterBar>
			<LayerCard>
				<p className="text-basalt-base text-basalt-muted-foreground">Requests in selected period</p>
				<p role="status" className="mt-basalt-space-lg text-basalt-4xl font-semibold tabular-nums">
					{rows.reduce((sum, row) => sum + row.requests, 0).toLocaleString()}
				</p>
				<p className="mt-basalt-space-lg text-basalt-sm text-basalt-muted-foreground">
					September 2026 sample · date filtering belongs to this page.
				</p>
			</LayerCard>
		</div>
	);
}
