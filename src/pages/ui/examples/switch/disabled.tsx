import { Switch } from "@nocoo/basalt/components/switch";

export default function SwitchDisabled() {
	return (
		<div className="flex flex-wrap items-center gap-basalt-space-lg">
			<Switch disabled aria-label="Disabled off" />
			<Switch disabled defaultChecked aria-label="Disabled on" />
		</div>
	);
}
