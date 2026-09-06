import { cn } from "./cn";

export const BASALT_UI_CLASS = "basalt-ui";

export const CONTROL_SURFACE_CLASS =
	"basalt-ui rounded-basalt-md border border-basalt-border bg-basalt-control text-sm";

export function controlSurfaceClass(className?: string) {
	return cn(CONTROL_SURFACE_CLASS, className);
}
