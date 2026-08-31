import { Label } from "@nocoo/basalt/components/label";
import { Radio, RadioGroup } from "@nocoo/basalt/components/radio";

export default function RadioHorizontal() {
	return (
		<RadioGroup defaultValue="a" className="flex gap-4">
			<Label className="flex items-center gap-2">
				<Radio value="a" /> Alpha
			</Label>
			<Label className="flex items-center gap-2">
				<Radio value="b" /> Beta
			</Label>
		</RadioGroup>
	);
}
