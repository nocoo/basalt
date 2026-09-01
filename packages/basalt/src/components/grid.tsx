import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export type GridProps = {
	/**
	 * Number of equal columns.
	 * @default 2
	 */
	columns?: number;
	/**
	 * Additional classes for the grid.
	 */
	className?: string;
	children?: ReactNode;
};

export function Grid({
	className,
	columns = 2,
	...props
}: GridProps & HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("grid gap-3", className)}
			style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
			{...props}
		/>
	);
}

export function GridItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-basalt-lg bg-basalt-secondary px-6 py-8 text-sm",
				className,
			)}
			{...props}
		/>
	);
}
