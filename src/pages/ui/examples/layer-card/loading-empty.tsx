import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useState } from "react";

export default function LayerCardLoadingEmpty() {
	const [events, setEvents] = useState<string[]>([]);

	const handleCreateEvent = () => {
		setEvents((prev) => [...prev, `Event ${prev.length + 1}`]);
	};

	return (
		<div className="grid w-full gap-basalt-space-lg md:grid-cols-2">
			<LayerCard>
				<LayerCard.Loading label="Loading account activity" />
			</LayerCard>
			<LayerCard aria-live="polite">
				{events.length === 0 ? (
					<LayerCard.Empty
						title="No activity"
						description="New events will appear here."
						action={
							<Button type="button" variant="default" size="sm" onClick={handleCreateEvent}>
								Create event
							</Button>
						}
					>
						Trigger your first system event.
					</LayerCard.Empty>
				) : (
					<LayerCard.Body className="space-y-basalt-space-lg">
						<p className="text-basalt-sm font-medium text-basalt-foreground">
							Account Events ({events.length}):
						</p>
						<ul className="flex flex-col gap-basalt-space-sm">
							{events.map((ev) => (
								<li
									key={ev}
									className="rounded-basalt-sm bg-basalt-muted px-basalt-space-lg py-basalt-space-sm text-basalt-sm text-basalt-foreground"
								>
									{ev}
								</li>
							))}
						</ul>
					</LayerCard.Body>
				)}
			</LayerCard>
		</div>
	);
}
