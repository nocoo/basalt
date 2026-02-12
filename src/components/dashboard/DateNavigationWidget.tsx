import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateNavigationProps {
  /** Currently selected date */
  selectedDate: Date;
  /** Go to previous day */
  onPrevDay: () => void;
  /** Go to next day */
  onNextDay: () => void;
  /** Go to today */
  onToday: () => void;
  /** Toggle calendar picker overlay */
  onToggleCalendar?: () => void;
  /** Label for the "Today" button (default: "Today") */
  todayLabel?: string;
  /** Date formatter — receives the selectedDate, returns display string */
  formatDate?: (date: Date) => string;
  /** Additional class name */
  className?: string;
}

/** Default date formatter: "Mon, Feb 13 2026" */
const defaultFormatDate = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/** Check if two dates are the same calendar day */
const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Prev / Today / Next date navigation bar.
 *
 * Displays the currently selected date with navigation controls.
 * The date format and "Today" label are configurable for i18n.
 */
export function DateNavigationWidget({
  selectedDate,
  onPrevDay,
  onNextDay,
  onToday,
  onToggleCalendar,
  todayLabel = "Today",
  formatDate = defaultFormatDate,
  className,
}: DateNavigationProps) {
  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Today button */}
      <button
        onClick={onToday}
        disabled={isToday}
        className={cn(
          "mr-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          isToday
            ? "cursor-not-allowed text-muted-foreground opacity-50"
            : "bg-secondary text-foreground hover:bg-accent",
        )}
      >
        {todayLabel}
      </button>

      {/* Previous day */}
      <button
        onClick={onPrevDay}
        aria-label="Previous day"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {/* Current date display */}
      <button
        onClick={onToggleCalendar}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-lg font-medium transition-colors",
          onToggleCalendar
            ? "cursor-pointer hover:bg-accent"
            : "cursor-default",
        )}
      >
        <span>{formatDate(selectedDate)}</span>
        {onToggleCalendar && (
          <CalendarIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        )}
      </button>

      {/* Next day */}
      <button
        onClick={onNextDay}
        aria-label="Next day"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
