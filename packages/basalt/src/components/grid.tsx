import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export type GridProps = {
	/**
	 * Number of equal columns.
	 * @default 2
	 */
	columns?: number;
	/** Space between layout items: 12, 16, 24 or 32px reference. @default "md" */
	gap?: "sm" | "md" | "lg" | "xl";
	/**
	 * Additional classes for the grid.
	 */
	className?: string;
	children?: ReactNode;
};

const GAP_CLASSES = {
	sm: "gap-basalt-layout-sm",
	md: "gap-basalt-layout",
	lg: "gap-basalt-layout-lg",
	xl: "gap-basalt-layout-xl",
} as const;

export function Grid({
	className,
	columns = 2,
	gap = "md",
	style,
	...props
}: GridProps & HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("grid", GAP_CLASSES[gap], className)}
			{...props}
			style={{
				gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
				...style,
			}}
		/>
	);
}

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {}

export function GridItem({ className, ...props }: GridItemProps) {
	return (
		<div
			data-basalt-surface=""
			className={cn(
				"flex items-center justify-center rounded-basalt-lg p-basalt-card text-basalt-base",
				className,
			)}
			{...props}
		/>
	);
}
