import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Code({ className, ...props }: HTMLAttributes<HTMLElement>) {
	return (
		<code
			className={cn(
				"rounded-basalt-sm bg-basalt-secondary px-1.5 py-0.5 font-mono text-[13px] text-basalt-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function CodeBlock({ className, ...props }: HTMLAttributes<HTMLPreElement>) {
	return (
		<pre
			className={cn(
				"overflow-x-auto rounded-basalt-md border border-basalt-border bg-basalt-secondary p-4 font-mono text-[13px] text-basalt-foreground",
				className,
			)}
			{...props}
		/>
	);
}
