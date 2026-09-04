import * as React from "react";
import { cn } from "../utils/cn";
import { Button, type ButtonProps } from "./button";
import { OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

export interface FabProps extends Omit<ButtonProps, "size"> {
	/**
	 * When true, the launcher hides so a dock or panel can take the corner.
	 * @default false
	 */
	open?: boolean;
}

export const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
	({ open = false, className, children, onClick, "aria-label": ariaLabel, ...props }, ref) => (
		<Button
			ref={ref}
			size="icon"
			aria-label={ariaLabel}
			aria-expanded={open}
			aria-hidden={open || undefined}
			tabIndex={open ? -1 : 0}
			inert={open || undefined}
			onClick={open ? undefined : onClick}
			className={cn(
				"fixed right-4 bottom-4 h-16 w-16 rounded-full shadow-lg",
				OVERLAY_LAYER,
				"transition-[transform,opacity] duration-300 ease-in-out",
				OVERLAY_MOTION,
				open ? "pointer-events-none scale-75 opacity-0" : "hover:scale-[1.03] active:scale-[0.98]",
				className,
			)}
			{...props}
		>
			{children}
		</Button>
	),
);
Fab.displayName = "Fab";
