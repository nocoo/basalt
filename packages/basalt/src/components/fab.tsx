import * as React from "react";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

export type FabPlacement = "absolute" | "fixed";

export interface FabProps {
	/**
	 * When true, the launcher hides so a dock can take the corner.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Viewport pin versus containing frame.
	 * @default "fixed"
	 */
	placement?: FabPlacement;
	/**
	 * Accessible name.
	 */
	"aria-label": string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	children?: React.ReactNode;
	className?: string;
	disabled?: boolean;
}

export const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
	(
		{
			open = false,
			placement = "fixed",
			className,
			children,
			onClick,
			"aria-label": ariaLabel,
			disabled,
		},
		ref,
	) => (
		<Button
			ref={ref}
			size="icon"
			aria-label={ariaLabel}
			aria-expanded={open}
			aria-hidden={open || undefined}
			tabIndex={open ? -1 : 0}
			inert={open || undefined}
			disabled={disabled}
			onClick={open ? undefined : onClick}
			className={cn(
				placement === "absolute" ? "absolute" : "fixed",
				"right-4 bottom-4 h-16 w-16 rounded-full shadow-lg",
				OVERLAY_LAYER,
				"transition-[transform,opacity] duration-300 ease-in-out",
				OVERLAY_MOTION,
				open ? "pointer-events-none scale-75 opacity-0" : "hover:scale-[1.03] active:scale-[0.98]",
				className,
			)}
		>
			{children}
		</Button>
	),
);
Fab.displayName = "Fab";
