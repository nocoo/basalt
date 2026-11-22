import { cn } from "./cn";
import { overlayItemClass } from "./overlay";

export const MENU_PANEL_CLASS = "basalt-hover-list min-w-basalt-40";

export const MENU_INDICATOR_SLOT_CLASS =
	"pointer-events-none absolute start-basalt-menu-x flex size-basalt-icon-sm items-center justify-center";

const MENU_INDENT_CLASS =
	"ps-[calc(var(--basalt-space-menu-x)+var(--basalt-size-icon-sm)+var(--basalt-space-row-gap))]";

export function menuItemClass({
	variant = "default",
	inset = false,
	className,
}: {
	variant?: "default" | "destructive";
	inset?: boolean;
	className?: string;
} = {}) {
	return overlayItemClass(
		cn(
			"relative focus:bg-basalt-hover [.basalt-hover-list_&]:focus:bg-transparent data-disabled:pointer-events-none data-disabled:opacity-50",
			variant === "destructive" && "text-basalt-danger focus:text-basalt-danger",
			inset && MENU_INDENT_CLASS,
			className,
		),
	);
}

export function menuCheckableItemClass(className?: string) {
	return menuItemClass({ className: cn(MENU_INDENT_CLASS, "pe-basalt-menu-x", className) });
}

export function menuLabelClass(inset = false, className?: string) {
	return cn(
		"px-basalt-menu-x py-basalt-space-sm text-basalt-xs font-medium text-basalt-muted-foreground",
		inset && MENU_INDENT_CLASS,
		className,
	);
}

export function menuSeparatorClass(className?: string) {
	return cn("-mx-basalt-menu-inset my-basalt-menu-inset h-px bg-basalt-border", className);
}

export function menuShortcutClass(className?: string) {
	return cn(
		"ms-auto font-basalt-mono text-basalt-xs tracking-wider text-basalt-muted-foreground",
		className,
	);
}
