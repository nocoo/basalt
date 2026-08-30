import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function SkeletonLine({
	className,
	minWidth = 30,
	maxWidth = 100,
	height,
	style,
	...props
}: HTMLAttributes<HTMLDivElement> & {
	minWidth?: number;
	maxWidth?: number;
	height?: number;
}) {
	const low = Math.min(minWidth, maxWidth);
	const high = Math.max(minWidth, maxWidth);
	const width = (low + high) / 2;
	const lineStyle: CSSProperties = {
		width: `${width}%`,
		...(height !== undefined ? { height } : {}),
		...style,
	};
	return (
		<div
			className={cn("relative h-2 overflow-hidden rounded-sm bg-basalt-muted", className)}
			style={lineStyle}
			aria-hidden="true"
			{...props}
		>
			<span className="pointer-events-none absolute inset-0 animate-basalt-shimmer bg-gradient-to-r from-transparent via-black/10 to-transparent motion-reduce:animate-none" />
		</div>
	);
}
