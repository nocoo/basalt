import * as Progress from "@radix-ui/react-progress";
import { cn } from "../utils/cn";

export interface MeterProps {
	/**
	 * Percentage value representing current meter progress (0..100).
	 *
	 * Note: Rendered bar width is clamped to [0, 100]%; callers should provide 0..100,
	 * while underlying Radix validates and manages accessible value attributes.
	 * Does not support arbitrary native HTML props, ref forwarding, min/max, or change callbacks.
	 * @default 0
	 */
	value?: number;
	/**
	 * Text label displayed above the meter bar and used as accessible name fallback.
	 */
	label?: string;
	/**
	 * Custom text overriding the displayed percentage value text next to the label.
	 */
	customValue?: string;
	/**
	 * Whether to hide the displayed value text next to the label.
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
	return (
		<div className={cn("w-full space-y-1", className)}>
			{label || (!hideValue && customValue) ? (
				<div className="flex justify-between text-xs text-basalt-muted-foreground">
					<span>{label}</span>
					{hideValue ? null : <span>{customValue ?? `${value}%`}</span>}
				</div>
			) : null}
			<Progress.Root
				value={value}
				aria-label={ariaLabel ?? label}
				className="relative h-2 overflow-hidden rounded-full bg-basalt-muted"
			>
				<Progress.Indicator
					className="h-full bg-basalt-primary transition-[width]"
					style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
				/>
			</Progress.Root>
		</div>
	);
}
