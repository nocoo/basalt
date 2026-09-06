import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export type StatCardProps = {
	/**
	 * Secondary heading label for the metric card (overridden by title).
	 */
	label?: string;
	/**
	 * Primary heading title for the metric card (takes precedence over label).
	 */
	title?: string;
	/**
	 * Metric value, formatted via toLocaleString() if a number is provided.
	 * Overridden by the status slot if provided.
	 */
	value: string | number;
	/**
	 * Supporting descriptive subtitle text rendered below value.
	 */
	subtitle?: string;
	/**
	 * Optional decorative Lucide icon component.
	 */
	icon?: LucideIcon;
	/**
	 * Color class applied to the icon wrapper.
	 * @default "text-basalt-muted-foreground"
	 */
	iconColor?: string;
	/**
	 * Structured percentage trend value and optional label.
	 * Overridden by the trendContent slot if provided.
	 */
	trend?: { value: number; label?: string };
	/**
	 * Optional header action or interactive element (e.g. tooltip trigger or button).
	 * Renders alongside the title/icon. Switches card role to group for accessible descendants.
	 */
	action?: ReactNode;
	/**
	 * Optional custom status replacement slot (e.g. loading skeleton, error state, or empty state).
	 * Takes precedence over the default value display and excludes value from accessible name.
	 * Subtitle and trend remain caller-managed; when error/empty state is shown, callers should omit trend.
	 */
	status?: ReactNode;
	/**
	 * Optional custom trend replacement slot (e.g. custom badge, sparkline, or localized trend indicator).
	 * Takes precedence over the default trend calculation and excludes default trend from accessible name.
	 */
	trendContent?: ReactNode;
	/**
	 * Optional custom content rendered below the metric value and above or alongside the trend.
	 */
	children?: ReactNode;
	/**
	 * Explicit accessible label overriding automatic accessible name calculation.
	 */
	ariaLabel?: string;
	/**
	 * Additional CSS class names for styling the card root.
	 */
	className?: string;
};

function hasSlotContent(slot: ReactNode | undefined): boolean {
	return slot !== undefined && slot !== null && slot !== false;
}

export function StatCard({
	label,
	title,
	value,
	subtitle,
	icon: Icon,
	iconColor = "text-basalt-muted-foreground",
	trend,
	action,
	status,
	trendContent,
	children,
	ariaLabel,
	className,
}: StatCardProps) {
	const heading = title ?? label;
	const hasStatus = hasSlotContent(status);
	const hasTrendContent = hasSlotContent(trendContent);
	const hasAction = hasSlotContent(action);
	const hasChildren = hasSlotContent(children);
	const isInteractive = hasAction || hasStatus || hasTrendContent || hasChildren;
	const hasHeaderEnd = hasAction || Boolean(Icon);

	const display = typeof value === "number" ? value.toLocaleString() : value;
	const isPositiveTrend = trend && trend.value > 0;
	const isNegativeTrend = trend && trend.value < 0;

	// Accessible name: If custom status or custom trendContent is provided, do not report
	// the overridden hidden default value or default trend to assistive technology.
	const named =
		ariaLabel ??
		[
			heading,
			!hasStatus ? display : null,
			subtitle,
			!hasTrendContent && trend
				? `${isPositiveTrend ? "+" : ""}${trend.value}% ${trend.label ?? ""}`
				: null,
		]
			.filter(Boolean)
			.join(" ")
			.trim();

	const cardContent = (
		<>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1 space-y-1">
					<p className="text-xs text-basalt-muted-foreground md:text-sm">{heading}</p>
					{hasStatus ? (
						<div className="pt-0.5">{status}</div>
					) : (
						<p className="font-display text-xl font-semibold tracking-tight text-basalt-foreground md:text-2xl">
							{display}
						</p>
					)}
					{subtitle ? <p className="text-xs text-basalt-muted-foreground">{subtitle}</p> : null}
				</div>
				{hasHeaderEnd ? (
					<div className="flex items-center gap-2 shrink-0">
						{hasAction ? <div className="flex items-center">{action}</div> : null}
						{Icon ? (
							<div className={cn("rounded-md bg-basalt-card p-2", iconColor)}>
								<Icon className="h-5 w-5" strokeWidth={1.5} />
							</div>
						) : null}
					</div>
				) : null}
			</div>

			{hasChildren ? <div className="mt-2">{children}</div> : null}

			{hasTrendContent ? (
				<div className="mt-3 flex items-center gap-1 text-xs">{trendContent}</div>
			) : trend ? (
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
		</>
	);

	if (isInteractive) {
		return (
			<div
				className={cn(
					"rounded-basalt-md border border-basalt-border bg-basalt-secondary p-4",
					className,
				)}
				role="group"
				aria-label={named}
			>
				{cardContent}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"rounded-basalt-md border border-basalt-border bg-basalt-secondary p-4",
				className,
			)}
			role="img"
			aria-label={named}
		>
			{cardContent}
		</div>
	);
}

export type StatGridProps = {
	children: ReactNode;
	columns?: 2 | 3 | 4;
	className?: string;
};

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
	const gridCols = {
		2: "grid-cols-1 sm:grid-cols-2",
		3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
	};
	return <div className={cn("grid gap-3 md:gap-4", gridCols[columns], className)}>{children}</div>;
}
