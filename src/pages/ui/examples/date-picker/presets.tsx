import { DatePicker } from "@nocoo/basalt/components/date-picker";

export default function DatePickerPresets() {
	return (
		<DatePicker
			aria-label="Date"
			presets={[
				{ label: "New year", value: "2026-01-01" },
				{ label: "Midyear", value: "2026-07-01" },
			]}
		/>
	);
}
