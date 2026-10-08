import { Separator } from "@nocoo/basalt/components/separator";
import { Text } from "@nocoo/basalt/components/text";

export default function SeparatorHorizontal() {
	return (
		<div className="w-full max-w-sm space-y-basalt-space-lg">
			<Text>Above</Text>
			<Separator />
			<Text>Below</Text>
		</div>
	);
}
