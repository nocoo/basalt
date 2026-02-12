import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SlotBarItem {
  /** Color class (e.g. "bg-indigo-800") or CSS color string */
  color: string;
  /** Optional height ratio 0-1. Defaults to 1 (full height). */
  height?: number;
  /** Optional tooltip label */
  label?: string;
}

export interface SlotBarChartProps {
  /** Array of bar items to render */
  items: SlotBarItem[];
  /** Chart height. Defaults to "h-6" */
  heightClass?: string;
  /** Gap between bars. Defaults to "gap-px" */
  gapClass?: string;
  /** Class for empty/zero-height bars. Defaults to "bg-muted" */
  emptyClass?: string;
  /** Additional class name for the container */
  className?: string;
}

/**
 * SlotBarChart renders a horizontal row of equally-spaced vertical bars.
 *
 * Each bar has a configurable color and optional height ratio (0-1).
 * Supports three common patterns:
 * - **Category bars**: Equal height, color varies by category (e.g. sleep stages)
 * - **Value-colored bars**: Equal height, color varies by value range (e.g. heart rate zones)
 * - **Value-scaled bars**: Fixed color, height varies by value (e.g. hourly steps)
 */
export function SlotBarChart({
  items,
  heightClass = "h-6",
  gapClass = "gap-px",
  emptyClass = "bg-muted",
  className,
}: SlotBarChartProps) {
  if (items.length === 0) return null;

  const hasTooltips = items.some((item) => item.label);

  function renderBar(item: SlotBarItem) {
    const heightRatio = item.height ?? 1;
    const isEmpty = heightRatio <= 0;
    const isTailwindColor = item.color.startsWith("bg-");
    const heightPercent = isEmpty ? 100 : Math.max(heightRatio * 100, 10);

    return (
      <div
        className={cn(
          "flex-1 rounded-sm",
          isEmpty ? emptyClass : isTailwindColor ? item.color : undefined
        )}
        style={{
          height: `${heightPercent}%`,
          ...(isEmpty || isTailwindColor
            ? {}
            : { backgroundColor: item.color }),
        }}
        data-testid="slot-bar"
      />
    );
  }

  const content = items.map((item, i) => {
    if (hasTooltips && item.label) {
      return (
        <Tooltip key={i}>
          <TooltipTrigger asChild>{renderBar(item)}</TooltipTrigger>
          <TooltipContent side="top">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return <div key={i}>{renderBar(item)}</div>;
  });

  const container = (
    <div
      className={cn(
        "flex w-full items-end",
        heightClass,
        gapClass,
        className
      )}
    >
      {content}
    </div>
  );

  if (hasTooltips) {
    return <TooltipProvider delayDuration={0}>{container}</TooltipProvider>;
  }

  return container;
}
