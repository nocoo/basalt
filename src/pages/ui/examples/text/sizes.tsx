import { Text } from "@nocoo/basalt/components/text";

export default function TextSizes() {
	return (
		<div className="flex w-full flex-col gap-3">
			<Text size="xl">Extra large</Text>
			<Text size="lg">Large</Text>
			<Text>Body copy</Text>
			<Text size="sm">Small</Text>
			<Text size="xs">Extra small</Text>
		</div>
	);
}
