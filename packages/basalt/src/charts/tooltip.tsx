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
						<div
							key={key}
							style={{
								alignItems: "center",
								display: "flex",
								fontSize: BODY_SIZE,
								gap: 8,
								lineHeight: "20px",
								minWidth: 0,
							}}
						>
							<span
								aria-hidden="true"
								style={{
									background: seriesSwatch(item),
									borderRadius: 999,
									boxShadow: "0 0 0 1px hsl(var(--basalt-popover-foreground) / 0.12)",
									flexShrink: 0,
									height: DOT_SIZE,
									width: DOT_SIZE,
								}}
							/>
							{labelText ? (
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
									{labelText}
								</span>
							) : null}
							<span
								style={{
									color: "hsl(var(--basalt-popover-foreground))",
									flexShrink: 0,
									fontVariantNumeric: "tabular-nums",
									fontWeight: 600,
									marginLeft: labelText ? 0 : "auto",
								}}
							>
								{Number.isFinite(numeric) ? format(numeric) : String(raw ?? "—")}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
