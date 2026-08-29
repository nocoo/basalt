import { Bar, BarChart as RechartsBar, XAxis, YAxis } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/tooltip";
import { cn } from "../utils/cn";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export type SlotBarItem = {
	color: string;
	height?: number;
	label?: string;
};

export function SlotBarChart({
	data = SAMPLE,
	items,
	ariaLabel = "Slot bar chart",
	heightClass = "h-6",
	gapClass = "gap-px",
	emptyClass = "bg-basalt-muted",
	className,
}: {
	data?: XYPoint[];
	items?: SlotBarItem[];
	ariaLabel?: string;
	heightClass?: string;
	gapClass?: string;
	emptyClass?: string;
	className?: string;
}) {
	if (items) {
		return (
			<SlotItemBars
				items={items}
				ariaLabel={ariaLabel}
				heightClass={heightClass}
				gapClass={gapClass}
				emptyClass={emptyClass}
				className={className}
			/>
		);
	}
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data}>
				<XAxis dataKey="x" hide />
				<YAxis hide />
				<Bar dataKey="y" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
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
					"flex-1 rounded-sm",
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
		if (hasTooltips && item.label) {
			return (
				<Tooltip key={`${item.label}-${index}`}>
					<TooltipTrigger asChild>{renderBar(item)}</TooltipTrigger>
					<TooltipContent side="top">
						<p>{item.label}</p>
					</TooltipContent>
				</Tooltip>
			);
		}
		return <div key={`${item.color}-${index}`}>{renderBar(item)}</div>;
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
