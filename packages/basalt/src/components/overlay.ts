import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

/** Gap between a field trigger and its list. Matches Kumo Select/Combobox. */
export const OVERLAY_GAP = 4;
/** Gap between a menu trigger and its panel. Matches Kumo Dropdown/Popover. */
export const MENU_GAP = 8;
/** Shared stacking layer for portals, menus, and chrome overlays. */
export const OVERLAY_LAYER = "z-50";
/** Kill CSS animation and transition when the user prefers reduced motion. */
export const OVERLAY_MOTION = "motion-reduce:animate-none motion-reduce:transition-none";

export const FOCUS_RING = "basalt-focus";
export const FOCUS_BORDER = FOCUS_RING;
export const FOCUS_INSET = "basalt-focus basalt-focus-inset";

export function overlayPanelClass(className?: string) {
	return cn(
		BASALT_UI_CLASS,
		OVERLAY_LAYER,
		"basalt-floating overflow-hidden rounded-basalt-md border border-basalt-border bg-basalt-popover py-basalt-menu-inset text-basalt-base text-basalt-popover-foreground shadow-md",
		OVERLAY_MOTION,
		className,
	);
}

export function overlayItemClass(className?: string) {
	return cn(
		"mx-basalt-menu-inset flex min-h-basalt-menu-row w-[calc(100%-var(--basalt-space-menu-inset)*2)] cursor-default items-center gap-basalt-row-gap rounded-basalt-sm px-basalt-menu-x py-basalt-menu-y text-left text-basalt-base leading-basalt-row select-none",
		FOCUS_INSET,
		className,
	);
}
