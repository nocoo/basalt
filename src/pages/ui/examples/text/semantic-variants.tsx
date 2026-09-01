import { Text } from "@nocoo/basalt/components/text";

export default function SemanticVariants() {
	return (
		<div className="flex w-full flex-col gap-3">
			<Text variant="heading" as="h2">
				Section title
			</Text>
			<Text>Body paragraph</Text>
			<Text as="span">Inline body</Text>
			<Text variant="mono" as="code">
				const ready = true
			</Text>
		</div>
	);
}
