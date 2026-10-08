import { AreaChart } from "@nocoo/basalt/charts/area";
import { DonutChart } from "@nocoo/basalt/charts/donut";
import { Gauge } from "@nocoo/basalt/charts/gauge";
import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";
import { LineChart } from "@nocoo/basalt/charts/line";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Switch } from "@nocoo/basalt/components/switch";
import { useAccent } from "@nocoo/basalt/providers/accent";
import { Check } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { PaletteEditor } from "@/components/PaletteEditor";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatPercent, formatUsd } from "@/lib/format";
import { CHART_COLORS } from "@/lib/palette";

// ── Mock data for example charts ──

const lineData = [
	{ name: "Jan", a: 4000, b: 2400, c: 1200 },
	{ name: "Feb", a: 3000, b: 3200, c: 1800 },
	{ name: "Mar", a: 5000, b: 2800, c: 2200 },
	{ name: "Apr", a: 4500, b: 3600, c: 1600 },
	{ name: "May", a: 6000, b: 3000, c: 2800 },
	{ name: "Jun", a: 5500, b: 4200, c: 2400 },
];

const pieData = [
	{ name: "Stocks", value: 45 },
	{ name: "Bonds", value: 20 },
	{ name: "Real Estate", value: 15 },
	{ name: "Crypto", value: 10 },
	{ name: "Cash", value: 10 },
].map((d, i) => ({ ...d, fill: CHART_COLORS[i] }));

const barData = [
	{ name: "Mon", income: 1200, expense: 800 },
	{ name: "Tue", income: 900, expense: 1100 },
	{ name: "Wed", income: 1500, expense: 700 },
	{ name: "Thu", income: 800, expense: 900 },
	{ name: "Fri", income: 2000, expense: 1200 },
];

const areaData = [
	{ name: "Jul", inflow: 6200, outflow: 4800 },
	{ name: "Aug", inflow: 5800, outflow: 5200 },
	{ name: "Sep", inflow: 7100, outflow: 4900 },
	{ name: "Oct", inflow: 6500, outflow: 5500 },
	{ name: "Nov", inflow: 8200, outflow: 6100 },
];

// ── Color swatch data ──

const baseColors = [
	{ token: "--background", label: "Background", tier: "L0" },
	{ token: "--card", label: "Card", tier: "L1" },
	{ token: "--secondary", label: "Secondary", tier: "L2" },
	{ token: "--foreground", label: "Foreground", tier: "" },
	{ token: "--primary", label: "Primary", tier: "" },
	{ token: "--muted", label: "Muted", tier: "" },
	{ token: "--muted-foreground", label: "Muted FG", tier: "" },
	{ token: "--accent", label: "Accent", tier: "" },
	{ token: "--border", label: "Border", tier: "" },
	{ token: "--destructive", label: "Destructive", tier: "" },
	{ token: "--success", label: "Success", tier: "" },
	{ token: "--badge-red", label: "Badge Red", tier: "" },
];

const utilityColors = [
	{ token: "--chart-axis", label: "Axis Text" },
	{ token: "--chart-muted", label: "Muted Fill" },
];

// ── Components ──

function Swatch({ token, label }: { token: string; label: string }) {
	return (
		<div className="flex w-24 flex-col items-center gap-basalt-space-lg">
			<div
				className="size-12 rounded-basalt-md border border-border"
				style={{ background: `hsl(var(${token}))` }}
			/>
			<p className="text-center text-basalt-sm font-medium text-foreground">{label}</p>
			<code className="break-all text-center text-basalt-xs text-muted-foreground">{token}</code>
		</div>
	);
}

export default function PalettePage() {
	const { t } = useTranslation();
	const { accent, setAccent, swatches } = useAccent();
	const [preview, setPreview] = useState(false);
	const previewId = useId();

	return (
		<ShowcasePage title={t("pages.palette.title")} description={t("pages.palette.description")}>
			<SectionRule title={t("pages.palette.themePalette")}>
				<div className="space-y-basalt-space-lg">
					<p className="max-w-3xl text-basalt-base leading-basalt-relaxed text-muted-foreground">
						{t("pages.palette.candyDescription")}
					</p>
					<div
						className="grid grid-cols-3 gap-basalt-layout sm:grid-cols-4 xl:grid-cols-6"
						role="group"
						aria-label={t("pages.palette.themePalette")}
					>
						{swatches.map((color) => (
							<button
								key={color.id}
								type="button"
								aria-label={color.label}
								aria-pressed={color.id === accent}
								data-accent-choice={color.id}
								onClick={() => setAccent(color.id)}
								className={`group min-w-0 rounded-basalt-lg border p-basalt-space-lg text-left transition-colors basalt-motion focus-visible:outline-2 focus-visible:outline-primary ${color.id === accent ? "border-basalt-primary bg-basalt-selected" : "border-border hover:border-primary/50"}`}
							>
								<span
									data-accent-swatch={color.id}
									className="relative block h-16 overflow-hidden rounded-basalt-md border border-black/5 sm:h-20"
									style={{ background: `hsl(var(${color.token}))` }}
								>
									<span
										className="absolute inset-0 bg-linear-to-br from-white/30 to-transparent"
										aria-hidden="true"
									/>
								</span>
								<span className="mt-basalt-space-lg flex items-center justify-between gap-basalt-space-sm px-basalt-space-xs text-basalt-sm font-medium text-foreground">
									{color.label}
									{color.id === accent && (
										<Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
									)}
								</span>
							</button>
						))}
					</div>
					<LayerCard
						data-palette-preview
						className="flex flex-wrap items-center gap-x-basalt-space-lg gap-y-basalt-space-lg"
					>
						<Button aria-pressed={preview} onClick={() => setPreview(!preview)}>
							{t(preview ? "pages.palette.previewActive" : "pages.palette.previewAction")}
						</Button>
						<label
							htmlFor={`${previewId}-check`}
							className="flex items-center gap-basalt-space-lg text-basalt-sm"
						>
							<Checkbox id={`${previewId}-check`} defaultChecked />
							{t("pages.palette.previewCheckbox")}
						</label>
						<label
							htmlFor={`${previewId}-switch`}
							className="flex items-center gap-basalt-space-lg text-basalt-sm"
						>
							<Switch id={`${previewId}-switch`} defaultChecked />
							{t("pages.palette.previewSwitch")}
						</label>
						<span className="text-basalt-sm text-muted-foreground">
							{t("pages.palette.contrastNote")}
						</span>
					</LayerCard>
					<PaletteEditor />
				</div>
			</SectionRule>

			<SectionRule title={t("pages.palette.chartPalette")}>
				<LayerCard>
					<p className="mb-basalt-space-lg max-w-3xl text-basalt-base leading-basalt-relaxed text-muted-foreground">
						{t("pages.palette.chartDescription")}
					</p>
					<div className="grid grid-cols-5 gap-basalt-layout" data-chart-palette>
						{CHART_COLORS.map((color, index) => (
							<div key={color} className="min-w-0 space-y-basalt-space-lg">
								<div
									className="h-12 rounded-basalt-md"
									style={{ background: color }}
									data-chart-swatch={index}
								/>
								<p className="text-basalt-sm text-muted-foreground">
									{["Blue", "Pink", "Green", "Yellow", "Gray"][index]}
								</p>
							</div>
						))}
					</div>
				</LayerCard>
			</SectionRule>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				{/* Line Chart */}
				<SectionRule title={t("pages.palette.lineChart")}>
					<LayerCard>
						<LineChart
							data={lineData.map((row) => ({ x: row.name, y: row.a, y2: row.b, y3: row.c }))}
							series={[
								{ key: "y", label: t("pages.palette.seriesA") },
								{ key: "y2", label: t("pages.palette.seriesB") },
								{ key: "y3", label: t("pages.palette.seriesC") },
							]}
							ariaLabel={t("pages.palette.lineChartAria")}
							className="h-[12.5rem] w-full"
							showAxes
							showLegend
						/>
					</LayerCard>
				</SectionRule>

				<SectionRule title={t("pages.palette.donutChart")}>
					<LayerCard>
						<div className="flex flex-col items-center">
							<DonutChart
								data={pieData}
								ariaLabel={t("pages.palette.donutChartAria")}
								className="h-[11.25rem] w-[11.25rem]"
								valueFormatter={formatPercent}
							/>
							<div className="mt-basalt-space-lg grid w-full grid-cols-3 gap-x-basalt-space-lg gap-y-basalt-space-lg">
								{pieData.map((item, i) => (
									<div key={item.name} className="flex flex-col items-center gap-basalt-space-xs">
										<span className="font-display text-basalt-base font-medium text-foreground">
											{item.value}%
										</span>
										<div className="flex items-center gap-basalt-space-md">
											<div
												className="h-2 w-2 rounded-basalt-full"
												style={{ background: CHART_COLORS[i] }}
											/>
											<span className="text-basalt-sm text-muted-foreground">{item.name}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</LayerCard>
				</SectionRule>

				<SectionRule title={t("pages.palette.groupedBarChart")}>
					<LayerCard>
						<GroupedBarChart
							data={barData.map((row) => ({ x: row.name, y: row.income, y2: row.expense }))}
							series={[
								{ key: "y", label: t("pages.palette.income") },
								{ key: "y2", label: t("pages.palette.expense") },
							]}
							ariaLabel={t("pages.palette.groupedBarChartAria")}
							className="h-[12.5rem] w-full"
							showAxes
							showLegend
							valueFormatter={formatUsd}
						/>
					</LayerCard>
				</SectionRule>

				<SectionRule title={t("pages.palette.areaChart")}>
					<LayerCard>
						<AreaChart
							data={areaData.map((row) => ({ x: row.name, y: row.inflow, y2: row.outflow }))}
							series={[
								{ key: "y", label: t("pages.palette.inflow") },
								{ key: "y2", label: t("pages.palette.outflow") },
							]}
							ariaLabel={t("pages.palette.areaChartAria")}
							className="h-[12.5rem] w-full"
							showAxes
							showLegend
							valueFormatter={formatUsd}
						/>
					</LayerCard>
				</SectionRule>

				<SectionRule title={t("pages.palette.ringChart")}>
					<LayerCard>
						<LayerCard.Header
							data-palette-rings
							className="flex flex-wrap items-center justify-center gap-basalt-space-lg"
						>
							{[0, 64, 100].map((value) => (
								<Gauge
									key={value}
									value={value}
									valueFormatter={(number) => `${number}%`}
									ariaLabel={`${t("pages.palette.ringChart")} ${value}%`}
									className="h-28 w-28"
								/>
							))}
						</LayerCard.Header>
						<LayerCard.Body>
							<p className="mt-basalt-space-lg text-basalt-sm leading-basalt-relaxed text-muted-foreground">
								{t("pages.palette.ringDescription")}
							</p>
						</LayerCard.Body>
					</LayerCard>
				</SectionRule>
			</div>
			<Collapsible asChild>
				<LayerCard>
					<LayerCard.Header asChild>
						<CollapsibleTrigger className="w-full hover:bg-basalt-hover">
							{t("pages.palette.baseColors")}
						</CollapsibleTrigger>
					</LayerCard.Header>
					<CollapsibleContent unstyled>
						<LayerCard.Body className="flex flex-wrap gap-basalt-space-lg border-t border-basalt-border">
							{[...baseColors, ...utilityColors].map((color) => (
								<Swatch key={color.token} token={color.token} label={color.label} />
							))}
						</LayerCard.Body>
					</CollapsibleContent>
				</LayerCard>
			</Collapsible>
		</ShowcasePage>
	);
}
