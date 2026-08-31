import { Radio, RadioGroup } from "@nocoo/basalt/components/radio";

export default function RadioDisabled() {
	return (
		<RadioGroup defaultValue="a" className="flex gap-4">
			<Radio value="a" disabled aria-label="Disabled A" />
			<Radio value="b" disabled aria-label="Disabled B" />
		</RadioGroup>
	);
}
