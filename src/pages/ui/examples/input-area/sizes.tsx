import { InputArea } from "@nocoo/basalt/components/input-area";

export default function InputAreaSizes() {
	return (
		<div className="flex w-full flex-col gap-basalt-space-lg">
			<InputArea size="sm" aria-label="Small notes" />
			<InputArea aria-label="Default notes" />
			<InputArea size="lg" aria-label="Large notes" />
		</div>
	);
}
