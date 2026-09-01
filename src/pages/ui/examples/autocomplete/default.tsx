import { Autocomplete } from "@nocoo/basalt/components/autocomplete";

export default function AutocompleteDefault() {
	return (
		<Autocomplete
			items={[
				{ value: "apple", label: "Apple" },
				{ value: "banana", label: "Banana" },
			]}
			placeholder="Search fruits"
		/>
	);
}
