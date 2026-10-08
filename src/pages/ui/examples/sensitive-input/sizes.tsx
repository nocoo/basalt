import { SensitiveInput } from "@nocoo/basalt/components/sensitive-input";

export default function SensitiveInputSizes() {
	return (
		<div className="flex w-full flex-col gap-basalt-space-lg">
			<SensitiveInput size="sm" aria-label="Small password" revealLabel="Show" hideLabel="Hide" />
			<SensitiveInput aria-label="Default password" revealLabel="Show" hideLabel="Hide" />
			<SensitiveInput size="lg" aria-label="Large password" revealLabel="Show" hideLabel="Hide" />
		</div>
	);
}
