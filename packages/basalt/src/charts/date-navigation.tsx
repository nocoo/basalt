import type { ComponentProps } from "react";
import { DatePicker } from "../components/date-picker";

export function DateNavigation({
	ariaLabel,
	"aria-label": ariaLabelAttr,
	...props
}: ComponentProps<typeof DatePicker> & { ariaLabel?: string }) {
	return <DatePicker {...props} aria-label={ariaLabel ?? ariaLabelAttr ?? "Date navigation"} />;
}
