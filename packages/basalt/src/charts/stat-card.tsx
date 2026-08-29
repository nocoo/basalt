import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function StatCard({
	label = "Requests",
	title,
	value = "12.4k",
	subtitle,
	icon: Icon,
	iconColor = "text-basalt-muted-foreground",
	trend,
	ariaLabel,
	className,
}: {
	label?: string;
	title?: string;
	value?: string | number;
	subtitle?: string;
	icon?: LucideIcon;
	iconColor?: string;
	trend?: { value: number; label?: string };
	ariaLabel?: string;
	className?: string;
}) {
	const heading = title ?? label;
	const display = typeof value === "number" ? value.toLocaleString() : value;
	const isPositiveTrend = trend && trend.value > 0;
	const isNegativeTrend = trend && trend.value < 0;
	return (
		<div
			className={cn(
				"rounded-basalt-md border border-basalt-border bg-basalt-secondary p-4",
				className,
			)}
			role="img"
			aria-label={ariaLabel ?? `${heading} ${display}`}
		>
			<div className="flex items-start justify-between">
				<div className="space-y-1">
					<p className="text-xs text-basalt-muted-foreground md:text-sm">{heading}</p>
					<p className="font-display text-xl font-semibold tracking-tight text-basalt-foreground md:text-2xl">
						{display}
					</p>
					{subtitle ? <p className="text-xs text-basalt-muted-foreground">{subtitle}</p> : null}
				</div>
				{Icon ? (
					<div className={cn("rounded-md bg-basalt-card p-2", iconColor)}>
						<Icon className="h-5 w-5" strokeWidth={1.5} />
					</div>
				) : null}
			</div>
			{trend ? (
				<div className="mt-3 flex items-center gap-1 text-xs">
					<span
						className={cn(
							"font-medium",
							isPositiveTrend && "text-basalt-heatmap-green-4",
							isNegativeTrend && "text-basalt-destructive",
							!isPositiveTrend && !isNegativeTrend && "text-basalt-muted-foreground",
						)}
					>
						{`${isPositiveTrend ? "+" : ""}${trend.value}%`}
					</span>
					{trend.label ? <span className="text-basalt-muted-foreground">{trend.label}</span> : null}
				</div>
			) : null}
		</div>
	);
}

export function StatGrid({
	children,
	columns = 4,
	className,
}: {
	children: ReactNode;
	columns?: 2 | 3 | 4;
	className?: string;
}) {
	const gridCols = {
		2: "grid-cols-1 sm:grid-cols-2",
		3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
	};
	return <div className={cn("grid gap-3 md:gap-4", gridCols[columns], className)}>{children}</div>;
}
