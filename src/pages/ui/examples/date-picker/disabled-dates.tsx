import { DatePicker } from "@nocoo/basalt/components/date-picker";

export default function DatePickerDisabledDates() {
	return (
		<DatePicker
			aria-label="Date"
			defaultValue="2024-01-15"
			min="2024-01-10"
			max="2024-01-20"
			isDisabledDate={(iso) => iso === "2024-01-16"}
		/>
	);
}
