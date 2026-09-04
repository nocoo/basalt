import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { dialogOverlayClass } from "./dialog";
import { OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

export type DockMode = "push" | "overlay";

export interface DockProps extends HTMLAttributes<HTMLElement> {
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
	 * Docked panel content. Kept at full width while the rail animates.
	 */
	children: ReactNode;
}

export function Dock({
	open,
	mode = "push",
	width = "clamp(300px, 32.5vw, 546px)",
	onDismiss,
	className,
	style,
	children,
	...props
}: DockProps) {
	const overlay = mode === "overlay";
	const panelClass = cn(
		"overflow-hidden bg-basalt-background transition-[width] duration-300 ease-in-out",
		overlay ? cn("absolute top-0 right-0 h-full", OVERLAY_LAYER) : "sticky top-0 h-screen shrink-0",
		OVERLAY_MOTION,
		className,
	);
	const panelStyle = { width: open ? width : 0, ...style };
	const inner = (
		<div className="flex h-full flex-col" style={{ width }}>
			{children}
		</div>
	);

	if (!overlay) {
		return (
			<aside
				className={panelClass}
				style={panelStyle}
				aria-hidden={!open}
				inert={!open || undefined}
				{...props}
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
				className={panelClass}
				style={panelStyle}
				aria-hidden={!open}
				inert={!open || undefined}
				{...props}
			>
				{inner}
			</div>
		</div>
	);
}
