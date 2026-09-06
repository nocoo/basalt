import { Button } from "@nocoo/basalt/components/button";
import { DatePicker, type DatePickerRange } from "@nocoo/basalt/components/date-picker";
import React, { type FormEvent, useState } from "react";

declare global {
	interface Window {
		calendarAudit?: {
			mounted: boolean;
			rerenderControlledParent?: () => void;
			setControlledMonthRejectMode?: (reject: boolean) => void;
			acceptPendingControlledMonth?: (month: string) => void;
			setExternalControlledMonth?: (month: string) => void;
			getRequestedMonths?: () => string[];
			clearRequestedMonths?: () => void;
			// Empty defaultMonth test controls
			changeDefaultMonthProp?: (month: string) => void;
			// Empty controlled month test controls
			setEmptyControlledMonth?: (month: string) => void;
			getEmptyRequestedMonths?: () => string[];
		};
	}
}

export function CalendarApp() {
	const [range, setRange] = useState<DatePickerRange>({
		from: "2026-09-10",
		to: "2026-09-12",
	});

	// Controlled month testing state
	const [controlledMonth, setControlledMonth] = useState("2026-09");
	const [requestedMonths, setRequestedMonths] = useState<string[]>([]);
	const [monthRejectMode, setMonthRejectMode] = useState(true);
	const [, setRerenderTick] = useState(0);

	// Empty defaultMonth regression state
	const [defaultMonthPropVal, setDefaultMonthPropVal] = useState("2026-11");

	// Empty controlled month regression state
	const [emptyControlledMonth, setEmptyControlledMonth] = useState("2026-11");
	const [emptyRequestedMonths, setEmptyRequestedMonths] = useState<string[]>([]);

	// Chinese localized form state
	const [formStatus, setFormStatus] = useState("");

	const handleControlledMonthChange = (nextMonth: string) => {
		setRequestedMonths((prev) => [...prev, nextMonth]);
		if (!monthRejectMode) {
			setControlledMonth(nextMonth);
		}
	};

	const handleEmptyControlledMonthChange = (nextMonth: string) => {
		setEmptyRequestedMonths((prev) => [...prev, nextMonth]);
	};

	React.useEffect(() => {
		window.calendarAudit = {
			mounted: true,
			rerenderControlledParent: () => setRerenderTick((t) => t + 1),
			setControlledMonthRejectMode: (reject: boolean) => setMonthRejectMode(reject),
			acceptPendingControlledMonth: (month: string) => setControlledMonth(month),
			setExternalControlledMonth: (month: string) => setControlledMonth(month),
			getRequestedMonths: () => requestedMonths,
			clearRequestedMonths: () => setRequestedMonths([]),
			changeDefaultMonthProp: (month: string) => setDefaultMonthPropVal(month),
			setEmptyControlledMonth: (month: string) => setEmptyControlledMonth(month),
			getEmptyRequestedMonths: () => emptyRequestedMonths,
		};
	}, [requestedMonths, emptyRequestedMonths]);

	const handleBookingSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		setFormStatus(`提交成功: ${data.get("booking-date") || ""}`);
	};

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

			{/* Controlled month test fixture */}
			<div id="controlled-month-container" style={{ width: 320 }}>
				<DatePicker
					id="controlled-month-picker"
					aria-label="ControlledMonth"
					defaultValue="2026-09-15"
					month={controlledMonth}
					onMonthChange={handleControlledMonthChange}
				/>
			</div>

			{/* Empty defaultMonth regression fixture */}
			<div id="empty-default-month-container" style={{ width: 320 }}>
				<DatePicker
					id="empty-default-month-picker"
					aria-label="EmptyDefaultMonth"
					defaultMonth={defaultMonthPropVal}
				/>
			</div>

			{/* Empty controlled month regression fixture */}
			<div id="empty-controlled-month-container" style={{ width: 320 }}>
				<DatePicker
					id="empty-controlled-month-picker"
					aria-label="EmptyControlledMonth"
					month={emptyControlledMonth}
					onMonthChange={handleEmptyControlledMonthChange}
				/>
			</div>

			{/* Chinese localized form with custom validation & keyboard instructions */}
			<div id="localized-form-container" style={{ width: 320 }}>
				<form onSubmit={handleBookingSubmit}>
					<DatePicker
						id="localized-booking-picker"
						name="booking-date"
						required
						aria-label="中文预约"
						locale="zh-CN"
						weekStartsOn={1}
						labels={{
							calendar: "中文预约日历",
							previousMonth: "上个月",
							nextMonth: "下个月",
							placeholder: "请选择服务日期",
							validationMessage: "请先选择有效的预约日期再提交",
							keyboardInstructions: "使用方向键在日期中移动，PageUp/PageDown切换月份，回车确认选择",
						}}
					/>
					<div style={{ marginTop: 8 }}>
						<Button type="submit" id="submit-booking-btn">
							提交预约
						</Button>
					</div>
				</form>
				{formStatus ? <div id="booking-status">{formStatus}</div> : null}
			</div>
		</div>
	);
}
