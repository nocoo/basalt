import { Autocomplete } from "@nocoo/basalt/components/autocomplete";

export default function AutocompleteDisabled() {
	return (
		<Autocomplete disabled items={[{ value: "apple", label: "Apple" }]} placeholder="Disabled" />
	);
}
