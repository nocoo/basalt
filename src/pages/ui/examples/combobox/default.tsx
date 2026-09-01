import { Combobox } from "@nocoo/basalt/components/combobox";

export default function ComboboxDefault() {
	return (
		<Combobox
			items={[
				{ value: "apple", label: "Apple" },
				{ value: "banana", label: "Banana" },
			]}
			placeholder="Select…"
		/>
	);
}
