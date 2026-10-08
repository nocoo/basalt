import { Autocomplete } from "@nocoo/basalt/components/autocomplete";

export default function AutocompleteDefault() {
	return (
		<Autocomplete
			items={[
				{ value: "care-plan", label: "Care plan" },
				{ value: "follow-up", label: "Follow-up" },
			]}
			placeholder="Search care topics"
		/>
	);
}
