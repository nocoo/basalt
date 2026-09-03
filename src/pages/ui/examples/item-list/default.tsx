import { ItemList } from "@nocoo/basalt/charts/item-list";

const items = [
	{ label: "North", value: "38%" },
	{ label: "East", value: "24%" },
	{ label: "South", value: "19%" },
	{ label: "West", value: "12%" },
	{ label: "Central", value: "7%" },
];

export default function ItemListDefault() {
	return <ItemList items={items} />;
}
