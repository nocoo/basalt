import { cn } from "../utils/cn";

export const CONTROL_SURFACE_CLASS =
	"rounded-basalt-md border border-basalt-border bg-basalt-secondary text-sm";

export function controlSurfaceClass(className?: string) {
	return cn(CONTROL_SURFACE_CLASS, className);
}
