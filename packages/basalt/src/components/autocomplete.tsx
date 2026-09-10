import type { ComponentPropsWithoutRef } from "react";
import type { InputSize } from "./input";
import { TypeaheadField, type TypeaheadItem } from "./typeahead-field";

export type AutocompleteItem = TypeaheadItem;

export type AutocompleteProps = Omit<
	ComponentPropsWithoutRef<"div">,
	"children" | "defaultValue" | "onChange"
> & {
	/**
	 * Suggestions shown as the query matches. Values outside the list are allowed.
	 *
	 * Note: When focus leaves the field (via pointer click or Tab/Shift+Tab navigation),
	 * any uncommitted text or matching suggestion is committed once without stealing focus
	 * back to the input, allowing natural focus traversal.
	 */
	items: AutocompleteItem[];
	/**
	 * The controlled value.
	 */
	value?: string;
	/**
	 * The uncontrolled initial value.
	 */
	defaultValue?: string;
	/**
	 * Called when the value changes, including freeform text.
	 */
	onValueChange?: (value: string) => void;
	/**
	 * Native form field name.
	 */
	name?: string;
	/**
	 * Placeholder shown when the field is empty.
	 * @default Search…
	 */
	placeholder?: string;
	/**
	 * Disable the field.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Disable the field and mark it busy.
	 * @default false
	 */
	loading?: boolean;
	/**
	 * The visual size of the field.
	 * @default default
	 */
	size?: InputSize;
};

export function Autocomplete({ placeholder = "Search…", ...rest }: AutocompleteProps) {
	return <TypeaheadField placeholder={placeholder} allowFreeform {...rest} />;
}
