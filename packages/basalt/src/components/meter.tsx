import * as Progress from "@radix-ui/react-progress";
import { cn } from "../utils/cn";

export function Meter({
	value = 0,
	label,
	customValue,
	hideValue = false,
	className,
	"aria-label": ariaLabel,
}: {
	value?: number;
	label?: string;
	customValue?: string;
	hideValue?: boolean;
	className?: string;
	"aria-label"?: string;
}) {
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
