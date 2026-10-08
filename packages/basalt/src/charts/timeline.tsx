import { cn } from "../utils/cn";

export type TimelineEvent = {
	id: string;
	time: string;
	title: string;
	subtitle?: string;
	/** Background utility classes for the event row. */
	color?: string;
	/** Optional CSS text color for a custom background; subtitles inherit it without dimming. */
	textColor?: string;
};

const hours = Array.from({ length: 24 }, (_, index) => index);

function getHour(time: string) {
	return Number.parseInt(time.split(":")[0] ?? "0", 10);
}

export type TimelineItem = { id?: string; title: string; at?: string };

export type TimelineItemsProps = {
	items: TimelineItem[];
	ariaLabel?: string;
	className?: string;
};
export type TimelineEventsProps = {
	events: TimelineEvent[];
	ariaLabel?: string;
	className?: string;
};
export type TimelineProps = TimelineItemsProps | TimelineEventsProps;

export function Timeline(props: TimelineProps) {
	const { ariaLabel = "Timeline", className } = props;
	if ("events" in props) {
		return <HourTimeline events={props.events} ariaLabel={ariaLabel} className={className} />;
	}
	return (
		<ol
			className={cn("space-y-basalt-space-lg text-basalt-base", className)}
			aria-label={ariaLabel}
		>
			{props.items.map((item, index) => (
				<li
					key={item.id ?? `${item.at ?? ""}-${item.title}-${index}`}
					className="flex gap-basalt-space-lg"
				>
					<span className="text-basalt-muted-foreground">{item.at}</span>
					<span>{item.title}</span>
				</li>
			))}
		</ol>
	);
}

function HourTimeline({
	events,
	ariaLabel,
	className,
}: {
	events: TimelineEvent[];
	ariaLabel: string;
	className?: string;
}) {
	const eventsByHour = new Map<number, TimelineEvent[]>();
	for (const event of events) {
		const hour = getHour(event.time);
		const existing = eventsByHour.get(hour) ?? [];
		eventsByHour.set(hour, [...existing, event]);
	}
	return (
		<ol
			className={cn("grid", className)}
			style={{ gridTemplateColumns: "max-content 2px minmax(0, 1fr)" }}
			aria-label={ariaLabel}
		>
			{hours.map((hour) => {
				const hourEvents = eventsByHour.get(hour) ?? [];
				const hasEvents = hourEvents.length > 0;
				return (
					<li
						key={hour}
						className="relative grid items-stretch gap-basalt-space-lg py-basalt-space-lg"
						style={{
							gridColumn: "1 / -1",
							gridTemplateColumns: "subgrid",
						}}
					>
						<div
							data-timeline-time
							className="pr-basalt-space-lg text-right text-basalt-sm text-basalt-muted-foreground"
						>
							{hour.toString().padStart(2, "0")}:00
						</div>
						<div
							className={cn(
								"relative -my-basalt-space-lg flex justify-center border-l-2",
								hasEvents ? "border-basalt-chart-1" : "border-basalt-border",
							)}
						>
							<div
								className={cn(
									"absolute top-basalt-2 h-basalt-2 w-basalt-2 -translate-x-1/2 rounded-basalt-full",
									hasEvents ? "bg-basalt-chart-1" : "bg-basalt-border",
								)}
							/>
						</div>
						<div className="flex min-h-[1.5rem] min-w-0 flex-col gap-basalt-space-sm">
							{hourEvents.map((event) => (
								<div
									key={event.id}
									style={event.textColor ? { color: event.textColor } : undefined}
									className={cn(
										"flex items-center gap-basalt-space-lg rounded-basalt-md px-basalt-space-lg py-basalt-space-sm text-basalt-sm",
										event.color
											? `${event.color} text-basalt-on-solid`
											: "bg-basalt-muted text-basalt-foreground",
									)}
								>
									<span className="font-medium">{event.time}</span>
									<span className="truncate">{event.title}</span>
									{event.subtitle ? (
										<span
											className={cn(
												"truncate",
												event.textColor
													? "text-current"
													: event.color
														? "text-basalt-on-solid/80"
														: "text-basalt-muted-foreground",
											)}
										>
											{event.subtitle}
										</span>
									) : null}
								</div>
							))}
						</div>
					</li>
				);
			})}
		</ol>
	);
}
