import { Bar, BarChart as RechartsBar, XAxis, YAxis } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/tooltip";
import { cn } from "../utils/cn";
import { ANIMATION_PROPS, BAR_RADIUS, cartesianAxisProps, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import { resolveChartSeries, type XYPoint, type XYSeriesDescriptor } from "./series";

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

export type SlotBarDataProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
};

export type SlotBarChartProps = SlotBarItemsProps | SlotBarDataProps;

export function SlotBarChart(props: SlotBarChartProps) {
	if ("items" in props) {
		const {
			ariaLabel = "Slot bar chart",
			heightClass = "h-6",
			gapClass = "gap-px",
			emptyClass = "bg-basalt-muted",
			className,
		} = props;
		return (
			<SlotItemBars
				items={props.items}
				ariaLabel={ariaLabel}
				heightClass={heightClass}
				gapClass={gapClass}
				emptyClass={emptyClass}
				className={className}
			/>
		);
	}
	const { series, ariaLabel = "Slot bar chart", className } = props;
	const bars = resolveChartSeries(series, ["y"]);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
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
	ariaLabel,
	heightClass,
	gapClass,
	emptyClass,
	className,
}: {
	items: SlotBarItem[];
	ariaLabel: string;
	heightClass: string;
	gapClass: string;
	emptyClass: string;
	className?: string;
}) {
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
