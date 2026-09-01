import { Combobox } from "@nocoo/basalt/components/combobox";

const ITEMS = [
	{ value: "apple", label: "Apple" },
	{ value: "banana", label: "Banana" },
];

export default function ComboboxSizes() {
	return (
		<div className="flex w-full flex-col gap-3">
			<Combobox size="sm" items={ITEMS} placeholder="Small" />
			<Combobox items={ITEMS} placeholder="Default" />
			<Combobox size="lg" items={ITEMS} placeholder="Large" />
		</div>
	);
}
