import { TAG_COLORS, TagBadge, type TagColor } from "@nocoo/basalt/components/tag-badge";

export default function SemanticTags() {
	return (
		<div className="w-full space-y-5">
			<div className="flex flex-wrap gap-2">
				<TagBadge name="Healthy" color="success" />
				<TagBadge name="Needs attention" color="warning" />
				<TagBadge name="Incident open" color="danger" />
				<TagBadge name="Awaiting review" color="info" />
			</div>
			<p className="text-sm text-basalt-muted-foreground">
				Choose semantic colors explicitly. A hashed tag never infers a financial or operational
				status.
			</p>
			<div data-palette className="flex flex-wrap gap-2">
				{(Object.keys(TAG_COLORS) as TagColor[]).map((color) => (
					<TagBadge key={color} name={TAG_COLORS[color].label} color={color} size="sm" />
				))}
			</div>
		</div>
	);
}
