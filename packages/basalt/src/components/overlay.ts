import { cn } from "../utils/cn";

/** Gap between a field trigger and its list. Matches Kumo Select/Combobox. */
export const OVERLAY_GAP = 4;
/** Gap between a menu trigger and its panel. Matches Kumo Dropdown/Popover. */
export const MENU_GAP = 8;

/** Recolor the existing 1px border. No extra ring, no layout shift. */
export const FOCUS_BORDER = "outline-hidden focus-visible:border-basalt-ring";
/** Inset 1px theme ring for borderless controls. Outer size stays put. */
export const FOCUS_INSET =
	"outline-hidden focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-basalt-ring";
/** Offset ring stays visible on primary fills (ring token equals primary). */
export const FOCUS_RING =
	"outline-hidden focus-visible:ring-2 focus-visible:ring-basalt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-basalt-background";

export function overlayPanelClass(className?: string) {
	return cn(
		"z-50 overflow-hidden rounded-basalt-md border border-basalt-border bg-basalt-popover py-1.5 text-sm text-basalt-popover-foreground shadow-md motion-reduce:animate-none motion-reduce:transition-none",
		className,
	);
}

export function overlayItemClass(className?: string) {
	return cn(
		"mx-1.5 flex w-[calc(100%-0.75rem)] cursor-default items-center rounded-basalt-sm px-2 py-1.5 text-left text-sm outline-hidden select-none",
		className,
	);
}
