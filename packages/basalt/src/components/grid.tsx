import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Grid({
	className,
	columns = 2,
	...props
}: HTMLAttributes<HTMLDivElement> & { columns?: number }) {
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
