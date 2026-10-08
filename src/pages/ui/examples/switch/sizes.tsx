import { Switch } from "@nocoo/basalt/components/switch";

export default function SwitchSizes() {
	return (
		<div className="flex flex-wrap items-center gap-basalt-space-lg">
			<Switch size="sm" aria-label="Small" defaultChecked />
			<Switch aria-label="Default size" defaultChecked />
		</div>
	);
}
