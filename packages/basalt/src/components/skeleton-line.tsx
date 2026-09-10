import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export interface SkeletonLineProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Minimum width percentage used for deterministic width computation.
	 *
	 * Note: Averaged with maxWidth to compute the midpoint width percentage.
	 *
	 * @default 30
	 */
	minWidth?: number;

	/**
	 * Maximum width percentage used for deterministic width computation.
	 *
	 * Note: Averaged with minWidth to compute the midpoint width percentage.
	 *
	 * @default 100
	 */
	maxWidth?: number;

	/**
	 * Explicit height of the skeleton line in pixels.
	 *
	 * Note: When omitted, default height is governed by CSS class tokens (h-2).
	 */
	height?: number;
}

export function SkeletonLine({
	className,
	minWidth = 30,
	maxWidth = 100,
	height,
	style,
	...props
}: SkeletonLineProps) {
	const width = (minWidth + maxWidth) / 2;
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
