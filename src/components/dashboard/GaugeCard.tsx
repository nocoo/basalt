import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Shield } from "lucide-react";
import { Gauge } from "@/components/charts/gauge";

const score = 742;
const max = 850;

function getScoreLabel(s: number) {
	if (s >= 740) return { label: "Excellent", color: "text-basalt-success" };
	if (s >= 670) return { label: "Good", color: "text-basalt-foreground" };
	if (s >= 580) return { label: "Fair", color: "text-basalt-warning" };
	return { label: "Poor", color: "text-basalt-danger-solid" };
}

export function GaugeCard() {
	const { label, color } = getScoreLabel(score);

	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Shield className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						Care funding score
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex flex-1 flex-col items-center min-h-0">
					<Gauge
						value={score}
						max={max}
						ariaLabel={`Care funding score gauge showing ${score} out of ${max}, rated ${label}`}
						className="w-full"
					/>
					<div className="mt-basalt-card-sm grid w-full grid-cols-3 gap-basalt-card-sm">
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-basalt-foreground font-basalt-display tabular-nums">
								{score}
							</span>
							<span className="text-basalt-sm text-basalt-muted-foreground">Score</span>
						</div>
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-basalt-foreground font-basalt-display tabular-nums">
								{max}
							</span>
							<span className="text-basalt-sm text-basalt-muted-foreground">Max</span>
						</div>
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span
								className={`text-basalt-base font-medium font-basalt-display tabular-nums ${color}`}
							>
								{label}
							</span>
							<span className="text-basalt-sm text-basalt-muted-foreground">Rating</span>
						</div>
					</div>
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
