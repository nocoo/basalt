import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Grid({
	className,
	columns = 2,
	...props
}: HTMLAttributes<HTMLDivElement> & { columns?: number }) {
	return (
		<div
			className={cn("grid gap-2", className)}
			style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
			{...props}
		/>
	);
}

export function GridItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("rounded-basalt-md bg-basalt-muted p-3 text-center text-xs", className)}
			{...props}
		/>
	);
}
