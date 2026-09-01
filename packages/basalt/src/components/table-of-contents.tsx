import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export type TableOfContentsProps = {
	/**
	 * Accessible name and heading. Pass an empty string to hide the heading.
	 * @default "On this page"
	 */
	title?: string;
	/**
	 * Section items.
	 */
	children: ReactNode;
	/**
	 * Additional classes for the nav.
	 */
	className?: string;
};

export function TableOfContents({
	title = "On this page",
	children,
	className,
}: TableOfContentsProps) {
	return (
		<nav aria-label={title || "On this page"} className={cn("text-sm", className)}>
			{title ? (
				<p className="mb-3 text-xs font-semibold tracking-wide text-basalt-muted-foreground uppercase">
					{title}
				</p>
			) : null}
			<ul className="flex flex-col gap-2 border-l-2 border-basalt-border">{children}</ul>
		</nav>
	);
}

export type TableOfContentsItemProps = {
	/**
	 * Mark the current section.
	 * @default false
	 */
	active?: boolean;
	/**
	 * Optional in-page href. Renders a link when set.
	 */
	href?: string;
	/**
	 * Section label.
	 */
	children: ReactNode;
};

export function TableOfContentsItem({ active, href, children }: TableOfContentsItemProps) {
	const className = cn(
		"block border-l-2 py-0.5 pl-4",
		active
			? "border-basalt-primary font-medium text-basalt-foreground"
			: "border-transparent text-basalt-muted-foreground",
	);
	return (
		<li className="-ml-0.5">
			{href ? (
				<a href={href} aria-current={active ? "location" : undefined} className={className}>
					{children}
				</a>
			) : (
				<span className={className}>{children}</span>
			)}
		</li>
	);
}
