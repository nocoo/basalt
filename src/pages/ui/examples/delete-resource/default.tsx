import { DeleteResource } from "@nocoo/basalt/components/delete-resource";

export default function DeleteResourceDefault() {
	return <DeleteResource name="Atlas" onDelete={() => undefined} />;
}
