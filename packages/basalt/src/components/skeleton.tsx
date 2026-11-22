import { type CSSProperties, forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export type SkeletonVariant = "line" | "block" | "circle";

const VARIANT_CLASSES: Record<SkeletonVariant, string> = {
	line: "h-basalt-2 rounded-basalt-sm",
	block: "h-basalt-16 rounded-basalt-md",
	circle: "size-basalt-8 shrink-0 rounded-basalt-full",
};

function formatDimension(value: number | string | undefined): string | undefined {
	if (value === undefined) {
		return undefined;
	}
	return typeof value === "number" ? `${value}px` : value;
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Geometric preset of the skeleton placeholder.
	 * @default "line"
	 */
	variant?: SkeletonVariant;
	/**
	 * Explicit width as pixel number or CSS length string. Defaults to "100%" for line/block variants.
	 */
	width?: number | string;
	/**
	 * Explicit height as pixel number or CSS length string.
	 */
	height?: number | string;
	/**
	 * Display the shimmer sweep animation.
	 * @default true
	 */
	animate?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
	{ className, variant = "line", width, height, animate = true, style, ...props },
	ref,
) {
	const resolvedWidth = formatDimension(width) ?? (variant === "circle" ? undefined : "100%");
	const resolvedHeight = formatDimension(height);
	const mergedStyle: CSSProperties = {
		...(resolvedWidth !== undefined ? { width: resolvedWidth } : {}),
		...(resolvedHeight !== undefined ? { height: resolvedHeight } : {}),
		...style,
	};

	return (
		<div
			ref={ref}
			data-slot="skeleton"
			data-variant={variant}
			aria-hidden="true"
			className={cn("relative overflow-hidden bg-basalt-well", VARIANT_CLASSES[variant], className)}
			style={mergedStyle}
			{...props}
		>
			{animate ? (
				<span className="pointer-events-none absolute inset-0 animate-basalt-shimmer bg-gradient-to-r from-transparent via-basalt-foreground/10 to-transparent motion-reduce:animate-none" />
			) : null}
		</div>
	);
});
Skeleton.displayName = "Skeleton";
