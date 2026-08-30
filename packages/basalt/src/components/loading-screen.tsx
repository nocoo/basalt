import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { BasaltMark } from "./basalt-mark";

export function LoadingScreen({
	label = "Loading",
	mark,
	className,
	...props
}: HTMLAttributes<HTMLDivElement> & {
	label?: string;
	mark?: ReactNode;
}) {
	return (
		<div
			role="status"
			aria-label={label}
			className={cn(
				"fixed inset-0 z-50 flex items-center justify-center bg-basalt-background",
				className,
			)}
			{...props}
		>
			<div className="relative">
				<div className="flex h-72 w-72 items-center justify-center overflow-hidden rounded-full bg-basalt-secondary p-6 ring-1 ring-basalt-border">
					{mark ?? <BasaltMark className="h-28 w-28 text-basalt-muted-foreground" />}
				</div>
				<div className="absolute inset-[-4px] animate-basalt-spin rounded-full border-[3px] border-transparent border-t-basalt-primary motion-reduce:animate-none" />
			</div>
		</div>
	);
}
