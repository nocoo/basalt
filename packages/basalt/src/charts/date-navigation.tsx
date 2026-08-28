import { DatePicker } from "../components/date-picker";

export function DateNavigation({
	value,
	defaultValue,
	onChange,
	locale,
	weekStartsOn,
	timeZone,
	formatDate,
	ariaLabel = "Date navigation",
	className,
}: {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	locale?: string;
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	timeZone?: string;
	formatDate?: (date: Date) => string;
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<DatePicker
			value={value}
			defaultValue={defaultValue}
			onChange={onChange}
			locale={locale}
			weekStartsOn={weekStartsOn}
			timeZone={timeZone}
			formatDate={formatDate}
			aria-label={ariaLabel}
			className={className}
		/>
	);
}
