import { TagBadge, tagColorFor } from "@nocoo/basalt/components/tag-badge";

const tags = [
	{ id: "design", name: "Design" },
	{ id: "research", name: "Research" },
	{ id: "engineering", name: "Engineering" },
	{ id: "accessibility", name: "Accessibility" },
	{ id: "writing", name: "Writing" },
	{ id: "operations", name: "Operations" },
];
export default function DeterministicTags() {
	return (
		<div className="w-full space-y-4">
			<div>
				<h3 className="font-medium">Shared resource tags</h3>
				<p className="mt-1 text-sm text-basalt-muted-foreground">
					Stable IDs retain their color when a display name changes.
				</p>
			</div>
			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<TagBadge key={tag.id} name={tag.name} colorKey={tag.id} />
				))}
			</div>
			<div className="flex flex-wrap items-center gap-2 rounded-basalt-lg border border-basalt-border p-4">
				<TagBadge name="Research" colorKey="research" />
				<span className="text-xs text-basalt-muted-foreground">renamed to</span>
				<TagBadge name="Research & reading" color={tagColorFor("research")} />
			</div>
		</div>
	);
}
