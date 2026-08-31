import { Checkbox } from "@nocoo/basalt/components/checkbox";

export default function CheckboxDisabled() {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<Checkbox disabled aria-label="Disabled off" />
			<Checkbox disabled defaultChecked aria-label="Disabled on" />
		</div>
	);
}
