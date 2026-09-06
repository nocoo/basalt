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
	style,
	...props
}: GridProps & HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("grid gap-3", className)}
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
			className={cn(
				"flex items-center justify-center rounded-basalt-lg bg-basalt-secondary px-6 py-8 text-sm",
				className,
			)}
			{...props}
		/>
	);
}
