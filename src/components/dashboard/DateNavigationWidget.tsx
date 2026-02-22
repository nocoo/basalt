import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  todayLabel,
  formatDate,
  className,
}: DateNavigationProps) {
  const { t, i18n } = useTranslation();

  const defaultFormatDate = (date: Date): string =>
    date.toLocaleDateString(i18n.language === "zh" ? "zh-CN" : "en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const resolvedTodayLabel = todayLabel ?? t("common.today");
  const resolvedFormatDate = formatDate ?? defaultFormatDate;
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
        {resolvedTodayLabel}
      </button>

      {/* Previous day */}
      <button
        onClick={onPrevDay}
        aria-label={t("common.previousDay")}
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
        <span>{resolvedFormatDate(selectedDate)}</span>
        {onToggleCalendar && (
          <CalendarIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        )}
      </button>

      {/* Next day */}
      <button
        onClick={onNextDay}
        aria-label={t("common.nextDay")}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
