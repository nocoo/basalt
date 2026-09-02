import { cloneElement, type ReactElement } from "react";
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
