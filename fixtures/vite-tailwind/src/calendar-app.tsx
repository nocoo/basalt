import { DatePicker, type DatePickerRange } from "@nocoo/basalt/components/date-picker";
import React, { useState } from "react";

declare global {
	interface Window {
		calendarAudit?: {
			mounted: boolean;
		};
	}
}

export function CalendarApp() {
	const [range, setRange] = useState<DatePickerRange>({
		from: "2026-09-10",
		to: "2026-09-12",
	});

	React.useEffect(() => {
		window.calendarAudit = { mounted: true };
	}, []);

	return (
		<div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 32 }}>
			<div id="single-calendar-container" style={{ width: 280 }}>
				<DatePicker
					id="appointment-picker"
					aria-label="Appointment"
					defaultValue="2026-09-09"
					weekStartsOn={1}
				/>
			</div>
			<div id="clamped-calendar-container" style={{ width: 280 }}>
				<DatePicker id="clamped-picker" aria-label="Clamped" defaultValue="2024-01-31" />
			</div>
			<div id="range-calendar-container" style={{ width: 280 }}>
				<DatePicker
					id="stay-picker"
					aria-label="Stay"
					mode="range"
					rangeValue={range}
					onRangeChange={setRange}
				/>
			</div>
		</div>
	);
}
