import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { dialogOverlayClass } from "./dialog";
import { OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

export type DockMode = "overlay" | "push";

export interface DockProps {
	/**
	 * Whether the dock occupies its width.
	 */
	open: boolean;
	/**
	 * `push` shrinks the main column. `overlay` covers it with a Dialog scrim.
	 * @default "push"
	 */
	mode?: DockMode;
	/**
	 * Width when open.
	 * @default "clamp(300px, 32.5vw, 546px)"
	 */
	width?: string;
	/**
	 * Overlay scrim click. Ignored in push mode.
	 */
	onDismiss?: () => void;
	/**
	 * Accessible name.
	 */
	"aria-label": string;
	className?: string;
	children: ReactNode;
}

export interface DockBodyProps {
	className?: string;
	children: ReactNode;
}

export function DockBody({ className, children }: DockBodyProps) {
	return (
		<div className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3", className)}>
			{children}
		</div>
	);
}

export function Dock({
	open,
	mode = "push",
	width = "clamp(300px, 32.5vw, 546px)",
	onDismiss,
	className,
	children,
	"aria-label": ariaLabel,
}: DockProps) {
	const overlay = mode === "overlay";
	const panelClass = cn(
		"overflow-hidden bg-basalt-background transition-[width] duration-300 ease-in-out",
		overlay ? cn("absolute top-0 right-0 h-full", OVERLAY_LAYER) : "sticky top-0 h-screen shrink-0",
		OVERLAY_MOTION,
		className,
	);
	const panelStyle = { width: open ? width : 0 };
	const inner = (
		<div
			className="flex h-full flex-col bg-basalt-card shadow-lg ring-1 ring-basalt-border/40"
			style={{ width }}
		>
			{children}
		</div>
	);

	if (!overlay) {
		return (
			<aside
				className={panelClass}
				style={panelStyle}
				aria-label={ariaLabel}
				aria-hidden={!open}
				inert={!open || undefined}
			>
				{inner}
			</aside>
		);
	}

	return (
		<div className={cn("absolute inset-0", OVERLAY_LAYER, !open && "pointer-events-none")}>
			<button
				type="button"
				tabIndex={open ? 0 : -1}
				aria-label="Dismiss"
				aria-hidden={!open}
				data-state={open ? "open" : "closed"}
				className={cn(dialogOverlayClass("absolute"), !open && "opacity-0")}
				onClick={open ? onDismiss : undefined}
			/>
			<div
				role="dialog"
				aria-modal={open ? true : undefined}
				aria-label={ariaLabel}
				className={panelClass}
				style={panelStyle}
				aria-hidden={!open}
				inert={!open || undefined}
			>
				{inner}
			</div>
		</div>
	);
}
