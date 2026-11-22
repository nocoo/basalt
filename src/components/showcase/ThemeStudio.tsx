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

const PRESET_LABELS: Record<string, string> = {
	default: "Basalt Default",
	graphite: "Pure Graphite",
	limestone: "Warm Limestone",
	ops: "Signal Ops",
	editorial: "Soft Editorial",
	terminal: "Sharp Terminal",
	custom: "Custom",
};

const CONTROL_LABELS: Record<keyof ThemeStudioOptions, string> = {
	surfaceTint: "Surface Tint",
	radius: "Radius Scale",
	chartMode: "Chart Strategy",
	fontPairing: "Font Pairing",
};

const CONTROL_VALUE_LABELS: Record<keyof ThemeStudioOptions, Record<string, string>> = {
	surfaceTint: { neutral: "Neutral", warm: "Warm", cool: "Cool" },
	radius: { default: "Default", sharp: "Sharp", soft: "Soft" },
	chartMode: { categorical: "Categorical", monochrome: "Monochrome" },
	fontPairing: { default: "Default", sans: "Sans", technical: "Technical" },
};

const COPY_STATUS_MESSAGES = {
	css: "CSS copied.",
	link: "Link copied.",
	error: "Copy failed. Check clipboard permissions and try again.",
} as const;

const CONTROLS: readonly { key: keyof ThemeStudioOptions; values: readonly string[] }[] = [
	{ key: "surfaceTint", values: SURFACE_TINTS },
	{ key: "radius", values: RADIUS_SCALES },
	{ key: "chartMode", values: CHART_MODES },
	{ key: "fontPairing", values: FONT_PAIRINGS },
];

export function ThemeStudio() {
	const id = useId();
	const vm = useThemeStudioViewModel();
	return (
		<div className="space-y-basalt-layout">
			<LayerCard padding="none">
				<LayerCard.Header className="flex-wrap items-center justify-between">
					<div className="flex flex-wrap items-center gap-basalt-space-lg">
						<span>Theme Studio</span>
						<Badge variant="outline">{PRESET_LABELS[vm.presetId] ?? vm.presetId}</Badge>
					</div>
					<div className="flex flex-wrap gap-basalt-space-lg">
						<Button size="sm" variant="outline" onClick={vm.reset}>
							Reset studio
						</Button>
						<Button size="sm" variant="outline" onClick={() => void vm.copyShareLink()}>
							Copy link
						</Button>
					</div>
				</LayerCard.Header>
				<LayerCard.Body className="space-y-basalt-layout">
					<div className="space-y-basalt-space-lg">
						<p className="text-basalt-sm font-medium text-basalt-muted-foreground">
							Curated presets
						</p>
						<div
							role="group"
							aria-label="Curated presets"
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
									{PRESET_LABELS[preset.id] ?? preset.id}
								</Button>
							))}
						</div>
					</div>
					<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2 lg:grid-cols-4">
						{CONTROLS.map(({ key, values }) => (
							<div key={key} className="space-y-basalt-space-lg">
								<Label htmlFor={`${id}-${key}`}>{CONTROL_LABELS[key]}</Label>
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
												{CONTROL_VALUE_LABELS[key][value] ?? value}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						))}
					</div>
					<p className="text-basalt-sm text-basalt-muted-foreground">
						Links share preset choices; custom palette colors remain in this browser. To use the
						CSS, set AccentProvider's applyToDocument to false.
					</p>
					{vm.copyStatus !== "idle" && (
						<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
							{COPY_STATUS_MESSAGES[vm.copyStatus]}
						</p>
					)}
				</LayerCard.Body>
			</LayerCard>
			<LayerCard padding="none">
				<LayerCard.Header className="flex-wrap items-center justify-between">
					<div className="flex items-center gap-basalt-space-lg">
						<span>Live stage</span>
						<Badge variant="outline">{vm.mode === "dark" ? "Dark" : "Light"}</Badge>
					</div>
					<div className="flex flex-wrap items-center gap-basalt-space-lg">
						<SegmentControl
							aria-label="Studio view"
							value={vm.stageTab}
							onValueChange={(value) => vm.setStageTab(value as "preview" | "code")}
							options={[
								{ value: "preview", label: "01 Micro-Scene Wall" },
								{ value: "code", label: "02 Token Diff CSS" },
							]}
						/>
						<Button size="sm" variant="outline" onClick={() => void vm.copyCssDiff()}>
							Copy CSS
						</Button>
					</div>
				</LayerCard.Header>
				{vm.stageTab === "code" && (
					<CodeHighlighted
						attached
						title="basalt-theme-overrides.css"
						code={vm.cssDiff}
						lineNumbers
						copyable={false}
					/>
				)}
			</LayerCard>
			{vm.stageTab === "preview" && (
				<div
					data-theme-studio-stage=""
					style={vm.scopedVars as CSSProperties}
					className="space-y-basalt-layout bg-basalt-background p-basalt-card"
				>
					<div className="flex flex-wrap items-center justify-between gap-basalt-layout">
						<p className="font-basalt-display text-basalt-lg font-semibold text-basalt-foreground">
							Workspace overview
						</p>
						<div role="img" aria-label="Chart colors preview" className="flex gap-basalt-space-sm">
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
						aria-label="Surface hierarchy preview"
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
			)}
		</div>
	);
}
