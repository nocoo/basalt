import { cn } from "../utils/cn";

export type TimelineEvent = {
	id: string;
	time: string;
	title: string;
	subtitle?: string;
	color?: string;
};

const hours = Array.from({ length: 24 }, (_, index) => index);

function getHour(time: string) {
	return Number.parseInt(time.split(":")[0] ?? "0", 10);
}

export function Timeline({
	items = [
		{ title: "Created", at: "Mon" },
		{ title: "Shipped", at: "Tue" },
	],
	events,
	ariaLabel = "Timeline",
	className,
}: {
	items?: { id?: string; title: string; at?: string }[];
	events?: TimelineEvent[];
	ariaLabel?: string;
	className?: string;
}) {
	if (events) {
		return <HourTimeline events={events} ariaLabel={ariaLabel} className={className} />;
	}
	return (
		<ol className={cn("space-y-2 text-sm", className)} aria-label={ariaLabel}>
			{items.map((item, index) => (
				<li key={item.id ?? `${item.at ?? ""}-${item.title}-${index}`} className="flex gap-2">
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
		<div className={cn("flex flex-col pl-14", className)} role="list" aria-label={ariaLabel}>
			{hours.map((hour) => {
				const hourEvents = eventsByHour.get(hour) ?? [];
				const hasEvents = hourEvents.length > 0;
				return (
					<div
						key={hour}
						className={cn(
							"relative flex items-start border-l-2 py-2 pl-4",
							hasEvents ? "border-basalt-primary" : "border-basalt-border",
						)}
					>
						<div className="absolute left-0 w-12 -translate-x-full pr-2 text-right text-xs text-basalt-muted-foreground">
							{hour.toString().padStart(2, "0")}:00
						</div>
						<div
							className={cn(
								"absolute -left-[5px] top-2 h-2 w-2 rounded-full",
								hasEvents ? "bg-basalt-primary" : "bg-basalt-border",
							)}
						/>
						<div className="flex min-h-[24px] w-full flex-col gap-1">
							{hourEvents.map((event) => (
								<div
									key={event.id}
									className={cn(
										"flex items-center gap-2 rounded-md px-2 py-1 text-xs",
										event.color
											? `${event.color} text-white`
											: "bg-basalt-muted text-basalt-foreground",
									)}
								>
									<span className="font-medium">{event.time}</span>
									<span className="truncate">{event.title}</span>
									{event.subtitle ? (
										<span
											className={cn(
												"truncate",
												event.color ? "text-white/80" : "text-basalt-muted-foreground",
											)}
										>
											{event.subtitle}
										</span>
									) : null}
								</div>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
