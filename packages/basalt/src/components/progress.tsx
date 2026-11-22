import * as ProgressPrimitive from "@radix-ui/react-progress";
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

export type ProgressSize = "sm" | "md" | "lg";

export type ProgressTone = "default" | "success" | "warning" | "danger";

const SIZE_CLASSES: Record<ProgressSize, string> = {
	sm: "h-basalt-1_5",
	md: "h-basalt-2",
	lg: "h-basalt-3",
};

const TONE_FILL_CLASSES: Record<ProgressTone, string> = {
	default: "bg-basalt-primary",
	success: "bg-basalt-success-solid",
	warning: "bg-basalt-warning-solid",
	danger: "bg-basalt-danger-solid",
};

export interface ProgressProps
	extends Omit<ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "value" | "max"> {
	/**
	 * Current completion value in `0..max`. Omit or pass `null` for an indeterminate task.
	 */
	value?: number | null;
	/**
	 * Maximum completion bound. Must be a positive finite number.
	 * @default 100
	 */
	max?: number;
	/**
	 * Height tier of the progress track.
	 * @default "md"
	 */
	size?: ProgressSize;
	/**
	 * Semantic fill tone of the active bar.
	 * @default "default"
	 */
	tone?: ProgressTone;
}

/** Matte horizontal task progress bar supporting determinate completion and indeterminate motion. */
export const Progress = forwardRef<ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
	function Progress({ value, max = 100, size = "md", tone = "default", className, ...props }, ref) {
		const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
		const isDeterminate = value !== undefined && value !== null && Number.isFinite(value);
		const clamped = isDeterminate ? Math.min(safeMax, Math.max(0, value)) : null;
		const percent = clamped !== null ? (clamped / safeMax) * 100 : null;
		const state = clamped === null ? "indeterminate" : clamped >= safeMax ? "complete" : "loading";

		return (
			<ProgressPrimitive.Root
				ref={ref}
				value={clamped}
				max={safeMax}
				data-slot="progress"
				data-size={size}
				data-tone={tone}
				data-state={state}
				className={cn(
					BASALT_UI_CLASS,
					"basalt-meter-track relative w-full overflow-hidden rounded-basalt-full",
					SIZE_CLASSES[size],
					className,
				)}
				{...props}
			>
				<ProgressPrimitive.Indicator
					data-slot="progress-indicator"
					aria-hidden="true"
					style={percent !== null ? { transform: `translateX(-${100 - percent}%)` } : undefined}
					className={cn(
						"basalt-meter-fill block h-full w-full rounded-basalt-full",
						TONE_FILL_CLASSES[tone],
						percent === null &&
							"origin-left animate-basalt-progress-indeterminate motion-reduce:w-2/5 motion-reduce:translate-x-3/4 motion-reduce:animate-none",
						percent === 0 && "opacity-0",
					)}
				/>
			</ProgressPrimitive.Root>
		);
	},
);

Progress.displayName = "Progress";
