import { AreaChart } from "@nocoo/basalt/charts/area";
import { DonutChart } from "@nocoo/basalt/charts/donut";
import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";
import { LineChart } from "@nocoo/basalt/charts/line";
import { useAccent } from "@nocoo/basalt/providers/accent";
import { Activity, BarChart3, LineChart as LineChartIcon, Palette, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
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

const THEME_SEMANTICS: Record<string, string> = {
	primary: "Primary",
	green: "Positive",
	red: "Destructive",
	gray: "Muted",
};

const utilityColors = [
	{ token: "--chart-axis", label: "Axis Text" },
	{ token: "--chart-muted", label: "Muted Fill" },
];

// ── Components ──

function Swatch({
	token,
	label,
	subtitle,
	selected,
	onSelect,
}: {
	token: string;
	label: string;
	subtitle?: string;
	selected?: boolean;
	onSelect?: () => void;
}) {
	const swatch = (
		<div
			className={`h-14 w-14 rounded-widget border border-border shadow-xs ${
				selected ? "ring-2 ring-basalt-foreground ring-offset-2 ring-offset-basalt-background" : ""
			}`}
			style={{ background: `hsl(var(${token}))` }}
		/>
	);
	return (
		<div className="flex flex-col items-center gap-2">
			{onSelect ? (
				<button
					type="button"
					className="rounded-widget"
					aria-label={label}
					aria-pressed={selected}
					onClick={onSelect}
				>
					{swatch}
				</button>
			) : (
				swatch
			)}
			<div className="text-center">
				<p className="text-xs font-medium text-foreground">{label}</p>
				{subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
				<p className="text-[10px] text-muted-foreground font-mono">{token}</p>
			</div>
		</div>
	);
}

function Section({
	title,
	icon: Icon,
	children,
}: {
	title: string;
	icon?: React.ElementType;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-card bg-secondary p-4 md:p-5">
			<div className="flex items-center gap-2 mb-4">
				{Icon && <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />}
				<p className="text-sm text-muted-foreground">{title}</p>
			</div>
			{children}
		</div>
	);
}

export default function PalettePage() {
	const { t } = useTranslation();
	const { accent, setAccent, swatches } = useAccent();

	return (
		<>
			{/* Base Colors */}
			<Section title={t("pages.palette.baseColors")} icon={Palette}>
				<div className="flex flex-wrap gap-5">
					{baseColors.map((c) => (
						<Swatch key={c.token} token={c.token} label={c.label} subtitle={c.tier || undefined} />
					))}
				</div>
			</Section>

			{/* Chart Palette */}
			<div className="mt-4">
				<Section title={t("pages.palette.themePalette")} icon={Palette}>
					<div className="grid grid-cols-6 gap-4 sm:grid-cols-8 lg:grid-cols-12">
						{swatches.map((c) => (
							<Swatch
								key={c.id}
								token={c.token}
								label={c.label}
								subtitle={THEME_SEMANTICS[c.id]}
								selected={c.id === accent}
								onSelect={() => setAccent(c.id)}
							/>
						))}
					</div>
					<div className="mt-5 pt-4 border-t border-border">
						<p className="text-xs text-muted-foreground mb-3">{t("pages.palette.utilityTokens")}</p>
						<div className="flex flex-wrap gap-5">
							{utilityColors.map((c) => (
								<Swatch key={c.token} token={c.token} label={c.label} />
							))}
						</div>
					</div>
				</Section>
			</div>

			{/* Chart Examples */}
			<div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-2">
				{/* Line Chart */}
				<Section title={t("pages.palette.lineChart")} icon={LineChartIcon}>
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
				</Section>

				{/* Donut Chart */}
				<Section title={t("pages.palette.donutChart")} icon={Target}>
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
									<span className="text-sm font-medium text-foreground font-display">
										{item.value}%
									</span>
									<div className="flex items-center gap-1.5">
										<div className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
										<span className="text-xs text-muted-foreground">{item.name}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</Section>

				{/* Bar Chart */}
				<Section title={t("pages.palette.groupedBarChart")} icon={BarChart3}>
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
				</Section>

				{/* Area Chart */}
				<Section title={t("pages.palette.areaChart")} icon={Activity}>
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
				</Section>
			</div>
		</>
	);
}
