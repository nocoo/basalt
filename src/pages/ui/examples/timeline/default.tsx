import { Timeline } from "@nocoo/basalt/charts/timeline";

const events = [
	{
		id: "wake",
		time: "06:30",
		title: "Wake up",
		subtitle: "Rested",
		color: "bg-basalt-chart-1/15",
	},
	{
		id: "hydrate",
		time: "07:10",
		title: "Hydration",
		subtitle: "400ml",
		color: "bg-basalt-chart-1/15",
	},
	{
		id: "commute",
		time: "08:15",
		title: "Commute",
		subtitle: "12 min",
		color: "bg-basalt-chart-7/15",
	},
	{
		id: "standup",
		time: "09:30",
		title: "Standup",
		subtitle: "Team sync",
		color: "bg-basalt-chart-24/15",
	},
	{
		id: "focus",
		time: "10:00",
		title: "Deep work",
		subtitle: "90 min",
		color: "bg-basalt-chart-5/15",
	},
	{ id: "walk", time: "12:20", title: "Walk", subtitle: "3.2 km", color: "bg-basalt-chart-5/15" },
	{
		id: "review",
		time: "14:45",
		title: "Review",
		subtitle: "PR #142",
		color: "bg-basalt-chart-11/15",
	},
	{
		id: "workout",
		time: "18:10",
		title: "Workout",
		subtitle: "Strength 45m",
		color: "bg-basalt-chart-7/15",
	},
	{ id: "dinner", time: "19:40", title: "Dinner", subtitle: "Home", color: "bg-basalt-chart-7/15" },
	{
		id: "wind",
		time: "21:40",
		title: "Wind down",
		subtitle: "Stretching",
		color: "bg-basalt-chart-24/15",
	},
];

export default function TimelineDefault() {
	return (
		<Timeline
			events={events.map((event) => ({ ...event, textColor: "hsl(var(--basalt-foreground))" }))}
		/>
	);
}
