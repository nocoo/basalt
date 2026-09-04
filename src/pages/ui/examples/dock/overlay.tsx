import { Dock, DockBody } from "@nocoo/basalt/components/dock";

export default function OverlayExample() {
	return (
		<div className="relative flex h-48 overflow-hidden rounded-basalt-lg ring-1 ring-basalt-border">
			<div className="flex-1 bg-basalt-secondary" />
			<Dock mode="overlay" open width="16rem" aria-label="Assistant" className="h-full">
				<DockBody>Panel</DockBody>
			</Dock>
		</div>
	);
}
