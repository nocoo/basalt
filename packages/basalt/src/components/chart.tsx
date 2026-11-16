import {
	type ComponentProps,
	cloneElement,
	createElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useId,
} from "react";
import { cn } from "../utils/cn";

export type ChartFrameProps = {
	ariaLabel: string;
	className?: string;
	children: ReactNode;
	size?: string;
	summary?: ReactNode;
	dataAlternative?: ReactNode;
	legend?: ReactNode;
	accessibilityLayer?: boolean;
};

export type ChartShellProps = ChartFrameProps;
export type ChartAccessibilityProps = Pick<
	ChartFrameProps,
	"summary" | "dataAlternative" | "accessibilityLayer"
>;

function hasSlotContent(slot: ReactNode | undefined): boolean {
	return slot !== undefined && slot !== null && slot !== false;
}

export function ChartFrame({
	ariaLabel,
	className,
	children,
	size = "h-basalt-36 w-basalt-56",
	summary,
	dataAlternative,
	legend,
	accessibilityLayer,
}: ChartFrameProps) {
	const summaryId = useId();
	const hasSummary = hasSlotContent(summary);
	const hasAlternative = hasSlotContent(dataAlternative);
	const hasLegend = hasSlotContent(legend);
	const plotChildren =
		accessibilityLayer !== undefined &&
		isValidElement<{ accessibilityLayer?: boolean }>(children) &&
		typeof children.type !== "string"
			? cloneElement(children as ReactElement<{ accessibilityLayer?: boolean }>, {
					accessibilityLayer,
				})
			: children;
	const plot = (
		<div
			className={cn(
				hasLegend ? "w-full min-h-0 min-w-0 flex-1 basalt-chart" : size,
				!hasLegend && className,
				!hasLegend && "min-h-0 min-w-0 basalt-chart",
			)}
		>
			{plotChildren}
		</div>
	);
	const framed = hasLegend ? (
		<div data-testid="chart-shell" className={cn("flex min-h-0 min-w-0 flex-col", size, className)}>
			{plot}
			{legend}
		</div>
	) : (
		plot
	);
	if (!hasSummary && !hasAlternative) {
		return (
			<figure role="group" aria-label={ariaLabel} className="contents m-0 p-0">
				{framed}
			</figure>
		);
	}
	return (
		<figure
			role="group"
			aria-label={ariaLabel}
			aria-describedby={hasSummary ? summaryId : undefined}
			className="relative m-0 flex min-h-0 min-w-0 flex-col gap-basalt-space-lg p-0"
		>
			{hasSummary ? (
				<div id={summaryId} className="text-basalt-sm text-basalt-muted-foreground">
					{summary}
				</div>
			) : null}
			{framed}
			{hasAlternative ? (
				<div className="text-basalt-sm text-basalt-muted-foreground">{dataAlternative}</div>
			) : null}
		</figure>
	);
}

export const ChartShell = ChartFrame;

const HIDDEN_SERIES_KEYS = new Set(["y", "y2", "y3", "value", "target"]);
const TITLE_SIZE = "var(--basalt-text-sm)";
const BODY_SIZE = "var(--basalt-text-sm)";
const DOT_SIZE = "var(--basalt-space-lg)";

export type ChartTooltipItem = {
	name?: string;
	value?: number | string;
	color?: string;
	fill?: string;
	stroke?: string;
	dataKey?: string | number;
};

export type ChartTooltipContentProps = {
	active?: boolean;
	payload?: readonly ChartTooltipItem[];
	label?: string | number;
	formatter?: (value: number) => string;
};

export interface ChartTooltipRowProps extends Omit<ComponentProps<"div">, "children"> {
	label?: ReactNode;
	value?: ReactNode;
	color?: string;
	unit?: ReactNode;
	formatter?: (value: number) => string;
	hideIndicator?: boolean;
}

export interface ChartTooltipSummaryProps extends Omit<ComponentProps<"div">, "children"> {
	label?: ReactNode;
	value?: ReactNode;
	unit?: ReactNode;
	formatter?: (value: number) => string;
}

export interface ChartTooltipDividerProps extends Omit<ComponentProps<"hr">, "children"> {}

export function formatChartNumber(value: number): string {
	if (!Number.isFinite(value)) return "—";
	return new Intl.NumberFormat(undefined, {
		maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
	}).format(value);
}

function seriesLabel(item: ChartTooltipItem): string | undefined {
	const name = item.name == null ? "" : String(item.name);
	const key = item.dataKey == null ? "" : String(item.dataKey);
	if (HIDDEN_SERIES_KEYS.has(name) || HIDDEN_SERIES_KEYS.has(key)) return undefined;
	return name || undefined;
}

function seriesSwatch(item: ChartTooltipItem): string {
	return item.color ?? item.fill ?? item.stroke ?? "hsl(var(--basalt-chart-1))";
}

function formatTooltipValue(val: ReactNode, formatter?: (value: number) => string): ReactNode {
	if (val == null) return "—";
	return typeof val === "number" ? (formatter ? formatter(val) : formatChartNumber(val)) : val;
}

export function ChartTooltipRow({
	label,
	value,
	color,
	unit,
	formatter,
	hideIndicator = false,
	style,
	...rest
}: ChartTooltipRowProps) {
	const formattedValue = formatTooltipValue(value, formatter);
	const hasLabel = label != null;
	return (
		<div
			data-testid="chart-tooltip-row"
			style={{
				alignItems: "center",
				display: "flex",
				fontSize: BODY_SIZE,
				gap: "var(--basalt-space-lg)",
				lineHeight: "var(--basalt-leading-relaxed)",
				minWidth: 0,
				...style,
			}}
			{...rest}
		>
			{hideIndicator ? null : (
				<span
					aria-hidden="true"
					style={{
						background: color ?? "hsl(var(--basalt-chart-1))",
						borderRadius: "var(--basalt-radius-full)",
						boxShadow: "0 0 0 1px hsl(var(--basalt-popover-foreground) / 0.12)",
						flexShrink: 0,
						height: DOT_SIZE,
						width: DOT_SIZE,
					}}
				/>
			)}
			{hasLabel ? (
				<span
					style={{
						color: "hsl(var(--basalt-muted-foreground))",
						flex: 1,
						minWidth: 0,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{label}
				</span>
			) : null}
			{hasLabel ? " " : null}
			<span
				style={{
					color: "hsl(var(--basalt-popover-foreground))",
					flexShrink: 0,
					fontVariantNumeric: "tabular-nums",
					fontWeight: 600,
					marginLeft: hasLabel ? 0 : "auto",
				}}
			>
				{formattedValue}
				{unit != null && formattedValue !== "—" ? (
					<span style={{ fontWeight: 400, marginLeft: "var(--basalt-space-xs)" }}>{unit}</span>
				) : null}
			</span>
		</div>
	);
}

export function ChartTooltipDivider({ style, ...rest }: ChartTooltipDividerProps) {
	return (
		<hr
			aria-orientation="horizontal"
			data-testid="chart-tooltip-divider"
			style={{
				backgroundColor: "hsl(var(--basalt-border) / 0.55)",
				border: 0,
				height: 1,
				margin: "var(--basalt-space-sm) 0",
				width: "100%",
				...style,
			}}
			{...rest}
		/>
	);
}

export function ChartTooltipSummary({
	label = "Total",
	value,
	unit,
	formatter,
	style,
	...rest
}: ChartTooltipSummaryProps) {
	const formattedValue = formatTooltipValue(value, formatter);
	const hasLabel = label != null;
	return (
		<div
			data-testid="chart-tooltip-summary"
			style={{
				alignItems: "center",
				display: "flex",
				fontSize: BODY_SIZE,
				gap: "var(--basalt-space-lg)",
				lineHeight: "var(--basalt-leading-relaxed)",
				minWidth: 0,
				...style,
			}}
			{...rest}
		>
			{hasLabel ? (
				<span
					style={{
						color: "hsl(var(--basalt-muted-foreground))",
						flex: 1,
						fontWeight: 600,
						minWidth: 0,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{label}
				</span>
			) : null}
			{hasLabel ? " " : null}
			<span
				style={{
					color: "hsl(var(--basalt-popover-foreground))",
					flexShrink: 0,
					fontVariantNumeric: "tabular-nums",
					fontWeight: 700,
					marginLeft: hasLabel ? 0 : "auto",
				}}
			>
				{formattedValue}
				{unit != null && formattedValue !== "—" ? (
					<span style={{ fontWeight: 500, marginLeft: "var(--basalt-space-xs)" }}>{unit}</span>
				) : null}
			</span>
		</div>
	);
}

export function ChartTooltipContent({
	active,
	payload,
	label,
	formatter,
}: ChartTooltipContentProps) {
	if (!active || !payload?.length) return null;
	const title = label == null || label === "" ? undefined : String(label);
	return (
		<div
			data-testid="chart-tooltip"
			style={{
				background: "hsl(var(--basalt-popover))",
				border: "1px solid hsl(var(--basalt-border) / 0.55)",
				borderRadius: "var(--basalt-radius-md)",
				boxShadow: "0 12px 28px -8px rgb(0 0 0 / 0.28), 0 4px 10px -4px rgb(0 0 0 / 0.16)",
				color: "hsl(var(--basalt-popover-foreground))",
				maxWidth: "13.75rem",
				minWidth: "8rem",
				padding: "var(--basalt-space-default)",
			}}
		>
			{title ? (
				<p
					style={{
						color: "hsl(var(--basalt-popover-foreground))",
						fontSize: TITLE_SIZE,
						fontWeight: 600,
						letterSpacing: "-0.01em",
						lineHeight: "var(--basalt-leading-tight)",
						margin: "0 0 var(--basalt-space-lg)",
					}}
				>
					{title}
				</p>
			) : null}
			<div style={{ display: "flex", flexDirection: "column", gap: "var(--basalt-space-sm)" }}>
				{payload.map((item, index) => {
					const raw = item.value;
					const numeric =
						typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
					return (
						<ChartTooltipRow
							key={`${String(item.dataKey ?? item.name ?? index)}-${String(index)}`}
							label={seriesLabel(item)}
							color={seriesSwatch(item)}
							value={
								Number.isFinite(numeric)
									? (formatter ?? formatChartNumber)(numeric)
									: String(raw ?? "—")
							}
							data-testid={undefined}
						/>
					);
				})}
			</div>
		</div>
	);
}

const v = (token: string) => `hsl(var(--basalt-${token}))`;
export const withAlpha = (token: string, alpha: number) => `hsl(var(--basalt-${token}) / ${alpha})`;
export const chartAxis = v("chart-axis");
export const chartMuted = v("chart-muted");
export const chart = {
	primary: v("chart-1"),
	sky: v("chart-2"),
	teal: v("chart-3"),
	jade: v("chart-4"),
	green: v("chart-5"),
	lime: v("chart-6"),
	amber: v("chart-7"),
	orange: v("chart-8"),
	vermilion: v("chart-9"),
	red: v("chart-10"),
	rose: v("chart-11"),
	magenta: v("chart-12"),
	orchid: v("chart-13"),
	purple: v("chart-14"),
	indigo: v("chart-15"),
	cobalt: v("chart-16"),
	steel: v("chart-17"),
	cadet: v("chart-18"),
	seafoam: v("chart-19"),
	olive: v("chart-20"),
	gold: v("chart-21"),
	tangerine: v("chart-22"),
	crimson: v("chart-23"),
	gray: v("chart-24"),
} as const;
export const CHART_COLORS = [chart.primary, chart.rose, chart.green, chart.amber, chart.gray];

export type ChartPaletteProps = { ariaLabel?: string };
export function ChartPalette({ ariaLabel = "Chart colors" }: ChartPaletteProps) {
	return (
		<div className="flex flex-wrap gap-basalt-space-lg" role="img" aria-label={ariaLabel}>
			{CHART_COLORS.map((color) => (
				<span
					key={color}
					className="h-basalt-8 w-basalt-8 rounded-basalt-sm"
					style={{ background: color }}
				/>
			))}
		</div>
	);
}

export type ChartSeriesDescriptor<K extends string = string> = {
	key: K;
	label?: string;
	color?: string;
};
export type XYSeriesKey = "y" | "y2" | "y3";
export type XYSeriesDescriptor<K extends string = XYSeriesKey> = ChartSeriesDescriptor<K>;
export type BulletSeriesKey = "value" | "target";
export type BulletSeriesDescriptor = ChartSeriesDescriptor & { key: BulletSeriesKey };
export type XYPoint = { x: string | number; y: number; y2?: number; y3?: number };
export type NamedValue = { name: string; value: number };
export type RadarPoint = { subject: string; value: number };
export type BulletPoint = { name: string; value: number; target: number };
export type SankeyData = {
	nodes: { name: string }[];
	links: { source: number; target: number; value: number }[];
};

export function resolveChartSeries<K extends string>(
	series: Array<ChartSeriesDescriptor<K>> | undefined,
	fallbackKeys: K[],
): Array<ChartSeriesDescriptor<K>> {
	return series && series.length > 0 ? series : fallbackKeys.map((key) => ({ key }));
}

export function applyLeadColor<K extends string>(
	items: Array<ChartSeriesDescriptor<K>>,
	color?: string,
): Array<ChartSeriesDescriptor<K>> {
	return color
		? items.map((item, index) => (index === 0 ? { ...item, color: item.color ?? color } : item))
		: items;
}

export function xyFallbackKeys(data: Array<{ y2?: number; y3?: number }>): string[] {
	const keys = ["y"];
	if (data.some((point) => point.y2 != null)) keys.push("y2");
	if (data.some((point) => point.y3 != null)) keys.push("y3");
	return keys;
}

export type ChartLegendShape = "bar" | "line" | "area";
export type ChartLegendProps = { items: ChartSeriesDescriptor[]; shape?: ChartLegendShape };
export function ChartLegend({ items, shape = "line" }: ChartLegendProps) {
	if (items.length === 0) return null;
	return (
		<div
			data-testid="chart-legend"
			style={{
				color: "hsl(var(--basalt-muted-foreground))",
				columnGap: "var(--basalt-space-default)",
				display: "flex",
				flexWrap: "wrap",
				fontSize: "var(--basalt-text-sm)",
				marginTop: "var(--basalt-space-default)",
				rowGap: "var(--basalt-space-sm)",
			}}
		>
			{items.map((item, index) => {
				const color = seriesColor(item, index) ?? CHART_COLORS[0];
				return (
					<div
						key={item.key}
						style={{ alignItems: "center", display: "flex", gap: "var(--basalt-space-md)" }}
					>
						<svg width="18" height="10" aria-hidden="true">
							{shape === "bar" ? (
								<rect x="1" y="2" width="16" height="6" rx="1" fill={color} />
							) : shape === "area" ? (
								<polygon points="0,8 4,4 9,6 18,2 18,8" fill={color} opacity="0.7" />
							) : (
								<line x1="0" y1="5" x2="18" y2="5" stroke={color} strokeWidth="2" />
							)}
						</svg>
						<span>{item.label ?? item.key}</span>
					</div>
				);
			})}
		</div>
	);
}

export type ChartTypeFace = "axis" | "legend" | "tooltipTitle" | "tooltipBody";
export const CHART_TYPE = {
	axisFontSize: "var(--basalt-text-sm)",
	legendFontSize: "var(--basalt-text-sm)",
	tooltipTitleSize: "var(--basalt-text-sm)",
	tooltipBodySize: "var(--basalt-text-sm)",
	tooltipDot: 8,
	strokeWidth: 2,
	gridDash: "3 3",
	gridOpacity: 0.15,
	areaFillAlpha: 0.2,
} as const;

export function chartFontSize(face: ChartTypeFace): string {
	if (face === "legend") return CHART_TYPE.legendFontSize;
	if (face === "tooltipTitle") return CHART_TYPE.tooltipTitleSize;
	if (face === "tooltipBody") return CHART_TYPE.tooltipBodySize;
	return CHART_TYPE.axisFontSize;
}
export function chartTextStyle(face: ChartTypeFace): { fontSize: string } {
	return { fontSize: chartFontSize(face) };
}
export function chartTickStyle(face: ChartTypeFace = "axis"): { fontSize: string; fill: string } {
	return { fontSize: chartFontSize(face), fill: chartAxis };
}
export function getChartColor(index: number): string {
	return CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0];
}
export const AXIS_CONFIG = {
	get tick() {
		return chartTickStyle("axis");
	},
	axisLine: false as const,
	tickLine: false as const,
};
export function cartesianAxisProps(hidden = false) {
	return { hide: hidden, ...AXIS_CONFIG };
}
export const GRID_PROPS = {
	vertical: false as const,
	stroke: chartAxis,
	strokeOpacity: CHART_TYPE.gridOpacity,
	strokeDasharray: CHART_TYPE.gridDash,
};
export const BAR_RADIUS = {
	horizontal: [0, 4, 4, 0] as [number, number, number, number],
	vertical: [4, 4, 0, 0] as [number, number, number, number],
};
export const ANIMATION_PROPS = { isAnimationActive: false };
export const CHART_TOOLTIP_CURSOR_LINE = {
	stroke: chartAxis,
	strokeOpacity: 0.35,
	strokeWidth: 1,
} as const;
export const CHART_TOOLTIP_CURSOR_BAR = {
	fill: withAlpha("foreground", 0.06),
	stroke: "none",
} as const;

export function chartTooltipContentStyle(): {
	background: string;
	border: string;
	borderRadius: string;
	boxShadow: string;
	fontSize: string;
	color: string;
	padding: string;
} {
	return {
		background: "transparent",
		border: "none",
		borderRadius: "0",
		boxShadow: "none",
		fontSize: chartFontSize("tooltipBody"),
		color: "hsl(var(--basalt-foreground))",
		padding: "0",
	};
}

export function chartTooltipProps(options?: {
	formatter?: (value: number) => string;
	cursor?: "bar" | "line" | false;
	customTooltip?: (props: {
		active?: boolean;
		payload?: readonly ChartTooltipItem[];
		label?: string | number;
	}) => ReactNode;
}) {
	const cursor =
		options?.cursor === false
			? false
			: options?.cursor === "line"
				? CHART_TOOLTIP_CURSOR_LINE
				: CHART_TOOLTIP_CURSOR_BAR;
	return {
		isAnimationActive: false,
		animationDuration: 0,
		offset: 12,
		allowEscapeViewBox: { x: false, y: false },
		cursor,
		wrapperStyle: {
			outline: "none",
			zIndex: 40,
			pointerEvents: "none" as const,
			transition: "none",
			animation: "none",
		},
		contentStyle: chartTooltipContentStyle(),
		content: ((props: {
			active?: boolean;
			payload?: readonly ChartTooltipItem[];
			label?: unknown;
		}) => {
			if (options?.customTooltip) {
				return options.customTooltip({
					active: props.active,
					payload: props.payload,
					label: props.label as string | number | undefined,
				});
			}
			return createElement(ChartTooltipContent, {
				active: props.active,
				payload: props.payload,
				label: props.label as string | number | undefined,
				formatter: options?.formatter,
			});
		}) as never,
	};
}

export function seriesColor(
	series: ChartSeriesDescriptor | undefined,
	index: number,
): string | undefined {
	return series?.color ?? CHART_COLORS[index % CHART_COLORS.length];
}
export const RESPONSIVE_CONTAINER_PROPS = {
	width: "100%" as const,
	height: "100%" as const,
	minWidth: 0,
	minHeight: 0,
	debounce: 150,
};
export const CHART_PLOT_MARGIN = { top: 4, right: 4, bottom: 0, left: 0 } as const;
export const CHART_PLOT_MARGIN_BARE = { top: 2, right: 2, bottom: 2, left: 2 } as const;
