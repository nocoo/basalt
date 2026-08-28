import { cloneElement, type ReactElement } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "../utils/cn";

export function ChartFrame({
	ariaLabel,
	className,
	children,
	size = "h-36 w-56",
}: {
	ariaLabel?: string;
	className?: string;
	children: ReactElement<{ accessibilityLayer?: boolean }>;
	size?: string;
}) {
	return (
		<div role="img" aria-label={ariaLabel} className={cn(size, "text-basalt-primary", className)}>
			<ResponsiveContainer width="100%" height="100%">
				{cloneElement(children, { accessibilityLayer: false })}
			</ResponsiveContainer>
		</div>
	);
}
