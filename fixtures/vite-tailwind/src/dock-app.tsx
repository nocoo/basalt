import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import { Dock } from "@nocoo/basalt/components/dock";
import { Popover, PopoverContent, PopoverTrigger } from "@nocoo/basalt/components/popover";
import { useState } from "react";

declare global {
	interface Window {
		renderDock?: (props: { mode?: "overlay" | "push"; nested?: string }) => void;
		closeDock?: () => void;
		auditState?: Record<string, unknown>;
	}
}

export function DockApp() {
	const [dockProps, setDockProps] = useState<{
		mode?: "overlay" | "push";
		nested?: string;
	}>({ mode: "overlay", nested: "none" });

	window.renderDock = (props) => {
		setDockProps(props);
	};

	const mode = dockProps.mode ?? "overlay";
	const nested = dockProps.nested ?? "none";
	const [open, setOpen] = useState(false);

	window.closeDock = () => setOpen(false);
	window.auditState = window.auditState ?? {};

	return (
		<div>
			<button
				id="background"
				type="button"
				onClick={() => {
					window.auditState = window.auditState ?? {};
					window.auditState.background =
						((window.auditState.background as number | undefined) ?? 0) + 1;
				}}
			>
				Background
			</button>
			<button id="opener" type="button" onClick={() => setOpen(true)}>
				Open dock
			</button>
			<div
				id="region"
				style={{
					position: "relative",
					width: 360,
					maxWidth: "calc(100vw - 24px)",
					height: 320,
					display: "flex",
				}}
			>
				<Dock
					mode={mode}
					open={open}
					width="300px"
					onDismiss={() => setOpen(false)}
					aria-label="Details"
				>
					<button id="first" type="button">
						First inside
					</button>
					{nested === "popover" && (
						<Popover>
							<PopoverTrigger asChild>
								<button id="nested-opener" type="button">
									Open nested popover
								</button>
							</PopoverTrigger>
							<PopoverContent>
								<button id="nested-focus" type="button">
									Nested popover action
								</button>
							</PopoverContent>
						</Popover>
					)}
					{nested === "dialog" && (
						<Dialog>
							<DialogTrigger asChild>
								<button id="nested-opener" type="button">
									Open nested dialog
								</button>
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>Nested dialog</DialogTitle>
								<DialogDescription>Local nested details.</DialogDescription>
								<button id="nested-focus" type="button">
									Nested dialog action
								</button>
							</DialogContent>
						</Dialog>
					)}
					<button id="last" type="button">
						Last inside
					</button>
				</Dock>
			</div>
			<button id="after" type="button">
				After dock
			</button>
			<output id="dock-state">{String(open)}</output>
		</div>
	);
}
