import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { LayerCard } from "../components/layer-card";
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
	 * Color class applied to the decorative icon.
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
	 * Optional supporting content rendered below the value, subtitle, and trend in the same surface.
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

	return (
		<LayerCard
			data-slot="stat-card"
			className={cn(
				"flex min-w-0 flex-col gap-basalt-card-sm overflow-visible [overflow-wrap:anywhere]",
				className,
			)}
			role={isInteractive ? "group" : "img"}
			aria-label={named}
		>
			{heading || Icon || hasAction ? (
				<div
					data-slot="stat-card-heading"
					className="flex items-center justify-between gap-basalt-space-lg"
				>
					<div className="flex min-w-0 items-start gap-basalt-space-lg">
						{Icon ? (
							<Icon
								aria-hidden="true"
								className={cn("mt-basalt-space-xs size-basalt-icon-lg shrink-0", iconColor)}
								strokeWidth={1.5}
							/>
						) : null}
						<p className="min-w-0 text-basalt-base font-medium text-basalt-muted-foreground">
							{heading}
						</p>
					</div>
					{hasAction ? <div className="flex shrink-0 items-center">{action}</div> : null}
				</div>
			) : null}
			<div data-slot="stat-card-metric" className="min-w-0 space-y-basalt-space-sm">
				{hasStatus ? (
					<div>{status}</div>
				) : (
					<p
						data-slot="stat-card-value"
						className="font-basalt-display text-basalt-4xl leading-basalt-tight font-semibold tracking-tight tabular-nums text-basalt-foreground"
					>
						{display}
					</p>
				)}
				{subtitle ? (
					<p className="text-basalt-sm text-basalt-muted-foreground">{subtitle}</p>
				) : null}
				{hasTrendContent ? (
					<div
						data-slot="stat-card-trend"
						className="flex flex-wrap items-baseline gap-x-basalt-space-md gap-y-basalt-space-xs text-basalt-sm"
					>
						{trendContent}
					</div>
				) : trend ? (
					<div
						data-slot="stat-card-trend"
						className="flex flex-wrap items-baseline gap-x-basalt-space-md gap-y-basalt-space-xs text-basalt-sm"
					>
						<span
							className={cn(
								"font-medium tabular-nums",
								isPositiveTrend && "text-basalt-tag-success-foreground",
								isNegativeTrend && "text-basalt-destructive",
								!isPositiveTrend && !isNegativeTrend && "text-basalt-muted-foreground",
							)}
						>
							{`${isPositiveTrend ? "+" : ""}${trend.value}%`}
						</span>
						{trend.label ? (
							<span className="text-basalt-muted-foreground">{trend.label}</span>
						) : null}
					</div>
				) : null}
			</div>
			{hasChildren ? (
				<div data-slot="stat-card-content" className="mt-auto min-w-0">
					{children}
				</div>
			) : null}
		</LayerCard>
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
	return (
		<div className={cn("grid gap-basalt-layout", gridCols[columns], className)}>{children}</div>
	);
}
