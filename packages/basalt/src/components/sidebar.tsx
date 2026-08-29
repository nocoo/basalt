import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Sidebar({ className, ...props }: HTMLAttributes<HTMLElement>) {
	return (
		<aside
			className={cn(
				"flex h-full min-h-48 w-56 shrink-0 flex-col gap-1 bg-basalt-background p-3 text-sm text-basalt-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function ContentIsland({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"min-h-0 flex-1 overflow-y-auto rounded-[16px] bg-basalt-card p-3 text-basalt-card-foreground shadow-sm ring-1 ring-basalt-border/40 md:rounded-basalt-island md:p-5",
				className,
			)}
			{...props}
		/>
	);
}
