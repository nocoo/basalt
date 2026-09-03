import { Timeline } from "@nocoo/basalt/charts/timeline";

const events = [
	{ id: "wake", time: "06:30", title: "Wake up", subtitle: "Rested", color: "bg-indigo-500" },
	{ id: "hydrate", time: "07:10", title: "Hydration", subtitle: "400ml", color: "bg-blue-500" },
	{
		id: "commute",
		time: "08:15",
		title: "Commute",
		subtitle: "12 min",
		color: "bg-basalt-primary",
	},
	{ id: "standup", time: "09:30", title: "Standup", subtitle: "Team sync", color: "bg-cyan-600" },
	{ id: "focus", time: "10:00", title: "Deep work", subtitle: "90 min", color: "bg-emerald-600" },
	{ id: "walk", time: "12:20", title: "Walk", subtitle: "3.2 km", color: "bg-green-600" },
	{ id: "review", time: "14:45", title: "Review", subtitle: "PR #142", color: "bg-violet-500" },
	{
		id: "workout",
		time: "18:10",
		title: "Workout",
		subtitle: "Strength 45m",
		color: "bg-orange-500",
	},
	{ id: "dinner", time: "19:40", title: "Dinner", subtitle: "Home", color: "bg-amber-500" },
	{ id: "wind", time: "21:40", title: "Wind down", subtitle: "Stretching", color: "bg-indigo-400" },
];

export default function TimelineDefault() {
	return <Timeline events={events} />;
}
