import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";

export default function SectionRuleStackedRegions() {
	return (
		<div className="space-y-basalt-space-lg">
			<SectionRule title="Overview" hint="Live totals for the current workspace.">
				<div className="grid grid-cols-2 gap-basalt-space-lg">
					<LayerCard>
						<p className="text-basalt-sm text-basalt-muted-foreground">Projects</p>
						<p className="text-basalt-3xl font-semibold">24</p>
					</LayerCard>
					<LayerCard>
						<p className="text-basalt-sm text-basalt-muted-foreground">Ready</p>
						<p className="text-basalt-3xl font-semibold">18</p>
					</LayerCard>
				</div>
			</SectionRule>
			<SectionRule
				title="Catalog"
				actions={
					<>
						<Button variant="outline" size="sm">
							Filter
						</Button>
						<Button size="sm">New project</Button>
					</>
				}
			>
				<LayerCard>
					<p className="text-basalt-base text-basalt-muted-foreground">
						Stack SectionRule for each page region. Cards stay inside the region.
					</p>
				</LayerCard>
			</SectionRule>
		</div>
	);
}
