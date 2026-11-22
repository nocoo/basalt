import { Badge } from "@nocoo/basalt/components/badge";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Loader } from "@nocoo/basalt/components/loader";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { Check } from "lucide-react";
import { useState } from "react";

const BACKDROPS = {
	neutral: "hsl(var(--basalt-background))",
	warm: "color-mix(in srgb, hsl(var(--basalt-warning-tint)) 55%, hsl(var(--basalt-background)))",
	brand: "color-mix(in srgb, hsl(var(--basalt-primary)) 10%, hsl(var(--basalt-background)))",
} as const;
type Backdrop = keyof typeof BACKDROPS;

const BACKDROP_LABELS: Record<Backdrop, string> = {
	neutral: "Neutral Light",
	warm: "Warm Field",
	brand: "Brand Tint",
};

export function SurfaceDisciplineInspector() {
	const [backdrop, setBackdrop] = useState<Backdrop>("neutral");
	return (
		<div className="space-y-basalt-layout-sm">
			<p className="text-basalt-md text-basalt-muted-foreground">
				Change the backdrop to compare a matte hierarchy with competing boundaries and noisy color.
			</p>
			<SegmentControl
				aria-label="Backdrop context"
				value={backdrop}
				onValueChange={(value) => setBackdrop(value as Backdrop)}
				options={(["neutral", "warm", "brand"] as const).map((value) => ({
					value,
					label: BACKDROP_LABELS[value],
				}))}
			/>
			<div
				data-surface-inspector-stage=""
				data-backdrop={backdrop}
				className="rounded-basalt-lg p-basalt-layout"
				style={{ background: BACKDROPS[backdrop] }}
			>
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2 xl:grid-cols-3">
					<LayerCard padding="none">
						<LayerCard.Header>Matte luminance</LayerCard.Header>
						<LayerCard.Body>
							<p className="text-basalt-sm text-basalt-muted-foreground">
								L0 backdrop → L1 island → L2 card → L3 well. One owner per boundary.
							</p>
						</LayerCard.Body>
						<LayerCard.Well className="space-y-basalt-card-sm">
							<p className="text-basalt-md font-medium">Release checks</p>
							<p className="flex items-center gap-basalt-space-lg text-basalt-md">
								<Check aria-hidden="true" className="size-basalt-icon text-basalt-success" />
								Checks completed
							</p>
							<Loader
								size={14}
								showElapsed={false}
								label="Verifying release"
								className="text-basalt-md"
							/>
						</LayerCard.Well>
					</LayerCard>
					<LayerCard padding="none">
						<LayerCard.Header>Double-border anti-pattern</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card-sm">
							<p className="text-basalt-sm text-basalt-muted-foreground">
								Repeated outlines compete with the card boundary.
							</p>
							<div className="border border-basalt-border p-basalt-card">
								<div className="border border-basalt-border p-basalt-card-sm">
									<p className="text-basalt-md font-medium">Release checks</p>
									<p className="text-basalt-sm text-basalt-muted-foreground">
										Two borders for one group
									</p>
								</div>
							</div>
						</LayerCard.Body>
					</LayerCard>
					<LayerCard padding="none">
						<LayerCard.Header>Signal overload anti-pattern</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card-sm">
							<p className="text-basalt-sm text-basalt-muted-foreground">
								Color on every surface and label makes meaningful signals harder to find.
							</p>
							<div
								className="rounded-basalt-md p-basalt-card"
								style={{
									backgroundImage:
										"linear-gradient(135deg, hsl(var(--basalt-info) / 0.18), hsl(var(--basalt-warning) / 0.18))",
								}}
							>
								<p className="text-basalt-md font-medium">Release checks</p>
								<div className="flex flex-wrap gap-basalt-space-sm">
									<Badge tone="info">Info</Badge>
									<Badge tone="warning">Warning</Badge>
									<Badge tone="danger">Alert</Badge>
								</div>
							</div>
						</LayerCard.Body>
					</LayerCard>
				</div>
			</div>
		</div>
	);
}
