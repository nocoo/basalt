import * as Progress from "@radix-ui/react-progress";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

const SEGMENT_COUNT = 20;

const TONE_FILL_CLASSES = {
	default: "bg-basalt-primary",
	success: "bg-basalt-success-solid",
	warning: "bg-basalt-warning-solid",
	danger: "bg-basalt-danger-solid",
} as const;

const BAR_SIZE_CLASSES = {
	sm: "h-basalt-1_5",
	md: "h-basalt-2",
	lg: "h-basalt-3",
} as const;

const SEGMENTED_SIZE_CLASSES = {
	sm: "h-basalt-2",
	md: "h-basalt-2_5",
	lg: "h-basalt-3_5",
} as const;

export interface MeterProps {
	/**
	 * Percentage value representing current meter progress (0..100).
	 *
	 * Values are clamped to [0, 100] for both geometry and accessibility.
	 * Non-finite readings are displayed as unavailable.
	 * Does not support arbitrary native HTML props, ref forwarding, min/max, or change callbacks.
	 * @default 0
	 */
	value?: number;
	/**
	 * Text label displayed above the meter and used as accessible name fallback.
	 */
	label?: string;
	/**
	 * Custom text overriding the reading displayed with the meter.
	 */
	customValue?: string;
	/**
	 * Whether to hide the displayed reading.
	 * @default false
	 */
	hideValue?: boolean;
	/**
	 * Visual presentation of the meter track.
	 * @default "bar"
	 */
	variant?: "bar" | "segmented";
	/**
	 * Semantic fill tone or threshold-driven automatic tone (`warning >= 70`, `danger >= 90`).
	 * @default "default"
	 */
	tone?: "default" | "success" | "warning" | "danger" | "auto";
	/**
	 * Height tier of the meter track.
	 * @default "md"
	 */
	size?: "sm" | "md" | "lg";
	/**
	 * Additional CSS classes applied to the root container.
	 */
	className?: string;
	/**
	 * Accessible label announced for assistive technologies. Takes precedence over `label`.
	 */
	"aria-label"?: string;
}

/** Matte capacity and utilization meter with continuous bar and segmented tracks. */
export function Meter({
	value = 0,
	label,
	customValue,
	hideValue = false,
	variant = "bar",
	tone = "default",
	size = "md",
	className,
	"aria-label": ariaLabel,
}: MeterProps) {
	const reading = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null;
	const resolvedTone =
		tone === "auto"
			? (reading ?? 0) >= 90
				? "danger"
				: (reading ?? 0) >= 70
					? "warning"
					: "default"
			: tone;
	const fillClass = TONE_FILL_CLASSES[resolvedTone];
	const filledSegments =
		reading !== null && reading > 0 ? Math.max(1, Math.round((reading / 100) * SEGMENT_COUNT)) : 0;
	const displayValue = customValue ?? (reading === null ? "Unavailable" : `${reading}%`);

	const track = (
		<Progress.Root
			data-basalt-meter=""
			data-variant={variant}
			data-tone={resolvedTone}
			data-size={size}
			role="meter"
			value={reading}
			aria-label={ariaLabel ?? label}
			aria-valuetext={reading === null ? "Unavailable" : customValue}
			className={cn(
				"min-w-0 w-full flex-1",
				variant === "bar"
					? cn(
							"basalt-meter-track relative overflow-hidden rounded-basalt-full",
							BAR_SIZE_CLASSES[size],
						)
					: SEGMENTED_SIZE_CLASSES[size],
			)}
		>
			{variant === "bar" ? (
				<Progress.Indicator
					data-slot="meter-indicator"
					aria-hidden="true"
					style={{ transform: `translateX(-${100 - (reading ?? 0)}%)` }}
					className={cn(
						"basalt-meter-fill block h-full w-full rounded-basalt-full",
						fillClass,
						(reading ?? 0) === 0 && "opacity-0",
					)}
				/>
			) : (
				<Progress.Indicator
					data-slot="meter-indicator"
					className="flex h-full w-full gap-basalt-space-xs"
					aria-hidden="true"
				>
					{Array.from({ length: SEGMENT_COUNT }, (_, index) => {
						const filled = index < filledSegments;
						return (
							<span
								key={`segment-${index}`}
								data-slot="meter-cell"
								data-filled={filled}
								className={cn(
									"basalt-meter-cell h-full min-w-0 flex-1 rounded-basalt-sm",
									filled && fillClass,
								)}
							/>
						);
					})}
				</Progress.Indicator>
			)}
		</Progress.Root>
	);

	if (label) {
		return (
			<div className={cn(BASALT_UI_CLASS, "w-full space-y-basalt-space-md", className)}>
				<div className="flex items-baseline justify-between gap-basalt-space-lg">
					<span
						data-slot="meter-label"
						className="min-w-0 truncate text-basalt-sm font-medium text-basalt-foreground"
					>
						{label}
					</span>
					{hideValue ? null : (
						<span
							data-slot="meter-value"
							className="shrink-0 font-basalt-mono text-basalt-sm tabular-nums text-basalt-muted-foreground"
						>
							{displayValue}
						</span>
					)}
				</div>
				{track}
			</div>
		);
	}

	if (hideValue) {
		return <div className={cn(BASALT_UI_CLASS, "w-full", className)}>{track}</div>;
	}

	return (
		<div className={cn(BASALT_UI_CLASS, "flex w-full items-center gap-basalt-space-lg", className)}>
			{track}
			<span
				data-slot="meter-value"
				className={cn(
					"shrink-0 font-basalt-mono text-basalt-xs tabular-nums text-basalt-muted-foreground",
					customValue === undefined && reading !== null && "min-w-[3.5ch] text-end",
				)}
			>
				{displayValue}
			</span>
		</div>
	);
}
