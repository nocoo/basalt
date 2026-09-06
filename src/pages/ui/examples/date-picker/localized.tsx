import { DatePicker } from "@nocoo/basalt/components/date-picker";

export default function DatePickerLocalized() {
	return (
		<DatePicker
			defaultValue="2026-09-09"
			locale="zh-CN"
			weekStartsOn={1}
			aria-label="预约日期"
			labels={{
				calendar: "预约日历",
				previousMonth: "上个月",
				nextMonth: "下个月",
				placeholder: "选择日期",
			}}
		/>
	);
}
