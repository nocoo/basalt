import { Label } from "@nocoo/basalt/components/label";
import { Radio } from "@nocoo/basalt/components/radio";

export default function RadioGroupAndLegend() {
	return (
		<Radio.Group defaultValue="a">
			<Radio.Legend>Plan</Radio.Legend>
			<Label className="flex items-center gap-2">
				<Radio.Item value="a" /> Alpha
			</Label>
			<Label className="flex items-center gap-2">
				<Radio.Item value="b" /> Beta
			</Label>
		</Radio.Group>
	);
}
