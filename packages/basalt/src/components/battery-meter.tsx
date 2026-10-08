import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

export interface BatteryMeterProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
	/** Battery charge in percent, clamped to 0–100. Non-finite readings are unavailable. */
	value: number;
	/** Accessible name of the battery. */
	label: string;
	/** Device state, also announced with the value. @default "discharging" */
	status?: "charging" | "discharging" | "offline";
}

export function BatteryMeter({
	value,
	label,
	status = "discharging",
	className,
	...props
}: BatteryMeterProps) {
	const available = status !== "offline" && Number.isFinite(value);
	const charge = available ? Math.min(100, Math.max(0, value)) : 0;
	const color =
		charge <= 20 ? "bg-basalt-danger" : charge <= 50 ? "bg-basalt-warning" : "bg-basalt-primary";
	return (
		<div
			className={cn(
				BASALT_UI_CLASS,
				"inline-flex items-center gap-basalt-space-lg text-basalt-sm tabular-nums",
				className,
			)}
			{...props}
		>
			{available ? (
				<meter
					className="sr-only"
					min={0}
					max={100}
					low={20}
					high={80}
					optimum={100}
					value={charge}
					aria-label={`${label}, ${status}`}
				/>
			) : (
				<span className="sr-only">{label}: unavailable</span>
			)}
			<span
				aria-hidden="true"
				className="relative inline-flex h-basalt-4 w-basalt-9 gap-basalt-space-xs rounded-basalt-sm border border-basalt-muted-foreground/60 p-basalt-space-xs"
			>
				{[0, 1, 2, 3].map((segment) => (
					<span
						key={segment}
						className="relative flex-1 overflow-hidden rounded-basalt-sm bg-basalt-muted"
					>
						<span
							className={cn("absolute inset-y-0 left-0", color)}
							style={{ width: `${Math.min(100, Math.max(0, charge - segment * 25) * 4)}%` }}
						/>
					</span>
				))}
				<span className="absolute -right-basalt-1 top-basalt-1 h-basalt-1_5 w-basalt-0_5 rounded-r-basalt-sm bg-basalt-muted-foreground/60" />
			</span>
			<span aria-hidden="true" className="min-w-basalt-9 text-basalt-foreground">
				{available ? `${Math.round(charge)}%` : "Offline"}
			</span>
			{status === "charging" && available ? (
				<span className="text-basalt-muted-foreground">Charging</span>
			) : null}
		</div>
	);
}
