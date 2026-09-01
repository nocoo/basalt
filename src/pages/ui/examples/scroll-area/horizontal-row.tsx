import { ScrollArea } from "@nocoo/basalt/components/scroll-area";

const stages = ["Backlog", "Planned", "Building", "Review", "Released"];

export default function HorizontalRowExample() {
	return (
		<ScrollArea
			aria-label="Delivery stages"
			orientation="horizontal"
			className="w-80 rounded-basalt-md ring-1 ring-basalt-border"
		>
			<div className="flex w-max gap-3 p-3 pb-5">
				{stages.map((stage) => (
					<div
						key={stage}
						className="flex h-24 w-36 shrink-0 items-center justify-center rounded-basalt-md bg-basalt-secondary text-sm font-medium"
					>
						{stage}
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
