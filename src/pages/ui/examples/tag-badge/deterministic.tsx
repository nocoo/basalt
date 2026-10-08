import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { TagBadge, tagColorFor } from "@nocoo/basalt/components/tag-badge";

const tags = [
	{ id: "design", name: "Wellness" },
	{ id: "research", name: "Research" },
	{ id: "engineering", name: "Care coordination" },
	{ id: "accessibility", name: "Mobility" },
	{ id: "writing", name: "Care notes" },
	{ id: "operations", name: "Follow-up" },
];
export default function DeterministicTags() {
	return (
		<div className="w-full space-y-basalt-space-lg">
			<div>
				<h3 className="font-medium">Shared resource tags</h3>
				<p className="mt-basalt-space-sm text-basalt-base text-basalt-muted-foreground">
					Stable IDs retain their color when a display name changes.
				</p>
			</div>
			<div className="flex flex-wrap gap-basalt-space-lg">
				{tags.map((tag) => (
					<TagBadge key={tag.id} name={tag.name} colorKey={tag.id} />
				))}
			</div>
			<LayerCard className="flex flex-wrap items-center gap-basalt-space-lg">
				<TagBadge name="Research" colorKey="research" />
				<span className="text-basalt-sm text-basalt-muted-foreground">renamed to</span>
				<TagBadge name="Research & wellness" color={tagColorFor("research")} />
			</LayerCard>
		</div>
	);
}
