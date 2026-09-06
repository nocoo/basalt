import { cloneElement, type ReactElement, type ReactNode, useId } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "../utils/cn";
import { RESPONSIVE_CONTAINER_PROPS } from "./config";

export type ChartFrameProps = {
	/**
	 * Accessible label describing the purpose or dataset of the chart.
	 */
	ariaLabel: string;
	/**
	 * Additional CSS class names for styling the chart container.
	 */
	className?: string;
	/**
	 * Single child Recharts element to render inside the responsive container.
	 * Explicit child accessibilityLayer prop takes precedence over wrapper prop, which defaults to true.
	 */
	children: ReactElement<{
		accessibilityLayer?: boolean;
		"aria-label"?: string;
		"aria-describedby"?: string;
	}>;
	/**
	 * Tailwind size classes for the chart container.
	 * @default "h-36 w-56"
	 */
	size?: string;
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

export type ChartShellProps = ChartFrameProps & {
	/**
	 * Optional legend node rendered alongside the chart plot.
	 */
	legend?: ReactNode;
};

export type ChartAccessibilityProps = Pick<
	ChartFrameProps,
	"summary" | "dataAlternative" | "accessibilityLayer"
>;

function hasSlotContent(slot: ReactNode | undefined): boolean {
	return slot !== undefined && slot !== null && slot !== false;
}

function ChartContainer({
	ariaLabel,
	className,
	children,
	size = "h-36 w-56",
	legend,
	summary,
	dataAlternative,
	accessibilityLayer = true,
}: ChartShellProps) {
	const summaryId = useId();
	const hasSummary = hasSlotContent(summary);
	const hasAlternative = hasSlotContent(dataAlternative);

	const childProps = (children?.props ?? {}) as {
		accessibilityLayer?: boolean;
		"aria-label"?: string;
		"aria-describedby"?: string;
	};
	const childLayer = childProps.accessibilityLayer;
	const resolvedLayer = childLayer !== undefined ? childLayer : accessibilityLayer;

	const clonedChild = cloneElement(children, {
		accessibilityLayer: resolvedLayer,
		"aria-label": childProps["aria-label"] ?? ariaLabel,
		"aria-describedby": childProps["aria-describedby"] ?? (hasSummary ? summaryId : undefined),
	});

	let plotContainer: ReactNode;
	if (legend) {
		plotContainer = (
			<div
				data-testid="chart-shell"
				className={cn(size, className)}
				style={{ display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }}
			>
				<div className="min-h-0 w-full flex-1 basalt-chart [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-offset-2 [&_.recharts-surface:focus-visible]:outline-basalt-ring">
					<ResponsiveContainer {...RESPONSIVE_CONTAINER_PROPS}>{clonedChild}</ResponsiveContainer>
				</div>
				{legend}
			</div>
		);
	} else {
		plotContainer = (
			<div
				className={cn(
					size,
					"min-h-0 min-w-0 basalt-chart [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-offset-2 [&_.recharts-surface:focus-visible]:outline-basalt-ring",
					className,
				)}
			>
				<ResponsiveContainer {...RESPONSIVE_CONTAINER_PROPS}>{clonedChild}</ResponsiveContainer>
			</div>
		);
	}

	if (!hasSummary && !hasAlternative) {
		return (
			<figure role="group" aria-label={ariaLabel} className="contents m-0 p-0">
				{plotContainer}
			</figure>
		);
	}

	return (
		<figure
			role="group"
			aria-label={ariaLabel}
			aria-describedby={hasSummary ? summaryId : undefined}
			className="m-0 flex flex-col gap-2 p-0 min-h-0 min-w-0"
		>
			{hasSummary ? (
				<div id={summaryId} className="text-xs text-basalt-muted-foreground">
					{summary}
				</div>
			) : null}
			{plotContainer}
			{hasAlternative ? (
				<div className="text-xs text-basalt-muted-foreground">{dataAlternative}</div>
			) : null}
		</figure>
	);
}

export function ChartFrame(props: ChartFrameProps) {
	return <ChartContainer {...props} />;
}

export function ChartShell(props: ChartShellProps) {
	return <ChartContainer {...props} />;
}
