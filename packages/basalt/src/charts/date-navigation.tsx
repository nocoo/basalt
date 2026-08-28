import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { Button } from "../components/button";
import { DatePicker } from "../components/date-picker";

function shiftIso(value: string, delta: number) {
	const match = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(value);
	const date = match
		? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
		: new Date();
	date.setDate(date.getDate() + delta);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function DateNavigation({
	value,
	defaultValue = "",
	onChange,
	disabled,
	ariaLabel,
	"aria-label": ariaLabelAttr,
	...props
}: ComponentProps<typeof DatePicker> & { ariaLabel?: string }) {
	const [uncontrolled, setUncontrolled] = useState(value ?? defaultValue);
	const selected = value ?? uncontrolled;
	function commit(next: string) {
		if (value === undefined) {
			setUncontrolled(next);
		}
		onChange?.(next);
	}
	return (
		<div className="inline-flex items-center gap-1">
			<Button
				variant="outline"
				size="icon"
				disabled={disabled}
				aria-label="Previous day"
				onClick={() => commit(shiftIso(selected, -1))}
			>
				<ChevronLeft />
			</Button>
			<DatePicker
				{...props}
				value={selected}
				disabled={disabled}
				onChange={commit}
				aria-label={ariaLabel ?? ariaLabelAttr ?? "Date navigation"}
			/>
			<Button
				variant="outline"
				size="icon"
				disabled={disabled}
				aria-label="Next day"
				onClick={() => commit(shiftIso(selected, 1))}
			>
				<ChevronRight />
			</Button>
		</div>
	);
}
