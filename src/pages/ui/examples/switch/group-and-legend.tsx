import { Switch } from "@nocoo/basalt/components/switch";

export default function SwitchGroupAndLegend() {
	return (
		<Switch.Group defaultValue={["alpha"]}>
			<Switch.Legend>Alerts</Switch.Legend>
			<Switch.Item value="alpha">Alpha</Switch.Item>
			<Switch.Item value="beta">Beta</Switch.Item>
		</Switch.Group>
	);
}
