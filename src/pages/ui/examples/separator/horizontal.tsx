import { Separator } from "@nocoo/basalt/components/separator";
import { Text } from "@nocoo/basalt/components/text";

export default function SeparatorHorizontal() {
	return (
		<div className="w-full max-w-sm space-y-3">
			<Text>Above</Text>
			<Separator />
			<Text>Below</Text>
		</div>
	);
}
