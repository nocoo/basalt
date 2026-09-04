import { Dock, DockBody } from "@nocoo/basalt/components/dock";
import { Fab } from "@nocoo/basalt/components/fab";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export default function OverlayExample() {
	const [open, setOpen] = useState(false);
	return (
		<div className="relative flex h-48 overflow-hidden rounded-basalt-lg ring-1 ring-basalt-border">
			<div className="flex-1 bg-basalt-secondary" />
			<Dock
				mode="overlay"
				open={open}
				width="16rem"
				aria-label="Assistant"
				className="h-full"
				onDismiss={() => setOpen(false)}
			>
				<DockBody>Panel</DockBody>
			</Dock>
			<Fab
				placement="absolute"
				open={open}
				aria-label="Open assistant"
				onClick={() => setOpen(true)}
			>
				<Sparkles />
			</Fab>
		</div>
	);
}
