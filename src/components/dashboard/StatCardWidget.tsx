import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Icon color class */
  iconColor?: string;
  /** Trend indicator (positive = up, negative = down) */
  trend?: {
    value: number;
    label?: string;
  };
  /** Additional class name */
  className?: string;
}

/**
 * A compact stat/metric card that shows a title, large value, optional icon,
 * and an optional trend indicator.
 *
 * Uses basalt's L2 card style (bg-secondary, rounded-card, no border/shadow).
 */
export function StatCardWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-muted-foreground",
  trend,
  className,
}: StatCardProps) {
  const isPositiveTrend = trend && trend.value > 0;
  const isNegativeTrend = trend && trend.value < 0;

  return (
    <div
      className={cn(
        "rounded-card bg-secondary p-4 md:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs md:text-sm text-muted-foreground">{title}</p>
          <p className="text-xl md:text-2xl font-semibold text-foreground font-display tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("rounded-md bg-card p-2", iconColor)}>
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span
            className={cn(
              "font-medium",
              isPositiveTrend && "text-success",
              isNegativeTrend && "text-destructive",
              !isPositiveTrend && !isNegativeTrend && "text-muted-foreground",
            )}
          >
            {isPositiveTrend && "+"}
            {trend.value}%
          </span>
          {trend.label && (
            <span className="text-muted-foreground">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}

export interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * Responsive grid layout for StatCardWidget items.
 * Defaults to 4 columns on large screens, collapsing to 2 → 1.
 */
export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3 md:gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}
