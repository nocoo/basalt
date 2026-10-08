import { ScrollArea } from "@nocoo/basalt/components/scroll-area";

const activity = [
	"Created the care plan",
	"Invited two care providers",
	"Added a wellness report",
	"Enabled appointment reminders",
	"Reviewed the care plan",
	"Scheduled the next check-in",
];

export default function VerticalListExample() {
	return (
		<ScrollArea
			aria-label="Recent activity"
			className="h-44 w-72 rounded-basalt-md ring-1 ring-basalt-border"
		>
			<ol className="space-y-basalt-space-sm p-basalt-space-lg pr-basalt-space-lg">
				{activity.map((item, index) => (
					<li
						key={item}
						className="rounded-basalt-sm bg-basalt-secondary px-basalt-space-lg py-basalt-space-lg text-basalt-base"
					>
						{index + 1}. {item}
					</li>
				))}
			</ol>
		</ScrollArea>
	);
}
