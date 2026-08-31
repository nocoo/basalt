import { Switch } from "@nocoo/basalt/components/switch";

export default function SwitchDisabled() {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<Switch disabled aria-label="Disabled off" />
			<Switch disabled defaultChecked aria-label="Disabled on" />
		</div>
	);
}
