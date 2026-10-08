import * as Progress from "@radix-ui/react-progress";
import { cn } from "../utils/cn";

export interface MeterProps {
	/**
	 * Percentage value representing current meter progress (0..100).
	 *
	 * Values are clamped to [0, 100] for both segments and accessibility.
	 * Non-finite readings are displayed as unavailable.
	 * Does not support arbitrary native HTML props, ref forwarding, min/max, or change callbacks.
	 * @default 0
	 */
	value?: number;
	/**
	 * Text label displayed above the segmented meter and used as accessible name fallback.
	 */
	label?: string;
	/**
	 * Custom text overriding the value displayed beside the segments.
	 */
	customValue?: string;
	/**
	 * Whether to hide the value displayed beside the segments.
	 * @default false
	 */
	hideValue?: boolean;
	/**
	 * Additional CSS classes applied to the root container.
	 */
	className?: string;
	/**
	 * Accessible label announced for assistive technologies. Takes precedence over `label`.
	 */
	"aria-label"?: string;
}

export function Meter({
	value = 0,
	label,
	customValue,
	hideValue = false,
	className,
	"aria-label": ariaLabel,
}: MeterProps) {
	const reading = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null;
	const filled = Math.round(((reading ?? 0) / 100) * 17);
	const redEnd = Math.floor(filled / 3);
	const yellowEnd = redEnd + Math.ceil(filled / 3);
	return (
		<div className={cn("w-full space-y-basalt-space-sm", className)}>
			{label ? <div className="text-basalt-sm text-basalt-muted-foreground">{label}</div> : null}
			<div className="flex items-center gap-basalt-space-lg">
				<Progress.Root
					data-basalt-meter=""
					value={reading}
					aria-label={ariaLabel ?? label}
					aria-valuetext={reading === null ? "Unavailable" : customValue}
					className="h-basalt-3_5 min-w-0 flex-1 overflow-hidden rounded-basalt-sm bg-basalt-muted p-basalt-space-xs"
				>
					<Progress.Indicator className="flex h-full gap-basalt-space-xs" aria-hidden="true">
						{Array.from({ length: 17 }, (_, index) => (
							<span
								key={`segment-${index}`}
								data-filled={index < filled}
								className={cn(
									"h-full min-w-0 flex-1 rounded-basalt-sm",
									index >= filled
										? "bg-basalt-foreground/10"
										: index < redEnd
											? "bg-basalt-danger"
											: index < yellowEnd
												? "bg-[hsl(var(--basalt-chart-yellow))]"
												: "bg-[hsl(var(--basalt-chart-green))]",
								)}
							/>
						))}
					</Progress.Indicator>
				</Progress.Root>
				{hideValue ? null : (
					<span className="shrink-0 text-basalt-sm tabular-nums text-basalt-foreground">
						{customValue ?? (reading === null ? "Unavailable" : `${reading}%`)}
					</span>
				)}
			</div>
		</div>
	);
}
