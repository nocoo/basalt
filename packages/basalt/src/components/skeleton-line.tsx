import { type CSSProperties, type HTMLAttributes, useMemo } from "react";
import { cn } from "../utils/cn";

function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

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
	const width = useMemo(() => {
		const low = Math.min(minWidth, maxWidth);
		const high = Math.max(minWidth, maxWidth);
		return low === high ? low : randomInt(low, high);
	}, [minWidth, maxWidth]);
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
