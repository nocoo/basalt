import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { CodeHighlighted } from "@nocoo/basalt/components/code";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { type CSSProperties, useId } from "react";
import { useTranslation } from "react-i18next";
import { MicroSceneWall } from "@/components/showcase/MicroSceneWall";
import {
	CHART_MODES,
	FONT_PAIRINGS,
	RADIUS_SCALES,
	STUDIO_PRESETS,
	SURFACE_TINTS,
	type ThemeStudioOptions,
} from "@/models/theme-studio";
import { useThemeStudioViewModel } from "@/viewmodels/useThemeStudioViewModel";

const CONTROLS: readonly { key: keyof ThemeStudioOptions; values: readonly string[] }[] = [
	{ key: "surfaceTint", values: SURFACE_TINTS },
	{ key: "radius", values: RADIUS_SCALES },
	{ key: "chartMode", values: CHART_MODES },
	{ key: "fontPairing", values: FONT_PAIRINGS },
];

export function ThemeStudio() {
	const { t } = useTranslation();
	const id = useId();
	const vm = useThemeStudioViewModel();
	const prefix = "pages.palette.studio";
	return (
		<div className="space-y-basalt-layout">
			<LayerCard padding="none">
				<LayerCard.Header className="flex-wrap items-center justify-between">
					<div className="flex flex-wrap items-center gap-basalt-space-lg">
						<span>{t(`${prefix}.title`)}</span>
						<Badge variant="outline">{t(`${prefix}.presets.${vm.presetId}`)}</Badge>
					</div>
					<div className="flex flex-wrap gap-basalt-space-lg">
						<Button size="sm" variant="outline" onClick={vm.reset}>
							{t(`${prefix}.reset`)}
						</Button>
						<Button size="sm" variant="outline" onClick={() => void vm.copyShareLink()}>
							{t(`${prefix}.copyLink`)}
						</Button>
					</div>
				</LayerCard.Header>
				<LayerCard.Body className="space-y-basalt-layout">
					<div className="space-y-basalt-space-lg">
						<p className="text-basalt-sm font-medium text-basalt-muted-foreground">
							{t(`${prefix}.presetsLabel`)}
						</p>
						<div
							role="group"
							aria-label={t(`${prefix}.presetsLabel`)}
							className="flex flex-wrap gap-basalt-space-lg"
						>
							{STUDIO_PRESETS.map((preset) => (
								<Button
									key={preset.id}
									size="sm"
									variant={vm.presetId === preset.id ? "default" : "outline"}
									aria-pressed={vm.presetId === preset.id}
									onClick={() => vm.applyPreset(preset.id)}
								>
									{t(`${prefix}.presets.${preset.id}`)}
								</Button>
							))}
						</div>
					</div>
					<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2 lg:grid-cols-4">
						{CONTROLS.map(({ key, values }) => (
							<div key={key} className="space-y-basalt-space-lg">
								<Label htmlFor={`${id}-${key}`}>{t(`${prefix}.controls.${key}`)}</Label>
								<Select
									value={vm.options[key]}
									onValueChange={(value) =>
										vm.updateOption(key, value as ThemeStudioOptions[typeof key])
									}
								>
									<SelectTrigger id={`${id}-${key}`} size="sm">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{values.map((value) => (
											<SelectItem key={value} value={value}>
												{t(`${prefix}.values.${key}.${value}`)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						))}
					</div>
					<p className="text-basalt-sm text-basalt-muted-foreground">{t(`${prefix}.shareNote`)}</p>
					{vm.copyStatus !== "idle" && (
						<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
							{t(`${prefix}.copyStatus.${vm.copyStatus}`)}
						</p>
					)}
				</LayerCard.Body>
			</LayerCard>
			<LayerCard padding="none">
				<LayerCard.Header className="flex-wrap items-center justify-between">
					<div className="flex items-center gap-basalt-space-lg">
						<span>{t(`${prefix}.stage`)}</span>
						<Badge variant="outline">{t(`pages.palette.${vm.mode}`)}</Badge>
					</div>
					<div className="flex flex-wrap items-center gap-basalt-space-lg">
						<SegmentControl
							aria-label={t(`${prefix}.stageMode`)}
							value={vm.stageTab}
							onValueChange={(value) => vm.setStageTab(value as "preview" | "code")}
							options={[
								{ value: "preview", label: t(`${prefix}.preview`) },
								{ value: "code", label: t(`${prefix}.code`) },
							]}
						/>
						<Button size="sm" variant="outline" onClick={() => void vm.copyCssDiff()}>
							{t(`${prefix}.copyCss`)}
						</Button>
					</div>
				</LayerCard.Header>
				{vm.stageTab === "preview" ? (
					<div
						data-theme-studio-stage=""
						style={vm.scopedVars as CSSProperties}
						className="space-y-basalt-layout bg-basalt-background p-basalt-card"
					>
						<div className="flex flex-wrap items-center justify-between gap-basalt-layout">
							<p className="font-basalt-display text-basalt-lg font-semibold text-basalt-foreground">
								{t(`${prefix}.stageSample`)}
							</p>
							<div
								role="img"
								aria-label={t(`${prefix}.chartPreview`)}
								className="flex gap-basalt-space-sm"
							>
								{[1, 2, 3, 4, 5].map((index) => (
									<span
										key={index}
										aria-hidden="true"
										className="h-basalt-4 w-basalt-4 rounded-basalt-sm"
										style={{ backgroundColor: `hsl(var(--basalt-chart-${index}))` }}
									/>
								))}
							</div>
						</div>
						<div
							role="img"
							aria-label={t(`${prefix}.surfacePreview`)}
							className="grid grid-cols-4 gap-basalt-space-sm"
						>
							{["background", "card", "secondary", "bright"].map((token, index) => (
								<span
									key={token}
									className="rounded-basalt-sm border border-basalt-border p-basalt-space-sm text-center text-basalt-xs text-basalt-foreground"
									style={{ backgroundColor: `hsl(var(--basalt-${token}))` }}
								>
									L{index}
								</span>
							))}
						</div>
						<MicroSceneWall />
					</div>
				) : (
					<CodeHighlighted
						attached
						title="basalt-theme-overrides.css"
						code={vm.cssDiff}
						lineNumbers
						copyable={false}
					/>
				)}
			</LayerCard>
		</div>
	);
}
