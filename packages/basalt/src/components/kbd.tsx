import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

export type KbdSize = "sm" | "md";

const SIZE_CLASSES: Record<KbdSize, string> = {
	sm: "min-h-basalt-5 px-basalt-space-md py-basalt-space-xs text-basalt-xs",
	md: "min-h-basalt-6 px-basalt-space-lg py-basalt-space-sm text-basalt-sm",
};

export interface KbdProps extends ComponentPropsWithoutRef<"kbd"> {
	/**
	 * Visual size tier of the keycap badge.
	 * @default "sm"
	 */
	size?: KbdSize;
}

/** Matte keyboard shortcut keycap for inline hints, triggers, and command rows. */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
	{ size = "sm", className, ...props },
	ref,
) {
	return (
		<kbd
			ref={ref}
			data-slot="kbd"
			data-size={size}
			className={cn(
				BASALT_UI_CLASS,
				"inline-flex shrink-0 select-none items-center justify-center rounded-basalt-sm border border-basalt-border bg-basalt-card font-basalt-mono font-medium text-basalt-muted-foreground shadow-basalt-control",
				SIZE_CLASSES[size],
				className,
			)}
			{...props}
		/>
	);
});

Kbd.displayName = "Kbd";
