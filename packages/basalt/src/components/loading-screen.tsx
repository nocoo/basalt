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
			<div className="flex flex-col items-center gap-5">
				{mark ?? <BasaltMark className="h-8 w-8 text-basalt-foreground" />}
				<div className="relative h-px w-24 overflow-hidden rounded-full bg-basalt-border">
					<span className="absolute inset-0 animate-basalt-shimmer bg-gradient-to-r from-transparent via-basalt-foreground/50 to-transparent motion-reduce:animate-none" />
				</div>
			</div>
		</div>
	);
}
