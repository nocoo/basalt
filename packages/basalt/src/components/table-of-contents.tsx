import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function TableOfContents({
	title = "On this page",
	children,
	className,
}: {
	title?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<nav aria-label={title} className={cn("text-sm", className)}>
			<p className="mb-3 text-xs font-semibold tracking-wide text-basalt-muted-foreground uppercase">
				{title}
			</p>
			<ul className="flex flex-col gap-2 border-l-2 border-basalt-border">{children}</ul>
		</nav>
	);
}

export function TableOfContentsItem({
	active,
	children,
}: {
	active?: boolean;
	children: ReactNode;
}) {
	return (
		<li className="-ml-0.5">
			<span
				className={cn(
					"block border-l-2 py-0.5 pl-4",
					active
						? "border-basalt-primary font-medium text-basalt-foreground"
						: "border-transparent text-basalt-muted-foreground",
				)}
			>
				{children}
			</span>
		</li>
	);
}
