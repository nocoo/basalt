import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Sidebar({ className, ...props }: HTMLAttributes<HTMLElement>) {
	return (
		<aside
			className={cn(
				"flex h-full w-60 flex-col border-r border-basalt-border bg-basalt-background",
				className,
			)}
			{...props}
		/>
	);
}
