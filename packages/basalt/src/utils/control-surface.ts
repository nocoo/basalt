import { cn } from "./cn";

export const BASALT_UI_CLASS = "basalt-ui";

export const BASALT_FOCUS_CLASS = "basalt-focus";

export const CONTROL_SURFACE_CLASS =
	"basalt-ui rounded-basalt-md border border-basalt-border bg-basalt-control shadow-basalt-control";

export function controlSurfaceClass(className?: string) {
	return cn(CONTROL_SURFACE_CLASS, className);
}

export type SelectTriggerSize = "sm" | "md" | "lg";

const SELECT_TRIGGER_SIZE_CLASS: Record<SelectTriggerSize, string> = {
	sm: "basalt-action basalt-action-sm",
	md: "basalt-action",
	lg: "basalt-action basalt-action-lg",
};

export const SELECT_TRIGGER_CHEVRON_CLASS =
	"size-basalt-icon shrink-0 opacity-50 transition-transform basalt-motion duration-basalt-normal group-data-[state=open]/select:rotate-180 motion-reduce:transition-none";

export function selectTriggerClass({
	size = "md",
	className,
}: {
	size?: SelectTriggerSize;
	className?: string;
} = {}) {
	return controlSurfaceClass(
		cn(
			"group/select flex w-full cursor-pointer items-center justify-between gap-basalt-control-gap text-left text-basalt-foreground hover:bg-basalt-hover disabled:cursor-not-allowed disabled:opacity-50",
			SELECT_TRIGGER_SIZE_CLASS[size],
			BASALT_FOCUS_CLASS,
			"aria-invalid:border-basalt-danger-solid aria-invalid:focus-visible:border-basalt-danger-solid",
			className,
		),
	);
}
