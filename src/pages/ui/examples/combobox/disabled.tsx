import { Combobox } from "@nocoo/basalt/components/combobox";

export default function ComboboxDisabled() {
	return <Combobox disabled items={[{ value: "apple", label: "Apple" }]} placeholder="Disabled" />;
}
