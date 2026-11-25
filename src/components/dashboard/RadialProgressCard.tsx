import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Goal } from "lucide-react";
import { Gauge } from "@/components/charts/gauge";

const goal = 10000;
const saved = 6800;
const pct = Math.round((saved / goal) * 100);

export function RadialProgressCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col items-start">
				<div className="flex items-center gap-basalt-space-lg">
					<Goal className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Care Plan Goal</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex flex-1 flex-col items-center min-h-0">
					<Gauge
						value={pct}
						valueFormatter={(next) => `${next}%`}
						ariaLabel="Care fund radial progress: 68% complete, $6,800 reserved of $10,000 target"
						className="w-full"
					/>
					<div className="mt-basalt-card-sm grid w-full grid-cols-3 gap-basalt-card-sm">
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-basalt-foreground font-basalt-display tabular-nums">
								${saved.toLocaleString()}
							</span>
							<span className="text-basalt-sm text-basalt-muted-foreground">Saved</span>
						</div>
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-basalt-foreground font-basalt-display tabular-nums">
								${goal.toLocaleString()}
							</span>
							<span className="text-basalt-sm text-basalt-muted-foreground">Target</span>
						</div>
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-basalt-foreground font-basalt-display tabular-nums">
								${(goal - saved).toLocaleString()}
							</span>
							<span className="text-basalt-sm text-basalt-muted-foreground">Remaining</span>
						</div>
					</div>
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
