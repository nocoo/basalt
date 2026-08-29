import { cn } from "../utils/cn";

/** Gap between a field trigger and its list. Matches Kumo Select/Combobox. */
export const OVERLAY_GAP = 4;
/** Gap between a menu trigger and its panel. Matches Kumo Dropdown/Popover. */
export const MENU_GAP = 8;

export function overlayPanelClass(className?: string) {
	return cn(
		"z-50 overflow-hidden rounded-basalt-md border border-basalt-border bg-basalt-popover py-1.5 text-sm text-basalt-popover-foreground shadow-md",
		className,
	);
}

export function overlayItemClass(className?: string) {
	return cn(
		"mx-1.5 flex w-[calc(100%-0.75rem)] cursor-default items-center rounded-basalt-sm px-2 py-1.5 text-left text-sm outline-hidden select-none",
		className,
	);
}
