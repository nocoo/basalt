import type { ReactNode } from "react";
import { Bar, BarChart as RechartsBar, XAxis, YAxis } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/tooltip";
import { cn } from "../utils/cn";
import { ANIMATION_PROPS, BAR_RADIUS, cartesianAxisProps, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import type { LineChartNumericKeys } from "./line";
import { type ChartSeriesDescriptor, resolveChartSeries, type XYPoint } from "./series";

export type SlotBarItem = {
	color: string;
	height?: number;
	label?: string;
};

export type SlotBarItemsProps = {
	items: SlotBarItem[];
	ariaLabel?: string;
	heightClass?: string;
	gapClass?: string;
	emptyClass?: string;
	className?: string;
};

export type SlotBarDataProps<
	TData extends { x: string | number } = XYPoint,
	K extends LineChartNumericKeys<TData> & string = LineChartNumericKeys<TData> & string,
> = {
	/**
	 * Dataset array where each record requires an `x` category or time coordinate.
	 * Any remaining fields with numeric, nullable, or optional number values are inferred as valid series keys.
	 */
	data: TData[];
	/**
	 * Series descriptors identifying which numeric keys to plot.
	 * Inferred strictly from numeric keys of `TData` (rejects non-numeric fields, `x`, and typos).
	 */
	series?: Array<ChartSeriesDescriptor<NoInfer<K>>>;
	ariaLabel?: string;
	className?: string;
	/**
	 * Textual summary describing key insights, highs, lows, and keyboard exploration instructions.
	 * Associated with the chart via useId and aria-describedby.
	 */
	summary?: ReactNode;
	/**
	 * Accessible tabular or structured data alternative rendered outside the plot area.
	 */
	dataAlternative?: ReactNode;
	/**
	 * Whether the interactive accessibility layer is enabled on the underlying Recharts graphic.
	 * Enables keyboard exploration with Tab and arrow keys where supported by the underlying chart type.
	 * Non-interactive compact or decorative charts without tooltip navigation should provide summary or dataAlternative.
	 * @default true
	 */
	accessibilityLayer?: boolean;
};

export type SlotBarChartProps<
	TData extends { x: string | number } = XYPoint,
	K extends LineChartNumericKeys<TData> & string = LineChartNumericKeys<TData> & string,
> = SlotBarItemsProps | SlotBarDataProps<TData, K>;

export function SlotBarChart<
	TData extends { x: string | number } = XYPoint,
	K extends LineChartNumericKeys<TData> & string = LineChartNumericKeys<TData> & string,
>(props: SlotBarChartProps<TData, K>) {
	if ("items" in props) {
		return <SlotItemBars {...props} />;
	}
	const {
		series,
		ariaLabel = "Slot bar chart",
		className,
		summary,
		dataAlternative,
		accessibilityLayer,
	} = props;
	const bars = resolveChartSeries(series, ["y" as K]);
	return (
		<ChartFrame
			ariaLabel={ariaLabel}
			className={className}
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		>
			<RechartsBar data={props.data}>
				<XAxis dataKey="x" {...cartesianAxisProps(true)} />
				<YAxis {...cartesianAxisProps(true)} />
				{bars.map((item, index) => (
					<Bar
						key={item.key}
						dataKey={item.key}
						name={item.label ?? item.key}
						fill={seriesColor(item, index)}
						radius={BAR_RADIUS.vertical}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsBar>
		</ChartFrame>
	);
}

function SlotItemBars({
	items,
	ariaLabel = "Slot bar chart",
	heightClass = "h-6",
	gapClass = "gap-px",
	emptyClass = "bg-basalt-muted",
	className,
}: SlotBarItemsProps) {
	if (items.length === 0) {
		return null;
	}
	const hasTooltips = items.some((item) => item.label);
	function renderBar(item: SlotBarItem) {
		const heightRatio = item.height ?? 1;
		const isEmpty = heightRatio <= 0;
		const isTailwindColor = item.color.startsWith("bg-");
		const heightPercent = isEmpty ? 100 : Math.max(heightRatio * 100, 10);
		return (
			<div
				className={cn(
					"w-full rounded-sm",
					isEmpty ? emptyClass : isTailwindColor ? item.color : undefined,
				)}
				style={{
					height: `${heightPercent}%`,
					...(isEmpty || isTailwindColor ? {} : { backgroundColor: item.color }),
				}}
				data-testid="slot-bar"
			/>
		);
	}
	const content = items.map((item, index) => {
		const bar =
			hasTooltips && item.label ? (
				<Tooltip>
					<TooltipTrigger asChild>{renderBar(item)}</TooltipTrigger>
					<TooltipContent side="top">
						<p>{item.label}</p>
					</TooltipContent>
				</Tooltip>
			) : (
				renderBar(item)
			);
		return (
			<div
				key={`${item.label ?? item.color}-${index}`}
				className="flex min-h-0 min-w-0 flex-1 items-end self-stretch"
			>
				{bar}
			</div>
		);
	});
	const container = (
		<div
			className={cn("flex w-full items-end", heightClass, gapClass, className)}
			role="img"
			aria-label={ariaLabel}
		>
			{content}
		</div>
	);
	if (hasTooltips) {
		return <TooltipProvider delayDuration={0}>{container}</TooltipProvider>;
	}
	return container;
}
