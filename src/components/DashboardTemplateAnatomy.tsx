import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { TagBadge } from "@nocoo/basalt/components/tag-badge";
import { CATALOG_BY_SLUG, catalogNavName } from "@/pages/ui/catalog";

interface DashboardTemplateAnatomyProps {
	patternSummary: string;
	layoutNote: string;
	components: readonly string[];
}

export function DashboardTemplateAnatomy({
	patternSummary,
	layoutNote,
	components,
}: DashboardTemplateAnatomyProps) {
	return (
		<SectionRule
			title="Built with"
			hint="In-shell multi-chart dashboard template composed from Basalt primitives and chart chrome."
		>
			<LayerCard padding="none">
				<LayerCard.Header>Composition anatomy</LayerCard.Header>
				<LayerCard.Body className="space-y-basalt-card-sm">
					<p className="text-basalt-sm text-basalt-foreground">{patternSummary}</p>
					<p className="text-basalt-sm text-basalt-muted-foreground">{layoutNote}</p>
					<div className="flex flex-wrap items-center gap-basalt-space-md">
						{components.map((slug) => {
							const entry = CATALOG_BY_SLUG.get(slug);
							if (!entry) return null;
							return (
								<Link
									key={slug}
									href={`/ui/${slug}`}
									className="basalt-focus inline-flex items-center rounded-basalt-full no-underline"
								>
									<TagBadge name={catalogNavName(entry)} size="sm" />
								</Link>
							);
						})}
					</div>
				</LayerCard.Body>
			</LayerCard>
		</SectionRule>
	);
}
