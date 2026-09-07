import { AreaChart } from "@nocoo/basalt/charts/area";
import { DonutChart } from "@nocoo/basalt/charts/donut";
import { Gauge } from "@nocoo/basalt/charts/gauge";
import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";
import { LineChart } from "@nocoo/basalt/charts/line";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Switch } from "@nocoo/basalt/components/switch";
import { useAccent } from "@nocoo/basalt/providers/accent";
import { Check } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { PaletteEditor } from "@/components/PaletteEditor";
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
		<div className="flex w-24 flex-col items-center gap-2">
			<div
				className="size-12 rounded-lg border border-border"
				style={{ background: `hsl(var(${token}))` }}
			/>
			<p className="text-center text-xs font-medium text-foreground">{label}</p>
			<code className="break-all text-center text-[10px] text-muted-foreground">{token}</code>
		</div>
	);
}

export default function PalettePage() {
	const { t } = useTranslation();
	const { accent, setAccent, swatches } = useAccent();
	const [preview, setPreview] = useState(false);
	const previewId = useId();

	return (
		<div className="space-y-8">
			<PageHeader title={t("pages.palette.title")} description={t("pages.palette.description")} />

			<SectionRule title={t("pages.palette.themePalette")}>
				<div className="space-y-4">
					<p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
						{t("pages.palette.candyDescription")}
					</p>
					<div
						className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6"
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
								className={`group min-w-0 rounded-xl border p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary ${color.id === accent ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
							>
								<span
									data-accent-swatch={color.id}
									className="relative block h-16 overflow-hidden rounded-lg border border-black/5 sm:h-20"
									style={{ background: `hsl(var(${color.token}))` }}
								>
									<span
										className="absolute inset-0 bg-linear-to-br from-white/30 to-transparent"
										aria-hidden="true"
									/>
								</span>
								<span className="mt-2 flex items-center justify-between gap-1 px-0.5 text-xs font-medium text-foreground">
									{color.label}
									{color.id === accent && (
										<Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
									)}
								</span>
							</button>
						))}
					</div>
					<LayerCard data-palette-preview className="flex flex-wrap items-center gap-x-6 gap-y-4">
						<Button aria-pressed={preview} onClick={() => setPreview(!preview)}>
							{t(preview ? "pages.palette.previewActive" : "pages.palette.previewAction")}
						</Button>
						<label htmlFor={`${previewId}-check`} className="flex items-center gap-2 text-xs">
							<Checkbox id={`${previewId}-check`} defaultChecked />
							{t("pages.palette.previewCheckbox")}
						</label>
						<label htmlFor={`${previewId}-switch`} className="flex items-center gap-2 text-xs">
							<Switch id={`${previewId}-switch`} defaultChecked />
							{t("pages.palette.previewSwitch")}
						</label>
						<span className="text-xs text-muted-foreground">{t("pages.palette.contrastNote")}</span>
					</LayerCard>
					<PaletteEditor />
				</div>
			</SectionRule>

			<SectionRule title={t("pages.palette.chartPalette")}>
				<LayerCard>
					<p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
						{t("pages.palette.chartDescription")}
					</p>
					<div className="grid grid-cols-5 gap-3" data-chart-palette>
						{CHART_COLORS.map((color, index) => (
							<div key={color} className="min-w-0 space-y-2">
								<div
									className="h-12 rounded-lg"
									style={{ background: color }}
									data-chart-swatch={index}
								/>
								<p className="text-xs text-muted-foreground">
									{["Blue", "Pink", "Green", "Yellow", "Gray"][index]}
								</p>
							</div>
						))}
					</div>
				</LayerCard>
			</SectionRule>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
							className="h-[200px] w-full"
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
								className="h-[180px] w-[180px]"
								valueFormatter={formatPercent}
							/>
							<div className="mt-4 grid w-full grid-cols-3 gap-x-4 gap-y-3">
								{pieData.map((item, i) => (
									<div key={item.name} className="flex flex-col items-center gap-0.5">
										<span className="font-display text-sm font-medium text-foreground">
											{item.value}%
										</span>
										<div className="flex items-center gap-1.5">
											<div
												className="h-2 w-2 rounded-full"
												style={{ background: CHART_COLORS[i] }}
											/>
											<span className="text-xs text-muted-foreground">{item.name}</span>
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
							className="h-[200px] w-full"
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
							className="h-[200px] w-full"
							showAxes
							showLegend
							valueFormatter={formatUsd}
						/>
					</LayerCard>
				</SectionRule>

				<SectionRule title={t("pages.palette.ringChart")}>
					<LayerCard>
						<div data-palette-rings className="flex flex-wrap items-center justify-center gap-4">
							{[0, 64, 100].map((value) => (
								<Gauge
									key={value}
									value={value}
									valueFormatter={(number) => `${number}%`}
									ariaLabel={`${t("pages.palette.ringChart")} ${value}%`}
									className="h-28 w-28"
								/>
							))}
						</div>
						<p className="mt-3 text-xs leading-relaxed text-muted-foreground">
							{t("pages.palette.ringDescription")}
						</p>
					</LayerCard>
				</SectionRule>
			</div>
			<details className="rounded-xl border border-border p-4">
				<summary className="cursor-pointer text-sm font-medium">
					{t("pages.palette.baseColors")}
				</summary>
				<div className="mt-4 flex flex-wrap gap-5">
					{[...baseColors, ...utilityColors].map((color) => (
						<Swatch key={color.token} token={color.token} label={color.label} />
					))}
				</div>
			</details>
		</div>
	);
}
