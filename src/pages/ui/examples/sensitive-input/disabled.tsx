import { SensitiveInput } from "@nocoo/basalt/components/sensitive-input";

export default function SensitiveInputDisabled() {
	return (
		<SensitiveInput aria-label="Disabled password" disabled revealLabel="Show" hideLabel="Hide" />
	);
}
