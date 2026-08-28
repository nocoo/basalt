import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Sidebar({ className, ...props }: HTMLAttributes<HTMLElement>) {
	return (
		<aside
			className={cn(
				"flex h-full min-h-48 w-56 flex-col gap-1 border-r border-basalt-border bg-basalt-popover p-3 text-sm text-basalt-foreground",
				className,
			)}
			{...props}
		/>
	);
}
