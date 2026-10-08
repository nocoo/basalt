import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";

export default function LayerCardStructuredCard() {
	return (
		<LayerCard className="w-full max-w-sm">
			<LayerCard.Header>
				<div>
					<h3 className="text-basalt-base font-semibold text-basalt-foreground">Deployment</h3>
					<p className="text-basalt-sm text-basalt-muted-foreground">Production environment</p>
				</div>
				<span className="text-basalt-sm font-medium text-basalt-muted-foreground">Ready</span>
			</LayerCard.Header>
			<LayerCard.Body>
				<p className="text-basalt-base text-basalt-foreground">All checks have passed.</p>
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
