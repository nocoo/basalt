import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Toolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"inline-flex items-center overflow-hidden rounded-basalt-md border border-basalt-border bg-basalt-secondary",
				className,
			)}
			{...props}
		/>
	);
}
