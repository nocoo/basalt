import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function Flow({ className, children }: { className?: string; children: ReactNode }) {
	return <ol className={cn("flex items-center gap-3", className)}>{children}</ol>;
}

export function FlowNode({ children }: { children: ReactNode }) {
	return (
		<li className="rounded-basalt-md border border-basalt-border bg-basalt-secondary px-3 py-2 text-sm">
			{children}
		</li>
	);
}
