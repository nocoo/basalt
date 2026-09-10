import type { ComponentProps, ReactNode } from "react";

const HIDDEN_SERIES_KEYS = new Set(["y", "y2", "y3", "value", "target"]);
const TITLE_SIZE = 12;
const BODY_SIZE = 12;
const DOT_SIZE = 8;

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
	/**
	 * Series or metric name displayed beside the color dot.
	 * Preserves numeric `0` and React nodes; nullish values omit the label element.
	 */
	label?: ReactNode;
	/**
	 * Display value of the point or metric.
	 * Finite numbers are automatically formatted via `formatter` or `formatChartNumber`.
	 * `null` or `undefined` renders placeholder "—". ReactNode values are passed through.
	 */
	value?: ReactNode;
	/**
	 * Dot swatch indicator color. Defaults to `--basalt-chart-1`.
	 */
	color?: string;
	/**
	 * Optional unit suffix (e.g., "ms", "req/s", "%") rendered adjacent to valid values.
	 * Omitted when `value` evaluates to placeholder "—".
	 */
	unit?: ReactNode;
	/**
	 * Custom numeric value formatter overriding `formatChartNumber`.
	 */
	formatter?: (value: number) => string;
	/**
	 * When true, suppresses rendering of the decorative color dot.
	 * @default false
	 */
	hideIndicator?: boolean;
}

export interface ChartTooltipSummaryProps extends Omit<ComponentProps<"div">, "children"> {
	/**
	 * Summary row heading label.
	 * Preserves numeric `0` and custom nodes.
	 * @default "Total"
	 */
	label?: ReactNode;
	/**
	 * Aggregated metric value. Finite numbers are formatted; nullish renders "—".
	 */
	value?: ReactNode;
	/**
	 * Optional unit suffix appended to the summary value.
	 */
	unit?: ReactNode;
	/**
	 * Custom numeric formatter for the summary value.
	 */
	formatter?: (value: number) => string;
}

export interface ChartTooltipDividerProps extends Omit<ComponentProps<"hr">, "children"> {}

export function formatChartNumber(value: number): string {
	if (!Number.isFinite(value)) {
		return "—";
	}
	return new Intl.NumberFormat(undefined, {
		maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
	}).format(value);
}

function seriesLabel(item: ChartTooltipItem): string | undefined {
	const name = item.name == null ? "" : String(item.name);
	const key = item.dataKey == null ? "" : String(item.dataKey);
	if (HIDDEN_SERIES_KEYS.has(name) || HIDDEN_SERIES_KEYS.has(key)) {
		return undefined;
	}
	return name || undefined;
}

function seriesSwatch(item: ChartTooltipItem): string {
	return item.color ?? item.fill ?? item.stroke ?? "hsl(var(--basalt-chart-1))";
}

function formatTooltipValue(val: ReactNode, formatter?: (value: number) => string): ReactNode {
	if (val == null) {
		return "—";
	}
	if (typeof val === "number") {
		return formatter ? formatter(val) : formatChartNumber(val);
	}
	return val;
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
	const swatchColor = color ?? "hsl(var(--basalt-chart-1))";

	return (
		<div
			data-testid="chart-tooltip-row"
			style={{
				alignItems: "center",
				display: "flex",
				fontSize: BODY_SIZE,
				gap: 8,
				lineHeight: "20px",
				minWidth: 0,
				...style,
			}}
			{...rest}
		>
			{!hideIndicator ? (
				<span
					aria-hidden="true"
					style={{
						background: swatchColor,
						borderRadius: 999,
						boxShadow: "0 0 0 1px hsl(var(--basalt-popover-foreground) / 0.12)",
						flexShrink: 0,
						height: DOT_SIZE,
						width: DOT_SIZE,
					}}
				/>
			) : null}
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
					<span style={{ fontWeight: 400, marginLeft: 2 }}>{unit}</span>
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
				margin: "4px 0",
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
				gap: 8,
				lineHeight: "20px",
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
					<span style={{ fontWeight: 500, marginLeft: 2 }}>{unit}</span>
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
	if (!active || !payload?.length) {
		return null;
	}
	const format = formatter ?? formatChartNumber;
	const title = label == null || label === "" ? undefined : String(label);
	return (
		<div
			data-testid="chart-tooltip"
			style={{
				background: "hsl(var(--basalt-popover))",
				border: "1px solid hsl(var(--basalt-border) / 0.55)",
				borderRadius: 10,
				boxShadow: "0 12px 28px -8px rgb(0 0 0 / 0.28), 0 4px 10px -4px rgb(0 0 0 / 0.16)",
				color: "hsl(var(--basalt-popover-foreground))",
				maxWidth: 220,
				minWidth: 128,
				padding: "8px 12px",
			}}
		>
			{title ? (
				<p
					style={{
						color: "hsl(var(--basalt-popover-foreground))",
						fontSize: TITLE_SIZE,
						fontWeight: 600,
						letterSpacing: "-0.01em",
						lineHeight: 1.2,
						margin: "0 0 8px",
					}}
				>
					{title}
				</p>
			) : null}
			<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
				{payload.map((item, index) => {
					const raw = item.value;
					const numeric =
						typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
					const labelText = seriesLabel(item);
					const key = `${String(item.dataKey ?? item.name ?? index)}-${String(index)}`;
					return (
						<ChartTooltipRow
							key={key}
							label={labelText}
							color={seriesSwatch(item)}
							value={Number.isFinite(numeric) ? format(numeric) : String(raw ?? "—")}
							data-testid={undefined}
						/>
					);
				})}
			</div>
		</div>
	);
}
