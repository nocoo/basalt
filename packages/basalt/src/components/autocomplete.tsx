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

export function Autocomplete({
	items,
	value,
	defaultValue,
	onValueChange,
	name,
	placeholder = "Search…",
	disabled,
	loading,
	size,
	className,
	id,
	"aria-label": ariaLabel,
	"aria-describedby": ariaDescribedBy,
	"aria-invalid": ariaInvalid,
	...rest
}: AutocompleteProps) {
	return (
		<TypeaheadField
			items={items}
			value={value}
			defaultValue={defaultValue}
			onValueChange={onValueChange}
			name={name}
			placeholder={placeholder}
			disabled={disabled}
			loading={loading}
			size={size}
			className={className}
			id={id}
			allowFreeform
			aria-label={ariaLabel}
			aria-describedby={ariaDescribedBy}
			aria-invalid={ariaInvalid}
			{...rest}
		/>
	);
}
