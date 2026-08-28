import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function SkeletonLine({
	className,
	minWidth = 40,
	maxWidth,
	...props
}: HTMLAttributes<HTMLDivElement> & { minWidth?: number; maxWidth?: number }) {
	const width = maxWidth ?? minWidth;
	return (
		<div
			className={cn("h-3 rounded-basalt-sm bg-basalt-muted animate-pulse", className)}
			style={{ width }}
			aria-hidden="true"
			{...props}
		/>
	);
}
