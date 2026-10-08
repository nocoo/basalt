import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

export function AppSkipLink({
	href = "#main-content",
	className,
	children,
	...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
	return (
		<a
			href={href}
			className={cn(
				BASALT_UI_CLASS,
				"sr-only focus:not-sr-only focus:absolute focus:top-basalt-2 focus:left-basalt-2 focus:z-[100] focus:rounded-basalt-md focus:bg-basalt-primary focus:px-basalt-space-lg focus:py-basalt-space-lg focus:text-basalt-base focus:font-medium focus:text-basalt-primary-foreground",
				className,
			)}
			{...props}
		>
			{children}
		</a>
	);
}

export function AppShell({
	layout = "workspace",
	className,
	...props
}: HTMLAttributes<HTMLDivElement> & {
	/** Scroll owner: bounded panes, document, or document below 768px. */
	layout?: "workspace" | "document" | "responsive";
}) {
	return (
		<div
			data-basalt-shell={layout}
			className={cn("flex w-full bg-basalt-background", className)}
			{...props}
		/>
	);
}

export function AppMain({ className, ...props }: HTMLAttributes<HTMLElement>) {
	return (
		<main
			id="main-content"
			tabIndex={-1}
			data-basalt-main=""
			className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}
			{...props}
		/>
	);
}
