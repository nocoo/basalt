import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "../utils/cn";

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
				"sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-basalt-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-basalt-primary-foreground",
				className,
			)}
			{...props}
		>
			{children}
		</a>
	);
}

export function AppShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("flex h-screen w-full overflow-hidden bg-basalt-background", className)}
			{...props}
		/>
	);
}

export function AppMain({ className, ...props }: HTMLAttributes<HTMLElement>) {
	return (
		<main
			id="main-content"
			className={cn("flex h-full min-w-0 flex-1 flex-col overflow-hidden", className)}
			{...props}
		/>
	);
}
