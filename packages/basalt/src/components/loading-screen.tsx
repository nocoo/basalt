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
			<div className="flex flex-col items-center gap-4">
				{mark ?? <BasaltMark className="h-8 w-8 text-basalt-foreground" />}
				<div
					className="relative h-px overflow-hidden rounded-full bg-basalt-border"
					style={{ width: "6rem" }}
				>
					<span
						className="absolute inset-0 animate-basalt-shimmer motion-reduce:animate-none"
						style={{
							background:
								"linear-gradient(to right, transparent, hsl(var(--basalt-foreground) / 0.5), transparent)",
						}}
					/>
				</div>
			</div>
		</div>
	);
}
