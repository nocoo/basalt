import { cloneElement, type ReactElement, type ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "../utils/cn";
import { RESPONSIVE_CONTAINER_PROPS } from "./config";

export type ChartFrameProps = {
	ariaLabel: string;
	className?: string;
	children: ReactElement<{ accessibilityLayer?: boolean }>;
	size?: string;
};

export function ChartFrame({
	ariaLabel,
	className,
	children,
	size = "h-36 w-56",
}: ChartFrameProps) {
	return (
		<div
			role="img"
			aria-label={ariaLabel}
			className={cn(
				size,
				"min-h-0 min-w-0 basalt-chart outline-none [&_.recharts-layer]:outline-none [&_.recharts-rectangle]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none",
				className,
			)}
		>
			<ResponsiveContainer {...RESPONSIVE_CONTAINER_PROPS}>
				{cloneElement(children, { accessibilityLayer: false })}
			</ResponsiveContainer>
		</div>
	);
}

export function ChartShell({
	ariaLabel,
	className,
	children,
	size,
	legend,
}: ChartFrameProps & { legend?: ReactNode }) {
	if (!legend) {
		return (
			<ChartFrame ariaLabel={ariaLabel} className={className} size={size}>
				{children}
			</ChartFrame>
		);
	}
	return (
		<div
			data-testid="chart-shell"
			className={cn(size ?? "h-36 w-56", className)}
			style={{ display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }}
		>
			<ChartFrame ariaLabel={ariaLabel} className="min-h-0 w-full flex-1" size="">
				{children}
			</ChartFrame>
			{legend}
		</div>
	);
}
