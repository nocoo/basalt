import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";

export default function LayerCardStructuredCard() {
	return (
		<LayerCard className="w-full max-w-sm">
			<LayerCard.Header>
				<div>
					<h3 className="text-sm font-semibold text-basalt-foreground">Deployment</h3>
					<p className="text-xs text-basalt-muted-foreground">Production environment</p>
				</div>
				<span className="text-xs font-medium text-basalt-muted-foreground">Ready</span>
			</LayerCard.Header>
			<LayerCard.Body>
				<p className="text-sm text-basalt-foreground">All checks have passed.</p>
			</LayerCard.Body>
			<LayerCard.Footer>
				<Button size="sm" variant="secondary">
					Review
				</Button>
				<Button size="sm">Deploy</Button>
			</LayerCard.Footer>
		</LayerCard>
	);
}
