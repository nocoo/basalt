import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";

export default function LayerCardStructuredCard() {
	return (
		<LayerCard className="w-full max-w-sm">
			<LayerCard.Header>
				<div>
					<LayerCard.Title>Care plan review</LayerCard.Title>
					<LayerCard.Description>Clinical Ops environment</LayerCard.Description>
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
				<Button size="sm">Review</Button>
			</LayerCard.Footer>
		</LayerCard>
	);
}
