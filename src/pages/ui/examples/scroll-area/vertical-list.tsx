import { ScrollArea } from "@nocoo/basalt/components/scroll-area";

const activity = [
	"Created the project",
	"Invited two teammates",
	"Connected the repository",
	"Enabled preview builds",
	"Published the first release",
	"Added a custom domain",
];

export default function VerticalListExample() {
	return (
		<ScrollArea
			aria-label="Recent activity"
			className="h-44 w-72 rounded-basalt-md ring-1 ring-basalt-border"
		>
			<ol className="space-y-1 p-3 pr-5">
				{activity.map((item, index) => (
					<li key={item} className="rounded-basalt-sm bg-basalt-secondary px-3 py-2 text-sm">
						{index + 1}. {item}
					</li>
				))}
			</ol>
		</ScrollArea>
	);
}
