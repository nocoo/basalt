import { Badge } from "@nocoo/basalt/components/badge";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Loader } from "@nocoo/basalt/components/loader";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const BACKDROPS = {
	neutral: "hsl(var(--basalt-background))",
	warm: "color-mix(in srgb, hsl(var(--basalt-warning-tint)) 55%, hsl(var(--basalt-background)))",
	brand: "color-mix(in srgb, hsl(var(--basalt-primary)) 10%, hsl(var(--basalt-background)))",
} as const;
type Backdrop = keyof typeof BACKDROPS;

export function SurfaceDisciplineInspector() {
	const { t } = useTranslation();
	const prefix = "pages.layout.inspector";
	const [backdrop, setBackdrop] = useState<Backdrop>("neutral");
	return (
		<div className="space-y-basalt-layout-sm">
			<p className="text-basalt-md text-basalt-muted-foreground">
				{t("pages.layout.surfaceDisciplineDesc")}
			</p>
			<SegmentControl
				aria-label={t(`${prefix}.backdrop`)}
				value={backdrop}
				onValueChange={(value) => setBackdrop(value as Backdrop)}
				options={(["neutral", "warm", "brand"] as const).map((value) => ({
					value,
					label: t(`${prefix}.backdrops.${value}`),
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
						<LayerCard.Header>{t(`${prefix}.matteTitle`)}</LayerCard.Header>
						<LayerCard.Body>
							<p className="text-basalt-sm text-basalt-muted-foreground">
								{t(`${prefix}.matteDescription`)}
							</p>
						</LayerCard.Body>
						<LayerCard.Well className="space-y-basalt-card-sm">
							<p className="text-basalt-md font-medium">{t(`${prefix}.releaseChecks`)}</p>
							<p className="flex items-center gap-basalt-space-lg text-basalt-md">
								<Check aria-hidden="true" className="size-basalt-icon text-basalt-success" />
								{t(`${prefix}.complete`)}
							</p>
							<Loader
								size={14}
								showElapsed={false}
								label={t(`${prefix}.running`)}
								className="text-basalt-md"
							/>
						</LayerCard.Well>
					</LayerCard>
					<LayerCard padding="none">
						<LayerCard.Header>{t(`${prefix}.borderTitle`)}</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card-sm">
							<p className="text-basalt-sm text-basalt-muted-foreground">
								{t(`${prefix}.borderDescription`)}
							</p>
							<div className="border border-basalt-border p-basalt-card">
								<div className="border border-basalt-border p-basalt-card-sm">
									<p className="text-basalt-md font-medium">{t(`${prefix}.releaseChecks`)}</p>
									<p className="text-basalt-sm text-basalt-muted-foreground">
										{t(`${prefix}.extraBoundaries`)}
									</p>
								</div>
							</div>
						</LayerCard.Body>
					</LayerCard>
					<LayerCard padding="none">
						<LayerCard.Header>{t(`${prefix}.colorTitle`)}</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card-sm">
							<p className="text-basalt-sm text-basalt-muted-foreground">
								{t(`${prefix}.colorDescription`)}
							</p>
							<div
								className="rounded-basalt-md p-basalt-card"
								style={{
									backgroundImage:
										"linear-gradient(135deg, hsl(var(--basalt-info) / 0.18), hsl(var(--basalt-warning) / 0.18))",
								}}
							>
								<p className="text-basalt-md font-medium">{t(`${prefix}.releaseChecks`)}</p>
								<div className="flex flex-wrap gap-basalt-space-sm">
									<Badge tone="info">{t(`${prefix}.noisyInfo`)}</Badge>
									<Badge tone="warning">{t(`${prefix}.noisyWarning`)}</Badge>
									<Badge tone="danger">{t(`${prefix}.noisyAlert`)}</Badge>
								</div>
							</div>
						</LayerCard.Body>
					</LayerCard>
				</div>
			</div>
		</div>
	);
}
