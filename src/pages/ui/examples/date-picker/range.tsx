import { DatePicker } from "@nocoo/basalt/components/date-picker";

export default function DatePickerRange() {
	return (
		<DatePicker
			mode="range"
			aria-label="Stay"
			defaultRangeValue={{ from: "2024-01-10", to: "2024-01-12" }}
		/>
	);
}
