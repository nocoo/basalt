import { Label } from "@nocoo/basalt/components/label";
import { Radio, RadioGroup } from "@nocoo/basalt/components/radio";

export default function RadioDefaultVertical() {
	return (
		<RadioGroup defaultValue="a" className="flex flex-col gap-basalt-space-lg">
			<Label className="flex items-center gap-basalt-space-lg">
				<Radio value="a" /> Alpha
			</Label>
			<Label className="flex items-center gap-basalt-space-lg">
				<Radio value="b" /> Beta
			</Label>
		</RadioGroup>
	);
}
