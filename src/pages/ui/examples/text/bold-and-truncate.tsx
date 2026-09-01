import { Text } from "@nocoo/basalt/components/text";

export default function BoldAndTruncate() {
	return (
		<div className="flex w-full flex-col gap-3">
			<Text bold>Bold body copy</Text>
			<div className="w-40">
				<Text truncate>A very long line that should ellipsize in this narrow container</Text>
			</div>
		</div>
	);
}
