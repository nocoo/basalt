import { Textarea } from "@nocoo/basalt/components/textarea";

export default function TextareaSizes() {
	return (
		<div className="flex w-full flex-col gap-basalt-space-lg">
			<Textarea size="sm" aria-label="Small notes" />
			<Textarea size="md" aria-label="Medium notes" />
			<Textarea size="lg" aria-label="Large notes" />
		</div>
	);
}
