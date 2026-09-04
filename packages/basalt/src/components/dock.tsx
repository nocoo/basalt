import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { OVERLAY_MOTION } from "./overlay";

export interface DockProps extends HTMLAttributes<HTMLElement> {
	/**
	 * Whether the dock occupies its width.
	 */
	open: boolean;
	/**
	 * Width when open.
	 * @default "clamp(300px, 32.5vw, 546px)"
	 */
	width?: string;
	/**
	 * Docked panel content. Kept at full width while the rail animates.
	 */
	children: ReactNode;
}

export function Dock({
	open,
	width = "clamp(300px, 32.5vw, 546px)",
	className,
	style,
	children,
	...props
}: DockProps) {
	return (
		<aside
			className={cn(
				"sticky top-0 h-screen shrink-0 overflow-hidden bg-basalt-background transition-[width] duration-300 ease-in-out",
				OVERLAY_MOTION,
				className,
			)}
			style={{ width: open ? width : 0, ...style }}
			aria-hidden={!open}
			inert={!open || undefined}
			{...props}
		>
			<div className="flex h-full flex-col" style={{ width }}>
				{children}
			</div>
		</aside>
	);
}
